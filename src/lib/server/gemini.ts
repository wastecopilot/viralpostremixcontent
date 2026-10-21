// Talks to Google Gemini. Only ever imported by server routes (src/app/api),
// so the API key never reaches the browser.

import type { z } from "zod";
import { GEMINI_API_BASE, models } from "@/config/models";

export function getApiKey(): string {
  return (process.env.GEMINI_API_KEY ?? "").trim();
}

/** Demo mode = no key in .env.local. Every AI button then returns sample results. */
export function isDemoMode(): boolean {
  return getApiKey() === "";
}

/** An error with a friendly message that is safe to show to the user. */
export class AiError extends Error {
  constructor(
    public readonly userMessage: string,
    public readonly status = 500,
  ) {
    super(userMessage);
  }
}

export interface InlineImage {
  mimeType: string;
  /** Base64 data without the "data:...;base64," prefix. */
  data: string;
}

export function parseDataUrl(dataUrl: string): InlineImage | null {
  const match = /^data:([\w/+.-]+);base64,(.+)$/s.exec(dataUrl);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

/** How long one try may take before we give up on it and try the backup model. */
const TEXT_TIMEOUT_MS = 50_000;
const IMAGE_TIMEOUT_MS = 55_000;
/** Total time we keep trying for one button press (server routes allow 120 s). */
const TOTAL_BUDGET_MS = 105_000;
/** Status we use for "no answer in time". */
const TIMED_OUT = 599;

function friendlyHttpError(status: number, body: string): AiError {
  if (status === TIMED_OUT) {
    return new AiError("The AI took too long to answer. Please try again in a moment.", 504);
  }
  const lower = body.toLowerCase();
  if (status === 400 && (lower.includes("api key") || lower.includes("api_key"))) {
    return new AiError("Your Gemini key was not accepted. Check the key in the .env.local file.", 401);
  }
  if (status === 401 || status === 403) {
    return new AiError("Your Gemini key does not have access to this AI model. Check the key in .env.local.", 403);
  }
  if (status === 429 && isNotInPlan(body)) {
    return new AiError(
      "Your Google Gemini plan doesn't include this (Google's free plan has no AI pictures). Turn on billing for your key in Google AI Studio, then try again. Everything else still works.",
      402,
    );
  }
  if (status === 429) {
    return new AiError("The AI is busy or your free Gemini limit was reached. Wait a minute and try again.", 429);
  }
  if (status >= 500) {
    return new AiError("Google's AI service had a hiccup. Please try again in a moment.", 502);
  }
  return new AiError("The AI could not handle this request. Try again or change the text a little.", 502);
}

/** True when the key's plan allows zero requests for this model (e.g. images on the free plan). */
function isNotInPlan(body: string): boolean {
  return /limit:\s*0\b/.test(body);
}

/** True when the model exists but must be called through the newer Interactions endpoint. */
function shouldTryInteractions(status: number, body: string): boolean {
  if (status === 404) return true;
  const lower = body.toLowerCase();
  return status === 400 && (lower.includes("not supported") || lower.includes("interactions"));
}

async function postJson(url: string, payload: unknown, timeoutMs: number): Promise<{ status: number; text: string }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": getApiKey() },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
    return { status: res.status, text: await res.text() };
  } catch (err) {
    if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) {
      return { status: TIMED_OUT, text: "No answer in time." };
    }
    throw new AiError("Could not reach Google's AI service. Check your internet connection.", 502);
  }
}

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

function asObject(value: Json | undefined): Record<string, Json> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

/** Collects text and image parts from either a generateContent or an Interactions response. */
function collectParts(root: Json): { text: string; images: InlineImage[]; blocked: boolean } {
  const texts: string[] = [];
  const images: InlineImage[] = [];
  let blocked = false;

  const rootObj = asObject(root);
  const promptFeedback = asObject(rootObj?.promptFeedback);
  if (promptFeedback?.blockReason) blocked = true;

  const visit = (node: Json | undefined, inThought: boolean) => {
    if (Array.isArray(node)) {
      node.forEach((child) => visit(child, inThought));
      return;
    }
    const obj = asObject(node);
    if (!obj) return;
    // Skip the user's own input if the response echoes it back.
    if (typeof obj.type === "string" && obj.type.includes("input")) return;
    const isThought = inThought || obj.thought === true || obj.type === "thought";
    if (obj.finishReason === "SAFETY" || obj.finishReason === "PROHIBITED_CONTENT") blocked = true;

    const inline = asObject(obj.inlineData) ?? asObject(obj.inline_data);
    if (inline && typeof inline.data === "string") {
      const mime = inline.mimeType ?? inline.mime_type;
      images.push({ mimeType: typeof mime === "string" ? mime : "image/png", data: inline.data });
    }
    if (obj.type === "image" && typeof obj.data === "string") {
      const mime = obj.mime_type ?? obj.mimeType;
      images.push({ mimeType: typeof mime === "string" ? mime : "image/png", data: obj.data });
    }
    if (!isThought && typeof obj.text === "string" && (obj.type === undefined || obj.type === "text")) {
      texts.push(obj.text);
    }
    for (const [key, value] of Object.entries(obj)) {
      if (key === "inlineData" || key === "inline_data" || key === "text" || key === "data") continue;
      // Skip echoed input in Interactions responses.
      if (key === "input") continue;
      visit(value, isThought);
    }
  };

  visit(rootObj?.candidates ?? rootObj?.steps ?? rootObj?.outputs ?? root, false);
  return { text: texts.join(""), images, blocked };
}

interface CallOptions {
  /** Models to try in order: the main one first, then the backup. */
  models: string[];
  prompt: string;
  images?: InlineImage[];
  wantJson?: boolean;
  wantImage?: boolean;
  aspectRatio?: string;
  temperature?: number;
}

