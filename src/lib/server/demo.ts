// DEMO MODE: realistic sample results used when there is no Gemini key yet.
// Nothing here calls the internet. Add your key to .env.local to get real AI.

import type { TemplateId } from "@/config/templates";
import type {
  CaptionLength,
  ImageType,
  PinnedGoal,
  RewriteLength,
  RewriteStrength,
  TextDirection,
  Tone,
} from "@/config/options";
import type { CaptionWant } from "@/lib/prompts";

export function demoDelay(ms = 900): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms + Math.round(Math.random() * 500)));
}

/** Simple, stable pseudo-random pick based on the input text. */
function pick<T>(list: readonly T[], seed: string, offset = 0): T {
  let hash = offset * 31;
  for (let i = 0; i < seed.length; i++) hash = (hash * 33 + seed.charCodeAt(i)) >>> 0;
  return list[hash % list.length];
}

const SWAPS: [RegExp, string][] = [
  [/\bI think\b/gi, "I've come to believe"],
  [/\bthe most important\b/gi, "the biggest"],
  [/\bnothing important\b/gi, "nothing that matters"],
  [/\bvery important\b/gi, "essential"],
  [/\bimportant\b/gi, "key"],
  [/\breally\b/gi, "truly"],
  [/\ba lot of\b/gi, "plenty of"],
  [/\blots of\b/gi, "plenty of"],
  [/\bpeople\b/gi, "folks"],
  [/\bstart\b/gi, "begin"],
  [/\bstarted\b/gi, "began"],
  [/\bhelp\b/gi, "support"],
  [/\bbig\b/gi, "huge"],
  [/\bbecause\b/gi, "since"],
  [/\bbut\b/g, "yet"],
  [/\blearned\b/gi, "figured out"],
  [/\bget\b/gi, "gain"],
  [/\bmake\b/gi, "create"],
  [/\bthings\b/gi, "stuff"],
  [/\bhappy\b/gi, "glad"],
  [/\bhard\b/gi, "tough"],
  [/\beasy\b/gi, "simple"],
  [/\bfast\b/gi, "quick"],
  [/\bfriends\b/gi, "the people close to you"],
  [/\bwork\b/gi, "effort"],
  [/\bnever\b/gi, "not once"],
  [/\balways\b/gi, "every single time"],
  [/\bstop\b/gi, "quit"],
  [/\bsuccess\b/gi, "real progress"],
  [/\bjust\b/gi, "simply"],
  [/\bvery\s+/gi, ""],
];

