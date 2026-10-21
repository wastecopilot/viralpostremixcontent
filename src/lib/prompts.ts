// ─────────────────────────────────────────────────────────────
// ALL AI PROMPTS live in this file.
// Each function builds the instructions sent to Gemini for one button.
// ─────────────────────────────────────────────────────────────

import {
  CAPTION_GOALS,
  CAPTION_LENGTHS,
  CTA_OPTIONS,
  PINNED_GOALS,
  PLATFORMS,
  REWRITE_LENGTHS,
  REWRITE_STRENGTHS,
  TEXT_DIRECTIONS,
  TONES,
  VISUAL_DIRECTIONS,
  type CaptionGoal,
  type CaptionLength,
  type CtaOption,
  type ImageType,
  type PeopleOption,
  type PinnedGoal,
  type Platform,
  type RewriteLength,
  type RewriteStrength,
  type TextDirection,
  type Tone,
  type VisualDirection,
  type Option,
} from "@/config/options";
import { TEMPLATES } from "@/config/templates";

export interface AudienceInfo {
  name: string;
  who: string;
  problem: string;
  tone: string;
}

function label<T extends readonly Option[]>(list: T, value: string): string {
  return list.find((o) => o.value === value)?.label ?? value;
}

/** The rules every prompt follows. */
const GROUND_RULES = `GROUND RULES (always follow all of them):
- Keep the original meaning, but use fresh, original wording. Do not copy any run of 5 or more words from the source.
- Never claim someone else's personal story, experience, result or achievement as the user's own. If the source is someone else's first-person story, turn it into an observation, a lesson, or a neutral retelling ("Someone shared…", "A lot of people find…") instead of "I…".
- Never invent facts, numbers, statistics, names, dates, studies or quotes. If the source has no numbers, do not add any.
- Any numbers given as SOURCE FACTS must be kept exactly as written.
- Accent/emphasis words are visual only. They never mean a claim is verified or true.
- Use plain, everyday words. No hashtags. Do not add emojis unless the source already uses them.
- Return ONLY valid JSON in exactly the shape requested. No extra commentary.`;

const STRENGTH_GUIDE: Record<RewriteStrength, string> = {
  light: "Light rewrite: keep the same structure and order, but change the wording sentence by sentence.",
  moderate: "Moderate rewrite: rework the sentences and flow, keep the same core idea and key points.",
  aggressive: "Aggressive rewrite: rebuild it from the core idea up with a new structure, new hook and new angle.",
};

const TONE_GUIDE: Record<Tone, string> = {
  conversational: "Conversational: warm, natural, like talking to a friend.",
  direct: "Direct: short sentences, no fluff, straight to the point.",
  opinionated: "Opinionated: confident, takes a clear stance.",
  inspirational: "Inspirational: uplifting and encouraging, but not cheesy.",
  simple: "Simple: very easy words a 12-year-old understands.",
};

function voiceBlock(brandVoice?: string, audience?: AudienceInfo | null): string {
  const lines: string[] = [];
  if (brandVoice?.trim()) lines.push(`BRAND VOICE (write like this): ${brandVoice.trim()}`);
  if (audience) {
    lines.push(
      `AUDIENCE (write for this person): ${audience.name}. Who they are: ${audience.who || "not given"}. Their main problem: ${audience.problem || "not given"}. Preferred tone: ${audience.tone || "not given"}.`,
    );
  }
  return lines.length ? `\n${lines.join("\n")}\n` : "";
}

const TEMPLATE_LIST = TEMPLATES.map((t) => `- "${t.id}": ${t.name} — best for ${t.bestFor}`).join("\n");

// ── Mode 1: Remix a post ────────────────────────────────────

export function remixAnalyzePrompt(input: { tone: Tone; strength: RewriteStrength }): string {
  return `You are helping a creator remix a social media post that performed well.
Look at the attached screenshot of a post.

STEP 1 — Extract the main post text exactly as written: the text on the graphic and/or the post body.
Ignore app interface parts: like/comment/share counts, timestamps, buttons, menus, follower counts, and the original author's name and handle.

STEP 2 — Rewrite that text so the wording is the user's own.
${STRENGTH_GUIDE[input.strength]}
Tone: ${TONE_GUIDE[input.tone]}
Keep it about the same length as the original unless the original is very long (then keep it under 60 words, because it goes on a graphic).
Keep line breaks where they help reading.

STEP 3 — Pick the graphic style that best fits the rewritten text from this list:
${TEMPLATE_LIST}

STEP 4 — Pick 1 to 3 short words or phrases from the rewritten text to emphasise visually (they must appear exactly in the rewritten text).

${GROUND_RULES}

If you cannot find any readable post text in the image, set "extractedText" to "" and "rewrittenText" to "".

Return JSON: {"extractedText": string, "rewrittenText": string, "suggestedTemplate": string, "accents": string[]}`;
}

