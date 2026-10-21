import { z } from "zod";
import { PINNED_GOALS } from "@/config/options";
import { pinnedCommentPrompt } from "@/lib/prompts";
import { demoDelay, demoPinned } from "@/lib/server/demo";
import { generateJson } from "@/lib/server/gemini";
import { enumOf, optionalText, routeHandler, userText } from "@/lib/server/route";

export const maxDuration = 120;

const schema = z.object({
  context: optionalText(5000),
  source: userText(5000, "Please paste the comment or statement first."),
  goal: enumOf(PINNED_GOALS),
  count: z.union([z.literal(1), z.literal(3)]),
});

const result = z.object({ comments: z.array(z.string().min(1)).min(1) });

export const POST = routeHandler(schema, async (body, demo) => {
  if (demo) {
    await demoDelay();
    return { comments: demoPinned(body.source, body.goal, body.count) };
  }
  const out = await generateJson(result, pinnedCommentPrompt(body));
  return { comments: out.comments.slice(0, body.count) };
});
