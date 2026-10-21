import { z } from "zod";
import { TEXT_DIRECTIONS } from "@/config/options";
import { isTemplateId } from "@/config/templates";
import { improveTextPrompt, recommendStylePrompt, suggestAccentsPrompt } from "@/lib/prompts";
import { demoAccents, demoDelay, demoImprove, demoRecommend } from "@/lib/server/demo";
import { generateJson } from "@/lib/server/gemini";
import { audienceSchema, cleanAccents, enumOf, optionalText, routeHandler, userText } from "@/lib/server/route";

export const maxDuration = 120;

const text = userText(3000, "Please type some text first.");

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.enum(["improve", "versions"]),
    text,
    direction: enumOf(TEXT_DIRECTIONS),
    brandVoice: optionalText(2000),
    audience: audienceSchema,
  }),
  z.object({ action: z.literal("accents"), text }),
  z.object({ action: z.literal("recommend"), text }),
]);

const versionsResult = z.object({
  versions: z.array(z.object({ text: z.string().min(1), accents: z.array(z.string()).default([]) })).min(1),
});
const accentsResult = z.object({ accents: z.array(z.string()) });
const recommendResult = z.object({ templateId: z.string(), reason: z.string().default("") });

export const POST = routeHandler(schema, async (body, demo) => {
  switch (body.action) {
    case "improve":
    case "versions": {
      const count = body.action === "versions" ? 3 : 1;
      if (demo) {
        await demoDelay(count === 3 ? 1400 : 900);
        return { versions: demoImprove(body.text, body.direction, count) };
      }
      const out = await generateJson(versionsResult, improveTextPrompt({ ...body, count }));
      return {
        versions: out.versions.slice(0, count).map((v) => ({ text: v.text, accents: cleanAccents(v.accents, v.text) })),
      };
    }
    case "accents": {
      if (demo) {
        await demoDelay(600);
        return { accents: demoAccents(body.text) };
      }
      const out = await generateJson(accentsResult, suggestAccentsPrompt(body), undefined, 0.3);
      return { accents: cleanAccents(out.accents, body.text) };
    }
    case "recommend": {
      if (demo) {
        await demoDelay(700);
        return demoRecommend(body.text);
      }
      const out = await generateJson(recommendResult, recommendStylePrompt(body), undefined, 0.3);
      return {
        templateId: isTemplateId(out.templateId) ? out.templateId : demoRecommend(body.text).templateId,
        reason: out.reason,
      };
    }
  }
});