export function remixRewritePrompt(input: { text: string; tone: Tone; strength: RewriteStrength }): string {
  return `Rewrite this social media post text so the wording is original, for use on a graphic.
${STRENGTH_GUIDE[input.strength]}
Tone: ${TONE_GUIDE[input.tone]}
Keep it short enough for a graphic (under 60 words) unless the original is shorter.

${GROUND_RULES}

ORIGINAL TEXT:
"""${input.text}"""

Also pick 1 to 3 short words or phrases from your rewrite to emphasise visually (they must appear exactly in your text).

Return JSON: {"text": string, "accents": string[]}`;
}

// ── Mode 2: Rewrite a caption ───────────────────────────────

export function captionRewritePrompt(input: {
  caption: string;
  tone: Tone;
  strength: RewriteStrength;
  length: RewriteLength;
  count: 1 | 3;
}): string {
  const lengthGuide: Record<RewriteLength, string> = {
    same: "Keep about the same length as the original.",
    shorter: "Make it noticeably shorter (about 60% of the original length).",
    longer: "Make it a bit longer (about 130% of the original), by expanding existing points only — never add new facts.",
  };
  const versions =
    input.count === 3
      ? `Write 3 clearly different versions (different hooks and structure).\nReturn JSON: {"versions": [string, string, string]}`
      : `Return JSON: {"versions": [string]}`;
  return `Rewrite this social media caption so the wording is original while the message stays the same.
${STRENGTH_GUIDE[input.strength]}
Tone: ${TONE_GUIDE[input.tone]} (${label(TONES, input.tone)})
Length: ${lengthGuide[input.length]} (${label(REWRITE_LENGTHS, input.length)})
Keep paragraph breaks. Keep any lists as lists. ${label(REWRITE_STRENGTHS, input.strength)}.

${GROUND_RULES}

ORIGINAL CAPTION:
"""${input.caption}"""

${versions}`;
}

export function captionAnalyzePrompt(input: { caption: string }): string {
  return `Analyse why this social media caption works (or could work better). Use simple, everyday words.

CAPTION:
"""${input.caption}"""

${GROUND_RULES}

Return JSON:
{"hook": string (what the first line does to grab attention),
 "mainMessage": string (the core idea in one sentence),
 "tone": string (a few words),
 "structure": string (how it is built, in one or two sentences),
 "whyItWorks": string[] (3 short points),
 "improvements": string[] (3 short, practical suggestions)}`;
}

// ── Mode 4: Pinned comment ──────────────────────────────────

export function pinnedCommentPrompt(input: {
  context: string;
  source: string;
  goal: PinnedGoal;
  count: 1 | 3;
}): string {
  const goalGuide: Record<PinnedGoal, string> = {
    engagement: "Best engagement: a short, easy hook or question that makes people want to reply.",
    conversation: "Conversation starter: an open, friendly question anyone can answer in a few words.",
    context: "Add context: one or two sentences that add useful background, ending with a light question.",
    punchy: "Short & punchy: under 15 words, bold and quick.",
  };
  return `Turn a comment or statement into the creator's own pinned comment — a second hook under their post.
Goal: ${goalGuide[input.goal]} (${label(PINNED_GOALS, input.goal)})
Pinned comments should be short (under 40 words), easy to reply to, and start a second conversation.
Write in fresh words. Do not claim the original commenter's story or experience as the creator's own.

POST CONTEXT: ${input.context.trim() ? `"""${input.context}"""` : "(not given)"}
SOURCE COMMENT / STATEMENT:
"""${input.source}"""

${GROUND_RULES}

Return JSON: {"comments": [${input.count === 3 ? "string, string, string — 3 different options" : "string"}]}`;
}

// ── Mode 5: Graphic text ────────────────────────────────────

