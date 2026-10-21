import { z } from "zod";
import { isTemplateId } from "@/config/templates";
import { ideaPrompt } from "@/lib/prompts";
import { demoDelay, demoIdea, demoRecommend } from "@/lib/server/demo";
import { generateJson } from "@/lib/server/gemini";
import { audienceSchema, cleanAccents, optionalText, routeHandler, userText } from "@/lib/server/route";

export const maxDuration = 120;

const schema = z.object({
  idea: userText(5000, "Please type or say your idea first."),
  brandVoice: optionalText(2000),
  audience: audienceSchema,
});

const result = z.object({
  onImageText: z.string().min(1),
  caption: z.string().min(1),
  pinnedComment: z.string().min(1),
  templateId: z.string(),
  accents: z.array(z.string()).default([]),
});

export const POST = routeHandler(schema, async (body, demo) => {
  if (demo) {
    await demoDelay(1600);
    return demoIdea(body.idea);
  }
  const out = await generateJson(result, ideaPrompt(body));
  return {
    onImageText: out.onImageText,
    caption: out.caption,
    pinnedComment: out.pinnedComment,
    templateId: isTemplateId(out.templateId) ? out.templateId : demoRecommend(out.onImageText).templateId,
    accents: cleanAccents(out.accents, out.onImageText),
  };
});