function keepCase(original: string, replacement: string): string {
  if (original[0] && original[0] === original[0].toUpperCase() && original[0] !== original[0].toLowerCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

function swapWords(text: string, howMany: number): string {
  let out = text;
  SWAPS.slice(0, howMany).forEach(([pattern, replacement]) => {
    out = out.replace(pattern, (m) => keepCase(m, replacement));
  });
  return out;
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const TONE_OPENERS: Record<Tone, string[]> = {
  conversational: ["Honestly?", "Here's the thing:", "Can we talk about this for a second?"],
  direct: ["Straight up:", "Simple truth:", "No fluff:"],
  opinionated: ["Unpopular opinion:", "I'll say it:", "Hot take:"],
  inspirational: ["Remember this:", "You've got this:", "A gentle reminder:"],
  simple: ["In short:", "Put simply:", "The idea is easy:"],
};

/** A believable "rewrite" made by swapping words and reshaping sentences. */
export function demoRewrite(text: string, strength: RewriteStrength = "moderate", tone: Tone = "conversational"): string {
  const clean = text.trim();
  if (!clean) return "";
  const swapped = swapWords(clean, strength === "light" ? 12 : SWAPS.length);
  if (strength === "light") return swapped;
  const parts = sentences(swapped);
  const opener = pick(TONE_OPENERS[tone], clean);
  if (strength === "moderate" || parts.length < 2) {
    return `${opener} ${parts.join(" ")}`.trim();
  }
  // Aggressive: lead with the last idea, then the rest.
  const last = parts[parts.length - 1].replace(/^(but|and|so|yet)\s+/i, "");
  return `${opener} ${last.charAt(0).toUpperCase()}${last.slice(1)}\n\n${parts.slice(0, -1).join(" ")}`.trim();
}

function shorten(text: string, maxWords: number): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(" ").replace(/[,;:]$/, "")}…`;
}

const STOP = new Set(
  "the a an and or but if then so to of in on at for with from by is are was were be been it this that these those you your i me my we our they them their he she his her not no do does did have has had just more most very can will would should could about into over than what when where who why how all any some one".split(
    " ",
  ),
);

export function demoAccents(text: string, max = 2): string[] {
  const words = (text.match(/[A-Za-z][A-Za-z'’-]*/g) ?? []).filter((w) => !STOP.has(w.toLowerCase()) && w.length > 3);
  const sorted = [...new Set(words)].sort((a, b) => b.length - a.length);
  return sorted.slice(0, max);
}

// ── Mode 1 ──────────────────────────────────────────────────

const SAMPLE_SCREENSHOT_TEXT =
  "Nobody tells you this, but the fastest way to grow is to stop saying yes to everything.\nYour time is the only thing you can't get back.";

export function demoRemixAnalyze(tone: Tone, strength: RewriteStrength) {
  const rewritten =
    strength === "light"
      ? "Few people mention it, yet the quickest way to grow is to quit saying yes to everything.\nTime is the one thing you never get back."
      : strength === "moderate"
        ? "Growth sped up the moment I got picky about my yeses.\nYour hours are the one thing that never comes back."
        : "Every yes costs you an hour you'll never see again.\nGuard your time like it's the only thing you own.";
  const withTone = tone === "opinionated" ? `Unpopular opinion: ${rewritten}` : rewritten;
  return {
    extractedText: SAMPLE_SCREENSHOT_TEXT,
    rewrittenText: withTone,
    suggestedTemplate: "personal-thought" as TemplateId,
    accents: strength === "aggressive" ? ["your time"] : ["saying yes", "time"].filter((a) => withTone.toLowerCase().includes(a)),
  };
}

// ── Mode 2 ──────────────────────────────────────────────────

export function demoCaptionVersions(
  caption: string,
  count: 1 | 3,
  tone: Tone,
  strength: RewriteStrength,
  length: RewriteLength,
): string[] {
  const make = (s: RewriteStrength, t: Tone) => {
    let out = demoRewrite(caption, s, t);
    if (length === "shorter") {
      const words = caption.split(/\s+/).length;
      out = shorten(out, Math.max(12, Math.round(words * 0.6)));
    } else if (length === "longer") {
      out = `${out}\n\nIf this hits home, you're not alone — a lot of us are figuring this out one step at a time.`;
    }
    return out;
  };
  if (count === 1) return [make(strength, tone)];
  return [
    make(strength, tone),
    make(strength === "light" ? "moderate" : "aggressive", "direct"),
    make("aggressive", tone === "inspirational" ? "conversational" : "inspirational"),
  ];
}

export function demoAnalyze(caption: string) {
  const first = sentences(caption)[0] ?? caption.slice(0, 80);
  const words = caption.split(/\s+/).filter(Boolean).length;
  return {
    hook: `The first line — "${shorten(first, 14)}" — makes a clear promise, so people stop scrolling to find out more.`,
    mainMessage: shorten(sentences(caption).slice(-1)[0] ?? first, 25),
    tone: words > 120 ? "Personal, story-driven and reflective" : "Short, direct and relatable",
    structure:
      words > 120
        ? "It opens with a hook, builds through a short story, and ends with a lesson the reader can use."
        : "A quick hook followed by one clear point — easy to read in a few seconds.",
    whyItWorks: [
      "It talks about a feeling many people share, so readers see themselves in it.",
      "The wording is simple, so it is easy to read on a phone.",
      "It ends on an idea people want to agree or disagree with — that drives comments.",
    ],
    improvements: [
      "Make the first line even shorter so the hook lands faster.",
      "Add one concrete, true detail from your own experience.",
      "End with a simple question so people know how to reply.",
    ],
  };
}

// ── Mode 4 ──────────────────────────────────────────────────

const PINNED_SAMPLES: Record<PinnedGoal, string[]> = {
  engagement: [
    "Be honest — which part of this did you learn the hard way? 👇",
    "What's one thing you'd add to this? I'm reading every reply.",
    "Agree or disagree? I want to hear the other side too.",
  ],
  conversation: [
    "What's the best advice you've ever ignored (and later wished you'd followed)?",
    "How would you explain this to someone just starting out?",
    "When did this finally click for you?",
  ],
  context: [
    "A bit of context: this is a pattern a lot of people describe, not a one-off. Have you noticed it too?",
    "Quick note — the point isn't perfection, it's direction. Where are you on this right now?",
    "Adding some background: this applies to work and life alike. Which one is harder for you?",
  ],
  punchy: ["Hard truth. Agree?", "Read that twice.", "Who needed this today?"],
};