/** Google answers with these when a model is busy, overloaded or slow for a moment. */
const BUSY_STATUSES = new Set([429, 500, 503, 504, TIMED_OUT]);

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Tries the main model; if it is busy (or missing) tries the backup;
 * if both are busy, waits a moment and tries the main model once more.
 */
async function callGemini(opts: CallOptions): Promise<{ text: string; images: InlineImage[] }> {
  if (isDemoMode()) throw new AiError("Demo mode is on (no Gemini key).", 400);

  const [main, backup] = opts.models;
  const plan = [main, backup, main].filter((m): m is string => Boolean(m));
  const timeoutMs = opts.wantImage ? IMAGE_TIMEOUT_MS : TEXT_TIMEOUT_MS;
  const missing = new Set<string>();
  const started = Date.now();
  let last = { status: 0, text: "" };

  for (let i = 0; i < plan.length; i++) {
    const model = plan[i];
    if (missing.has(model)) continue;
    if (i === 2) await wait(1500);
    const timeLeft = TOTAL_BUDGET_MS - (Date.now() - started);
    if (i > 0 && timeLeft < 10_000) break;
    last = await requestModel(model, opts, Math.min(timeoutMs, timeLeft));
    if (last.status === 200) return readResponse(last.text);
    console.error(`[gemini] ${model} failed with ${last.status}: ${last.text.slice(0, 500)}`);
    // Missing model, or not allowed at all on this plan: don't ask this model again.
    if (last.status === 404 || (last.status === 429 && isNotInPlan(last.text))) missing.add(model);
    // Wrong key, blocked request, bad input: trying again won't help.
    else if (!BUSY_STATUSES.has(last.status)) break;
  }
  throw friendlyHttpError(last.status, last.text);
}

async function requestModel(
  model: string,
  opts: CallOptions,
  timeoutMs: number,
): Promise<{ status: number; text: string }> {
  const parts = [
    ...(opts.images ?? []).map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.data } })),
    { text: opts.prompt },
  ];
  const generationConfig: Record<string, unknown> = {};
  if (opts.temperature !== undefined) generationConfig.temperature = opts.temperature;
  if (opts.wantJson) generationConfig.responseMimeType = "application/json";
  if (opts.wantImage) {
    generationConfig.responseModalities = ["TEXT", "IMAGE"];
    if (opts.aspectRatio) generationConfig.imageConfig = { aspectRatio: opts.aspectRatio };
  }

  const res = await postJson(
    `${GEMINI_API_BASE}/models/${encodeURIComponent(model)}:generateContent`,
    { contents: [{ role: "user", parts }], generationConfig },
    timeoutMs,
  );

  // Newer models may only be available through the Interactions endpoint.
  if (res.status !== 200 && shouldTryInteractions(res.status, res.text)) {
    const input = [
      ...(opts.images ?? []).map((img) => ({ type: "image", data: img.data, mime_type: img.mimeType })),
      { type: "text", text: opts.prompt },
    ];
    const payload: Record<string, unknown> = { model, input };
    if (opts.wantImage) {
      payload.response_format = {
        type: "image",
        mime_type: "image/png",
        ...(opts.aspectRatio ? { aspect_ratio: opts.aspectRatio } : {}),
      };
    }
    const second = await postJson(`${GEMINI_API_BASE}/interactions`, payload, timeoutMs);
    // Keep the first answer's error if the Interactions endpoint doesn't know the model either.
    return second.status === 404 ? res : second;
  }
  return res;
}

function readResponse(body: string): { text: string; images: InlineImage[] } {
  let parsed: Json;
  try {
    parsed = JSON.parse(body) as Json;
  } catch {
    throw new AiError("The AI sent back an answer we could not read. Please try again.", 502);
  }
  const { text, images, blocked } = collectParts(parsed);
  if (blocked && !text && images.length === 0) {
    throw new AiError("The AI declined this request. Try different wording or a different image.", 422);
  }
  return { text, images };
}

/** Pulls the first JSON object/array out of a model answer (handles ```json fences). */
function extractJson(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.search(/[[{]/);
    const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error("No JSON found");
  }
}

/** Asks the text model for JSON and checks it against a schema. Retries once if the answer is malformed. */
export async function generateJson<T>(
  schema: z.ZodType<T>,
  prompt: string,
  images?: InlineImage[],
  temperature = 0.8,
): Promise<T> {
  let lastProblem = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const fullPrompt =
      attempt === 0
        ? prompt
        : `${prompt}\n\nYour previous answer was not valid (${lastProblem}). Reply again with ONLY the JSON object in the exact shape requested.`;
    const { text } = await callGemini({
      models: [models.text, models.textBackup],
      prompt: fullPrompt,
      images,
      wantJson: true,
      temperature,
    });
    try {
      const result = schema.safeParse(extractJson(text));
      if (result.success) return result.data;
      lastProblem = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    } catch {
      lastProblem = "it was not JSON";
    }
    console.error(`[gemini] invalid JSON on attempt ${attempt + 1}: ${lastProblem}`);
  }
  throw new AiError("The AI's answer came back in the wrong shape. Please try again.", 502);
}

/** Creates one image and returns it as a data URL. */
export async function generateImage(prompt: string, aspectRatio: string): Promise<string> {
  const { images } = await callGemini({
    models: [models.image, models.imageBackup],
    prompt,
    wantImage: true,
    aspectRatio,
    temperature: 1,
  });
  const image = images[0];
  if (!image) {
    throw new AiError("The AI did not return an image this time. Please try again.", 502);
  }
  return `data:${image.mimeType};base64,${image.data}`;
}
