// Shared helpers for the AI server routes: read + check the request, catch errors,
// and always answer with friendly messages.

import { NextResponse } from "next/server";
import { z } from "zod";
import type { Option } from "@/config/options";
import { AiError, isDemoMode } from "./gemini";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Builds a zod enum from an options list in src/config/options.ts. */
export function enumOf<const T extends readonly Option[]>(list: T) {
  const values = list.map((o) => o.value) as [T[number]["value"], ...T[number]["value"][]];
  return z.enum(values);
}

/** Text typed by the user, with friendly error messages. */
export function userText(max: number, emptyMessage: string, tooLongMessage?: string) {
  return z
    .string()
    .trim()
    .min(1, emptyMessage)
    .max(max, tooLongMessage ?? `That text is too long. Please keep it under ${max.toLocaleString("en-US")} characters.`);
}

export function optionalText(max: number) {
  return z.string().max(max, `That text is too long. Please keep it under ${max.toLocaleString("en-US")} characters.`).default("");
}

export const audienceSchema = z
  .object({
    name: z.string().max(200),
    who: z.string().max(1000),
    problem: z.string().max(1000),
    tone: z.string().max(200),
  })
  .nullable()
  .optional();

const FRIENDLY_PREFIXES = ["Please", "That", "Your", "Add", "Paste", "Type", "Upload"];

/**
 * Wraps a route: parses JSON, checks it against the schema, runs the work,
 * and turns any problem into a friendly message.
 */
export function routeHandler<S extends z.ZodType>(
  schema: S,
  work: (body: z.output<S>, demo: boolean) => Promise<Record<string, unknown>>,
) {
  return async function POST(req: Request) {
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return jsonError("We could not read your request. Please refresh the page and try again.", 400);
    }
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "";
      const friendly = FRIENDLY_PREFIXES.some((p) => message.startsWith(p))
        ? message
        : "Some settings look wrong. Please refresh the page and try again.";
      return jsonError(friendly, 400);
    }
    try {
      const demo = isDemoMode();
      const result = await work(parsed.data, demo);
      return NextResponse.json({ ...result, demo });
    } catch (err) {
      if (err instanceof AiError) return jsonError(err.userMessage, err.status);
      console.error("[api] unexpected error", err);
      return jsonError("Something went wrong on our side. Please try again.", 500);
    }
  };
}

/** Keeps only accent words that really appear in the text. */
export function cleanAccents(accents: string[] | undefined, text: string): string[] {
  const lower = text.toLowerCase();
  return [...new Set((accents ?? []).map((a) => a.trim()).filter((a) => a && lower.includes(a.toLowerCase())))].slice(0, 5);
}
