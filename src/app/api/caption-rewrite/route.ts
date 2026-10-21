import { z } from "zod";
import { CAPTION_MAX_CHARS, REWRITE_LENGTHS, REWRITE_STRENGTHS, TONES } from "@/config/options";
import { captionAnalyzePrompt, captionRewritePrompt } from "@/lib/prompts";
import { demoAnalyze, demoCaptionVersions, demoDelay } from "@/lib/server/demo";
import { generateJson } from "@/lib/server/gemini";
import { enumOf, routeHandler, userText } from "@/lib/server/route";

export const maxDuration = 120;

const schema = z.object({
  action: z.enum(["rewrite", "analyze", "versions"]),
  caption: userText(
    CAPTION_MAX_CHARS,
    "Please paste a caption first.",
    `Please keep your caption under ${CAPTION_MAX_CHARS.toLocaleString("en-US")} characters.`,
  ),
  tone: enumOf(TONES),
  strength: enumOf(REWRITE_STRENGTHS),
  length: enumOf(REWRITE_LENGTHS),
});

const versionsResult = z.object({ versions: z.array(z.string().min(1)).min(1) });
const analysisResult = z.object({
  hook: z.string(),
  mainMessage: z.string(),
  tone: z.string(),
  structure: z.string(),
  whyItWorks: z.array(z.string()),
  improvements: z.array(z.string()),
});

export const POST = routeHandler(schema, async (body, demo) => {
  if (body.action === "analyze") {
    if (demo) {
      await demoDelay();
      return { analysis: demoAnalyze(body.caption) };
    }
    const analysis = await generateJson(analysisResult, captionAnalyzePrompt(body), undefined, 0.4);
    return { analysis };
  }

  const count = body.action === "versions" ? 3 : 1;
  if (demo) {
    await demoDelay(count === 3 ? 1500 : 900);
    return { versions: demoCaptionVersions(body.caption, count, body.tone, body.strength, body.length) };
  }
  const result = await generateJson(versionsResult, captionRewritePrompt({ ...body, count }));
  return { versions: result.versions.slice(0, count) };
});