export function demoPinned(source: string, goal: PinnedGoal, count: 1 | 3): string[] {
  const list = PINNED_SAMPLES[goal];
  if (count === 3) return [...list];
  return [pick(list, source)];
}

// ── Mode 5 ──────────────────────────────────────────────────

function applyDirection(text: string, direction: TextDirection, variant: number): string {
  const base = demoRewrite(text, variant === 0 ? "light" : "moderate", "direct").replace(/^(Straight up:|Simple truth:|No fluff:)\s*/, "");
  const parts = sentences(base);
  switch (direction) {
    case "shorter":
      return shorten(parts[0] ?? base, 14);
    case "clearer":
      return parts.slice(0, 2).join("\n");
    case "conversational":
      return `Can we be honest for a second?\n${base}`;
    case "hook":
      return `${pick(["Nobody talks about this:", "This changed everything for me:", "Read this before you scroll:"], text, variant)}\n${base}`;
    case "relatable":
      return `If you've ever felt this, you're not alone.\n${base}`;
    case "contrarian":
      return `Everyone says the opposite. But ${base.charAt(0).toLowerCase()}${base.slice(1)}`;
    case "emotional":
      return `${base}\nAnd that's okay.`;
    case "punchline":
      return `${base}\nPlot twist: it was never about luck.`;
    case "question":
      return `What if ${base.replace(/[.!]+$/, "").charAt(0).toLowerCase()}${base.replace(/[.!]+$/, "").slice(1)}?`;
    case "contrast":
      return `What I used to think: it had to be perfect.\nWhat I know now: ${base.charAt(0).toLowerCase()}${base.slice(1)}`;
    default:
      return variant === 2 ? `${pick(["Remember this:", "Here's the truth:"], text)}\n${base}` : base;
  }
}

export function demoImprove(text: string, direction: TextDirection, count: 1 | 3) {
  const variants = count === 3 ? [0, 1, 2] : [1];
  return variants.map((v) => {
    const out = applyDirection(text, direction === "any" && v === 2 ? "hook" : direction, v);
    return { text: out, accents: demoAccents(out) };
  });
}

export function demoRecommend(text: string): { templateId: TemplateId; reason: string } {
  const t = text.trim();
  const words = t.split(/\s+/).filter(Boolean).length;
  if (t.endsWith("?")) return { templateId: "question-card", reason: "Your text is a question, so a centered question card makes it pop." };
  if (/\b(but|used to|now|before|after)\b/i.test(t) && t.includes("\n"))
    return { templateId: "contrast-statement", reason: "Your text has a before-and-after shape, perfect for a contrast layout." };
  if (/^["“]|["”]$/.test(t)) return { templateId: "dark-quote", reason: "It reads like a quote, so a classic quote card fits." };
  if (words <= 12) return { templateId: "big-statement", reason: "It's short and strong — big letters will stop the scroll." };
  if (words > 45) return { templateId: "reddit-story", reason: "It's a longer story, which reads well in a story-style card." };
  return { templateId: "personal-thought", reason: "It sounds like a personal thought, so a clean profile card fits best." };
}

// ── Caption + pinned comment ────────────────────────────────

function demoCaptionText(graphicText: string, length: CaptionLength, variant: number, sourceFacts: string): string {
  const idea = shorten(graphicText.replace(/\n+/g, " ").trim() || "small changes add up", 18);
  const facts = sourceFacts.trim() ? `\n\n${sourceFacts.trim()}` : "";
  const openers = [
    `${idea}`,
    "I didn't believe this at first.",
    "Here's something I wish someone had told me sooner.",
  ];
  const short = `${openers[variant % 3]}\n\nThe smallest shifts usually make the biggest difference.`;
  if (length === "short") return `${short}${facts}`;
  const medium = `${openers[variant % 3]}\n\nFor a long time I thought progress meant doing more. More tasks, more hours, more yeses.\n\nBut the real change came from doing less — and doing it on purpose.\n\nThat's the idea behind this post: ${idea.charAt(0).toLowerCase()}${idea.slice(1)}${facts}\n\nWhat would change for you if you tried this for one week?`;
  if (length === "medium") return medium;
  return `${medium}\n\nHere's how it usually plays out. At first it feels uncomfortable, like you're leaving something on the table. Then you notice you have more energy for the things that actually matter.\n\nYou start finishing what you begin. Your focus sharpens. People notice that you're calmer.\n\nIt's not magic. It's just choosing what deserves your attention — and letting the rest go.`;
}

