import { z } from "zod";
import { DARK_QUOTE_VARIATIONS, IMAGE_TYPES, PEOPLE_OPTIONS, VISUAL_DIRECTIONS } from "@/config/options";
import { captionImagePlanPrompt, darkQuoteBackgroundPrompt, imageModelPrompt } from "@/lib/prompts";
import { demoCaptionImagePlan, demoDelay, demoImage } from "@/lib/server/demo";
import { generateImage, generateJson } from "@/lib/server/gemini";
import { cleanAccents, enumOf, optionalText, routeHandler, userText } from "@/lib/server/route";

export const maxDuration = 120;

const schema = z.discriminatedUnion("purpose", [
  z.object({
    purpose: z.literal("captionImage"),
    caption: userText(15000, "Please paste your Facebook caption first."),
    imageType: enumOf(IMAGE_TYPES),
    direction: enumOf(VISUAL_DIRECTIONS),
    people: enumOf(PEOPLE_OPTIONS),
    aspect: z.enum(["4:5", "1:1"]),
  }),
  z.object({
    purpose: z.literal("darkQuoteBackground"),
    variation: enumOf(DARK_QUOTE_VARIATIONS),
    text: optionalText(3000),
    aspect: z.enum(["4:5", "1:1", "9:16"]),
  }),
]);

const plan = z.object({
  imageType: z.enum(["visual", "engagement"]),
  imagePrompt: z.string().min(1),
  headline: z.string().default(""),
  accents: z.array(z.string()).default([]),
});

export const POST = routeHandler(schema, async (body, demo) => {
  if (body.purpose === "darkQuoteBackground") {
    if (demo) {
      await demoDelay(1500);
      return { image: demoImage(body.aspect, body.text, true) };
    }
    const label = DARK_QUOTE_VARIATIONS.find((v) => v.value === body.variation)?.label ?? body.variation;
    const image = await generateImage(darkQuoteBackgroundPrompt({ variation: label, text: body.text }), body.aspect);
    return { image };
  }

  if (demo) {
    await demoDelay(2000);
    const p = demoCaptionImagePlan(body.caption, body.imageType);
    return { ...p, image: demoImage(body.aspect, body.caption) };
  }
  const p = await generateJson(plan, captionImagePlanPrompt(body), undefined, 0.8);
  const imageType = body.imageType === "auto" ? p.imageType : body.imageType;
  const image = await generateImage(
    imageModelPrompt({ plan: p.imagePrompt, direction: body.direction, aspect: body.aspect }),
    body.aspect,
  );
  return {
    imageType,
    imagePrompt: p.imagePrompt,
    headline: p.headline,
    accents: cleanAccents(p.accents, p.headline),
    image,
  };
});