export function improveTextPrompt(input: {
  text: string;
  direction: TextDirection;
  count: 1 | 3;
  brandVoice?: string;
  audience?: AudienceInfo | null;
}): string {
  const direction =
    input.direction === "any"
      ? "Make it work better as on-image text for a social graphic: clear, scroll-stopping, easy to read."
      : `Direction: ${label(TEXT_DIRECTIONS, input.direction)}.`;
  return `Improve this text for a social media graphic (the words that go ON the image).
${direction}
Keep it short: ideally under 35 words. Use line breaks only where a natural pause helps.
${voiceBlock(input.brandVoice, input.audience)}
${GROUND_RULES}

TEXT:
"""${input.text}"""

For each version, also pick 1 to 3 words or short phrases to emphasise visually (they must appear exactly in that version).
${input.count === 3 ? "Write 3 clearly different versions." : "Write 1 version."}
Return JSON: {"versions": [{"text": string, "accents": string[]}]}`;
}

export function suggestAccentsPrompt(input: { text: string }): string {
  return `Pick the 1 to 3 most important words or very short phrases in this graphic text to emphasise visually (bold, in an accent colour).
Choose words that carry the emotion or the key idea. They must appear exactly (same spelling) in the text.
Emphasis is visual only; it never marks a claim as verified.

TEXT:
"""${input.text}"""

Return JSON: {"accents": string[]}`;
}

export function recommendStylePrompt(input: { text: string }): string {
  return `Pick the best graphic style for this on-image text. Choose exactly one id from the list.

STYLES:
${TEMPLATE_LIST}

TEXT:
"""${input.text}"""

Return JSON: {"templateId": string, "reason": string (one short sentence in simple words)}`;
}

// ── Caption + Pinned Comment (editor bottom card) ───────────

export type CaptionWant = "both" | "caption" | "captionVersions" | "pinned" | "pinnedVersions";

export function captionPrompt(input: {
  want: CaptionWant;
  graphicText: string;
  goal: CaptionGoal;
  length: CaptionLength;
  cta: CtaOption;
  platform: Platform;
  optimizeDiscussion: boolean;
  sourceFacts: string;
  existingCaption: string;
  brandVoice?: string;
  audience?: AudienceInfo | null;
}): string {
  const lengthGuide: Record<CaptionLength, string> = {
    short: "Short: 1 to 3 short sentences (under 50 words).",
    medium: "Medium: about 80 to 150 words, in short paragraphs.",
    long: "Long: about 200 to 350 words, in short paragraphs, story-like.",
  };
  const ctaGuide: Record<CtaOption, string> = {
    none: "No call to action.",
    soft: "End with a soft, low-pressure call to action (e.g. save this, share with a friend).",
    comment: "End by inviting people to comment with a simple answer.",
    link: "End by pointing people to a link (write 'link in comments' / 'link in bio' — do not invent a URL).",
    direct: "End with a clear, direct call to action to take the next step (do not invent prices or offers).",
  };
  const platformGuide: Record<Platform, string> = {
    facebook: "Facebook: conversational, short paragraphs, a strong first line.",
    instagram: "Instagram: strong first line, line breaks for easy reading, may end with up to 3 relevant hashtags only on Instagram.",
  };
  const asks: Record<CaptionWant, string> = {
    both: `Write 1 caption and 1 pinned comment.\nReturn JSON: {"captions": [string], "pinnedComments": [string]}`,
    caption: `Write 1 caption.\nReturn JSON: {"captions": [string], "pinnedComments": []}`,
    captionVersions: `Write 3 clearly different captions.\nReturn JSON: {"captions": [string, string, string], "pinnedComments": []}`,
    pinned: `Write 1 pinned comment.\nReturn JSON: {"captions": [], "pinnedComments": [string]}`,
    pinnedVersions: `Write 3 different pinned comments.\nReturn JSON: {"captions": [], "pinnedComments": [string, string, string]}`,
  };
  return `You write the caption and the pinned comment that go with a social media graphic.
The graphic earns attention, the caption expands the idea, and the pinned comment starts a second conversation.

GRAPHIC TEXT:
"""${input.graphicText || "(no graphic text yet)"}"""
${input.existingCaption.trim() ? `\nEXISTING CAPTION (improve on it, keep its meaning):\n"""${input.existingCaption}"""\n` : ""}${input.sourceFacts.trim() ? `\nSOURCE FACTS (use exactly as written, numbers unchanged):\n"""${input.sourceFacts}"""\n` : ""}
Caption job: ${label(CAPTION_GOALS, input.goal)}.
Length: ${lengthGuide[input.length]} (${label(CAPTION_LENGTHS, input.length)})
CTA: ${ctaGuide[input.cta]} (${label(CTA_OPTIONS, input.cta)})
Platform: ${platformGuide[input.platform]} (${label(PLATFORMS, input.platform)})
${input.optimizeDiscussion ? "Optimise for discussion: make it easy and natural for people to reply with their own view or experience." : ""}
Pinned comment: a short, easy question or hook (under 30 words) that opens a second conversation. It must not repeat the caption.
${voiceBlock(input.brandVoice, input.audience)}
${GROUND_RULES}

${asks[input.want]}`;
}