export function demoCaption(
  want: CaptionWant,
  graphicText: string,
  length: CaptionLength,
  sourceFacts: string,
): { captions: string[]; pinnedComments: string[] } {
  const pinned = [
    "What's one thing you'd add to this?",
    "Be honest — have you tried this, or is it still on your list?",
    "Which part hit closest to home for you?",
  ];
  switch (want) {
    case "both":
      return { captions: [demoCaptionText(graphicText, length, 0, sourceFacts)], pinnedComments: [pick(pinned, graphicText)] };
    case "caption":
      return { captions: [demoCaptionText(graphicText, length, 1, sourceFacts)], pinnedComments: [] };
    case "captionVersions":
      return { captions: [0, 1, 2].map((v) => demoCaptionText(graphicText, length, v, sourceFacts)), pinnedComments: [] };
    case "pinned":
      return { captions: [], pinnedComments: [pick(pinned, graphicText, 1)] };
    case "pinnedVersions":
      return { captions: [], pinnedComments: pinned };
  }
}

// ── Mode 6 ──────────────────────────────────────────────────

export function demoIdea(idea: string) {
  const firstSentence = (sentences(idea)[0] ?? idea).replace(/^(so|well|okay|ok|um|uh|and)[, ]+/i, "");
  // Long rambling sentence: keep the part before the first comma.
  const clause = firstSentence.split(/\s+/).length > 14 ? firstSentence.split(",")[0] : firstSentence;
  const core = shorten(clause, 16).replace(/[.!…,]+$/, "");
  const onImageText = `${core.charAt(0).toUpperCase()}${core.slice(1)}.\nBest decision I made this year.`;
  return {
    onImageText,
    caption: `${core.charAt(0).toUpperCase()}${core.slice(1)}.\n\nIt sounds small, but it changed how my whole week feels.\n\nI used to think every opportunity was one I couldn't miss. Now I ask one question first: does this move me toward what matters?\n\nIf the answer is no, it's a no — kindly, but clearly.\n\nWhat's one thing you'd say no to if you knew nobody would be upset?`,
    pinnedComment: "What's one small 'yes' you're ready to turn into a 'no'?",
    templateId: demoRecommend(onImageText).templateId === "big-statement" ? ("big-statement" as TemplateId) : ("personal-thought" as TemplateId),
    accents: demoAccents(onImageText, 2),
  };
}

// ── Mode 3 ──────────────────────────────────────────────────

export function demoCaptionImagePlan(caption: string, imageType: ImageType) {
  const resolved: "visual" | "engagement" =
    imageType === "auto" ? (/[?!]|\b(I|you|we)\b/i.test(caption) ? "engagement" : "visual") : imageType;
  // Use the first short sentence of the caption as the graphic text.
  const short = sentences(caption).find((s) => s.split(/\s+/).length <= 16);
  const headline = (short ?? caption.split(/\s+/).slice(0, 12).join(" ")).replace(/[.!,;:]+$/, "") || "Small steps still move you forward";
  return {
    imageType: resolved,
    imagePrompt: "Demo placeholder gradient",
    headline,
    accents: demoAccents(headline, 1),
  };
}

const GRADIENTS: [string, string, string][] = [
  ["#1E1B4B", "#7C3AED", "#F472B6"],
  ["#0F172A", "#0EA5E9", "#A7F3D0"],
  ["#1C1917", "#EA580C", "#FDE68A"],
  ["#052E16", "#16A34A", "#BEF264"],
  ["#172554", "#6366F1", "#FBCFE8"],
];

/** A soft gradient picture used instead of an AI image in demo mode. */
export function demoImage(aspect: string, seed: string, dark = false): string {
  const [w, h] = aspect === "1:1" ? [1080, 1080] : aspect === "9:16" ? [1080, 1920] : [1080, 1350];
  const [a, b, c] = dark ? (["#0B0B0C", "#2A2A2E", "#4A4A50"] as const) : pick(GRADIENTS, seed);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="0.55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>
<radialGradient id="r1" cx="0.25" cy="0.3" r="0.5"><stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
<radialGradient id="r2" cx="0.8" cy="0.75" r="0.45"><stop offset="0" stop-color="${c}" stop-opacity="0.6"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>
</defs>
<rect width="100%" height="100%" fill="url(#g)"/>
<rect width="100%" height="100%" fill="url(#r1)"/>
<rect width="100%" height="100%" fill="url(#r2)"/>
<circle cx="${w * 0.72}" cy="${h * 0.32}" r="${w * 0.16}" fill="#ffffff" fill-opacity="0.12"/>
<circle cx="${w * 0.3}" cy="${h * 0.7}" r="${w * 0.24}" fill="#ffffff" fill-opacity="0.06"/>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
