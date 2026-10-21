import { z } from "zod";
import { REWRITE_STRENGTHS, TONES } from "@/config/options";
import { isTemplateId } from "@/config/templates";
import { remixAnalyzePrompt, remixRewritePrompt } from "@/lib/prompts";
import { demoAccents, demoDelay, demoRemixAnalyze, demoRewrite } from "@/lib/server/demo";
import { AiError, generateJson, parseDataUrl } from "@/lib/server/gemini";
import { cleanAccents, enumOf, routeHandler, userText } from "@/lib/server/route";

export const maxDuration = 120;

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("analyze"),
    image: z.string().min(1, "Please upload the post screenshot first.").max(12_000_000, "That image is too big. Please use a smaller screenshot."),
    tone: enumOf(TONES),
    strength: enumOf(REWRITE_STRENGTHS),
  }),
  z.object({
    action: z.literal("rewrite"),
    text: userText(3000, "Please add some text to rewrite."),
    tone: enumOf(TONES),
    strength: enumOf(REWRITE_STRENGTHS),
  }),
]);

const analyzeResult = z.object({
  extractedText: z.string(),
  rewrittenText: z.string(),
  suggestedTemplate: z.string(),
  accents: z.array(z.string()).default([]),
});

const rewriteResult = z.object({ text: z.string().min(1), accents: z.array(z.string()).default([]) });

export const POST = routeHandler(schema, async (body, demo) => {
  if (body.action === "analyze") {
    if (demo) {
      await demoDelay(1400);
      return demoRemixAnalyze(body.tone, body.strength);
    }
    const image = parseDataUrl(body.image);
    if (!image) throw new AiError("Please upload a PNG or JPG screenshot.", 400);
    const result = await generateJson(analyzeResult, remixAnalyzePrompt(body), [image], 0.7);
    if (!result.extractedText.trim()) {
      throw new AiError("We couldn't find any readable text in that image. Try a clearer screenshot of the post.", 422);
    }
    return {
      extractedText: result.extractedText,
      rewrittenText: result.rewrittenText,
      suggestedTemplate: isTemplateId(result.suggestedTemplate) ? result.suggestedTemplate : "personal-thought",
      accents: cleanAccents(result.accents, result.rewrittenText),
    };
  }

  if (demo) {
    await demoDelay();
    const text = demoRewrite(body.text, body.strength, body.tone);
    return { text, accents: demoAccents(text) };
  }
  const result = await generateJson(rewriteResult, remixRewritePrompt(body));
  return { text: result.text, accents: cleanAccents(result.accents, result.text) };
});