// ── Mode 6: Start with an idea ──────────────────────────────

export function ideaPrompt(input: { idea: string; brandVoice?: string; audience?: AudienceInfo | null }): string {
  return `Turn this rough idea into a complete social media post.

IDEA (rough notes, maybe spoken):
"""${input.idea}"""

Create:
1. "onImageText": the words for the graphic — short and scroll-stopping, under 30 words. Line breaks allowed.
2. "caption": a medium-length caption (80–150 words) that expands the idea in short paragraphs.
3. "pinnedComment": a short, easy question (under 25 words) that starts a second conversation.
4. "templateId": the best graphic style id from this list:
${TEMPLATE_LIST}
5. "accents": 1 to 3 words or short phrases from onImageText to emphasise (must appear exactly in it).

The idea is the user's own, so first person is fine — but do not add details, numbers or events they did not mention.
${voiceBlock(input.brandVoice, input.audience)}
${GROUND_RULES}

Return JSON: {"onImageText": string, "caption": string, "pinnedComment": string, "templateId": string, "accents": string[]}`;
}

// ── Mode 3: Caption → Image ─────────────────────────────────

export function captionImagePlanPrompt(input: {
  caption: string;
  imageType: ImageType;
  direction: VisualDirection;
  people: PeopleOption;
}): string {
  const typeGuide =
    input.imageType === "auto"
      ? `Decide the image type: "engagement" if the caption is an opinion, question, lesson or statement that would work as bold text on an image; otherwise "visual".`
      : `Image type is fixed: "${input.imageType}".`;
  return `Plan a complementary image for this Facebook caption. The caption itself stays unchanged.

CAPTION:
"""${input.caption}"""

${typeGuide}
Visual direction: ${label(VISUAL_DIRECTIONS, input.direction)}.
People: ${input.people === "auto" ? "decide what fits best" : input.people === "include" ? "include people" : "no people at all"}.

Write:
- "imagePrompt": a detailed description for an image generator (scene, subject, mood, lighting, colours, composition). The image must contain NO text, letters, numbers, logos, watermarks or brand names. Never depict a real, identifiable person. If the type is "engagement", leave a calm darker area in the lower half where text will be placed.
- "headline": short on-image text (under 14 words) taken only from the caption's meaning — fresh wording, no new facts. (Used only for engagement graphics.)
- "accents": 1 or 2 words from the headline to emphasise (must appear exactly in it).

${GROUND_RULES}

Return JSON: {"imageType": "visual" | "engagement", "imagePrompt": string, "headline": string, "accents": string[]}`;
}

/** The final instruction sent to the image model. */
export function imageModelPrompt(input: { plan: string; direction: VisualDirection; aspect: string }): string {
  const styleGuide: Record<VisualDirection, string> = {
    auto: "",
    photoreal: "Photorealistic photograph, natural light, realistic detail.",
    editorial: "Editorial magazine photography style, considered composition.",
    illustration: "Clean modern digital illustration.",
    conceptual: "Conceptual, symbolic image that expresses the idea through a metaphor.",
    lifestyle: "Lifestyle photography, candid and warm.",
    product: "Product-focused still life, studio lighting, clean background.",
  };
  return `${input.plan}
${styleGuide[input.direction]}
Aspect ratio ${input.aspect}. Absolutely no text, letters, captions, logos or watermarks anywhere in the image. Do not depict any real, identifiable person.`;
}

export function darkQuoteBackgroundPrompt(input: { variation: string; text: string }): string {
  return `Create an abstract, dark, moody background texture for a quote graphic.
Style: ${input.variation}. Subtle grain and soft light falloff, elegant and calm, mostly dark tones.
The centre must stay calm and dark so white text is easy to read on top.
${input.text.trim() ? `The mood should loosely match this quote's feeling (do NOT write it): "${input.text.slice(0, 200)}"` : ""}
Absolutely no text, letters, symbols, logos, faces or people.`;
}
