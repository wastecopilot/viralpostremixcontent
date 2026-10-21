// ─────────────────────────────────────────────────────────────
// THE 19 GRAPHIC STYLES (templates), in the order they appear.
// The drawing code for each one lives in src/components/graphic/.
// ─────────────────────────────────────────────────────────────

export const TEMPLATE_IDS = [
  "personal-thought",
  "contrast-statement",
  "centered-observation",
  "minimal-dark",
  "minimal-light",
  "punchline-emphasis",
  "big-statement",
  "viral-headline",
  "question-card",
  "branded-two-image",
  "dark-profile-statement",
  "reddit-story",
  "breaking-news-circle",
  "handwritten-note",
  "dark-quote",
  "bold-white-quote",
  "typewriter-quote",
  "clean-white-quote",
  "vintage-cream-quote",
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

/** Which layout family a template belongs to. */
export type TemplateKind =
  | "profileLeft"
  | "profileCenter"
  | "viralHeadline"
  | "brandedTwoImage"
  | "reddit"
  | "breakingNews"
  | "handwritten"
  | "darkQuote"
  | "quote";

/** Items in the checklist under the live preview. */
export type CheckId = "text" | "fit" | "photo" | "username" | "main" | "img1" | "img2";

export interface TemplateDef {
  id: TemplateId;
  name: string;
  kind: TemplateKind;
  /** Default background color. */
  background: string;
  /** Biggest text size (in pixels on the 1080-wide graphic). Text shrinks from here to fit. */
  maxFontSize: number;
  align: "left" | "center";
  /** Checklist rows shown under the live preview. */
  checks: CheckId[];
  /** How many extra images the template needs (main image, or image 1 + image 2). */
  images: 0 | 1 | 2;
  /** True when the "Font" chips in the Look card apply to this template. */
  usesLookFont: boolean;
  /** Plain description, used when the AI recommends a style. */
  bestFor: string;
}

const FULL: CheckId[] = ["text", "fit", "photo", "username"];
const QUOTE_ONLY: CheckId[] = ["text", "fit"];

export const TEMPLATES: TemplateDef[] = [
  { id: "personal-thought", name: "Personal Thought", kind: "profileLeft", background: "#2F3A52", maxFontSize: 84, align: "left", checks: FULL, images: 0, usesLookFont: true, bestFor: "a personal reflection or lesson in first person" },
  { id: "contrast-statement", name: "Contrast Statement", kind: "profileLeft", background: "#0F1626", maxFontSize: 80, align: "left", checks: FULL, images: 0, usesLookFont: true, bestFor: "a before/after or 'they say X, but Y' contrast where the last line is the payoff" },
  { id: "centered-observation", name: "Centered Observation", kind: "profileCenter", background: "#1F2328", maxFontSize: 84, align: "center", checks: FULL, images: 0, usesLookFont: true, bestFor: "a short, calm observation about life or work" },
  { id: "minimal-dark", name: "Minimal Dark", kind: "profileLeft", background: "#000000", maxFontSize: 88, align: "left", checks: FULL, images: 0, usesLookFont: true, bestFor: "a bold, simple statement in a tweet-like style" },
  { id: "minimal-light", name: "Minimal Light", kind: "profileLeft", background: "#FFFFFF", maxFontSize: 88, align: "left", checks: FULL, images: 0, usesLookFont: true, bestFor: "a clean, friendly statement in a tweet-like style on white" },
  { id: "punchline-emphasis", name: "Punchline Emphasis", kind: "profileLeft", background: "#FFFFFF", maxFontSize: 84, align: "left", checks: FULL, images: 0, usesLookFont: true, bestFor: "a setup followed by a punchline on the last line" },
  { id: "big-statement", name: "Big Statement", kind: "profileLeft", background: "#0B1A3F", maxFontSize: 120, align: "left", checks: FULL, images: 0, usesLookFont: true, bestFor: "a very short, strong one-liner (under 15 words)" },
  { id: "viral-headline", name: "Viral Headline", kind: "viralHeadline", background: "#000000", maxFontSize: 84, align: "center", checks: ["text", "fit", "photo", "username", "main"], images: 1, usesLookFont: true, bestFor: "a news-style headline that goes with a strong photo" },
  { id: "question-card", name: "Question Card", kind: "profileCenter", background: "#121C38", maxFontSize: 96, align: "center", checks: FULL, images: 0, usesLookFont: true, bestFor: "a question asked to the audience" },
  { id: "branded-two-image", name: "Branded Two-Image Story", kind: "brandedTwoImage", background: "#FFFFFF", maxFontSize: 76, align: "left", checks: ["text", "fit", "photo", "username", "img1", "img2"], images: 2, usesLookFont: true, bestFor: "a story with two photos, like before/after or then/now" },
  { id: "dark-profile-statement", name: "Dark Profile Statement", kind: "profileLeft", background: "#000000", maxFontSize: 86, align: "left", checks: FULL, images: 0, usesLookFont: true, bestFor: "a confident personal statement with a strong profile" },
  { id: "reddit-story", name: "Reddit Story", kind: "reddit", background: "#1A1514", maxFontSize: 68, align: "left", checks: FULL, images: 0, usesLookFont: true, bestFor: "a longer story, confession or 'today I learned' style post" },
  { id: "breaking-news-circle", name: "Breaking News Circle", kind: "breakingNews", background: "#5F666B", maxFontSize: 80, align: "left", checks: ["text", "fit", "img1", "img2"], images: 2, usesLookFont: true, bestFor: "a news update or announcement with photos" },
  { id: "handwritten-note", name: "Handwritten Note", kind: "handwritten", background: "#F3ECDC", maxFontSize: 112, align: "left", checks: FULL, images: 0, usesLookFont: false, bestFor: "a warm, personal note or heartfelt message" },
  { id: "dark-quote", name: "Dark Quote", kind: "darkQuote", background: "#1C1C1C", maxFontSize: 88, align: "center", checks: FULL, images: 0, usesLookFont: false, bestFor: "a timeless quote or deep thought" },
  { id: "bold-white-quote", name: "Bold White Quote", kind: "quote", background: "#FFFFFF", maxFontSize: 92, align: "center", checks: QUOTE_ONLY, images: 0, usesLookFont: false, bestFor: "a punchy quote in bold letters" },
  { id: "typewriter-quote", name: "Typewriter Quote", kind: "quote", background: "#FFFFFF", maxFontSize: 76, align: "center", checks: QUOTE_ONLY, images: 0, usesLookFont: false, bestFor: "a raw, honest thought that feels typed out" },
  { id: "clean-white-quote", name: "Clean White Quote", kind: "quote", background: "#FFFFFF", maxFontSize: 84, align: "center", checks: QUOTE_ONLY, images: 0, usesLookFont: false, bestFor: "a simple, minimal quote" },
  { id: "vintage-cream-quote", name: "Vintage Cream Quote", kind: "quote", background: "#F5EEDD", maxFontSize: 76, align: "center", checks: QUOTE_ONLY, images: 0, usesLookFont: false, bestFor: "a romantic, nostalgic or classic quote" },
];

export const TEMPLATE_MAP: Record<TemplateId, TemplateDef> = Object.fromEntries(
  TEMPLATES.map((t) => [t.id, t]),
) as Record<TemplateId, TemplateDef>;

export function isTemplateId(value: unknown): value is TemplateId {
  return typeof value === "string" && (TEMPLATE_IDS as readonly string[]).includes(value);
}

/** Quote-style templates that get the "Show branding" card. */
export const QUOTE_CARD_IDS: TemplateId[] = [
  "bold-white-quote",
  "typewriter-quote",
  "clean-white-quote",
  "vintage-cream-quote",
];
