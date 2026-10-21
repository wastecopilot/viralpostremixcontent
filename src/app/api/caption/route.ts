import { z } from "zod";
import { CAPTION_GOALS, CAPTION_LENGTHS, CTA_OPTIONS, PLATFORMS } from "@/config/options";
import { captionPrompt } from "@/lib/prompts";
import { demoCaption, demoDelay } from "@/lib/server/demo";
import { AiError, generateJson } from "@/lib/server/gemini";
import { audienceSchema, enumOf, optionalText, routeHandler } from "@/lib/server/route";

export const maxDuration = 120;

const schema = z.object({
  want: z.enum(["both", "caption", "captionVersions", "pinned", "pinnedVersions"]),
  graphicText: optionalText(3000),
  goal: enumOf(CAPTION_GOALS),
  length: enumOf(CAPTION_LENGTHS),
  cta: enumOf(CTA_OPTIONS),
  platform: enumOf(PLATFORMS),
  optimizeDiscussion: z.boolean(),
  sourceFacts: optionalText(3000),
  existingCaption: optionalText(15000),
  brandVoice: optionalText(2000),
  audience: audienceSchema,
});

const result = z.object({
  captions: z.array(z.string()).default([]),
  pinnedComments: z.array(z.string()).default([]),
});

export const POST = routeHandler(schema, async (body, demo) => {
  if (!body.graphicText.trim() && !body.existingCaption.trim() && !body.sourceFacts.trim()) {
    throw new AiError("Please add your graphic text first, so the caption has something to expand on.", 400);
  }
  if (demo) {
    await demoDelay(body.want.endsWith("Versions") ? 1400 : 1000);
    return demoCaption(body.want, body.graphicText, body.length, body.sourceFacts);
  }
  const out = await generateJson(result, captionPrompt(body));
  const needCaption = body.want === "both" || body.want.startsWith("caption");
  const needPinned = body.want === "both" || body.want.startsWith("pinned");
  if ((needCaption && out.captions.length === 0) || (needPinned && out.pinnedComments.length === 0)) {
    throw new AiError("The AI's answer was incomplete. Please try again.", 502);
  }
  return { captions: out.captions.filter(Boolean), pinnedComments: out.pinnedComments.filter(Boolean) };
});
