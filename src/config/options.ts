// ─────────────────────────────────────────────────────────────
// ALL DROPDOWN, CHIP AND CARD OPTIONS live in this file.
// Change a label here and it changes everywhere in the app.
// ─────────────────────────────────────────────────────────────

export interface Option<V extends string = string> {
  value: V;
  label: string;
  description?: string;
}

function opts<const T extends readonly Option[]>(list: T): T {
  return list;
}

export type ValueOf<T extends readonly Option[]> = T[number]["value"];

// ── The six mode cards on /remix ────────────────────────────
export const MODES = opts([
  { value: "remix", label: "Remix a post", description: "Upload a post that worked and make it yours." },
  { value: "caption", label: "Rewrite a caption", description: "Paste a caption or long post. No image needed." },
  { value: "captionImage", label: "Caption → Image", description: "Paste a Facebook post and create its complementary visual." },
  { value: "pinned", label: "Pinned comment", description: "Turn a Reddit comment or statement into your pinned comment." },
  { value: "ownText", label: "Start with my own text", description: "Type a thought, question or headline and pick a graphic style." },
  { value: "idea", label: "Start with an idea", description: "Type or say your idea. Get on-image text, caption, pinned comment and a recommended template." },
] as const);
export type ModeId = ValueOf<typeof MODES>;

// ── Rewriting ───────────────────────────────────────────────
export const TONES = opts([
  { value: "conversational", label: "Conversational" },
  { value: "direct", label: "Direct" },
  { value: "opinionated", label: "Opinionated" },
  { value: "inspirational", label: "Inspirational" },
  { value: "simple", label: "Simple" },
] as const);
export type Tone = ValueOf<typeof TONES>;

export const REWRITE_STRENGTHS = opts([
  { value: "light", label: "Light rewrite", description: "Same structure, fresh wording." },
  { value: "moderate", label: "Moderate rewrite", description: "Reworked sentences, same idea." },
  { value: "aggressive", label: "Aggressive rewrite", description: "Rebuilt from the core idea up." },
] as const);
export type RewriteStrength = ValueOf<typeof REWRITE_STRENGTHS>;

export const REWRITE_LENGTHS = opts([
  { value: "same", label: "Keep similar length" },
  { value: "shorter", label: "Shorter" },
  { value: "longer", label: "Longer" },
] as const);
export type RewriteLength = ValueOf<typeof REWRITE_LENGTHS>;

export const CAPTION_MAX_CHARS = 15000;

// ── Caption → Image ─────────────────────────────────────────
export const IMAGE_TYPES = opts([
  { value: "auto", label: "Auto (Recommended)" },
  { value: "visual", label: "Visual Only" },
  { value: "engagement", label: "Engagement Graphic" },
] as const);
export type ImageType = ValueOf<typeof IMAGE_TYPES>;

export const VISUAL_DIRECTIONS = opts([
  { value: "auto", label: "Auto" },
  { value: "photoreal", label: "Photo-real" },
  { value: "editorial", label: "Editorial" },
  { value: "illustration", label: "Illustration" },
  { value: "conceptual", label: "Conceptual" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "product", label: "Product-focused" },
] as const);
export type VisualDirection = ValueOf<typeof VISUAL_DIRECTIONS>;

export const PEOPLE_OPTIONS = opts([
  { value: "auto", label: "Auto" },
  { value: "include", label: "Include people" },
  { value: "none", label: "No people" },
] as const);
export type PeopleOption = ValueOf<typeof PEOPLE_OPTIONS>;

export const IMAGE_ASPECTS = opts([
  { value: "4:5", label: "Facebook Feed · 4:5" },
  { value: "1:1", label: "Square · 1:1" },
] as const);
export type ImageAspect = ValueOf<typeof IMAGE_ASPECTS>;

// ── Pinned comment ──────────────────────────────────────────
export const PINNED_GOALS = opts([
  { value: "engagement", label: "Best engagement" },
  { value: "conversation", label: "Conversation starter" },
  { value: "context", label: "Add context" },
  { value: "punchy", label: "Short & punchy" },
] as const);
export type PinnedGoal = ValueOf<typeof PINNED_GOALS>;

// ── Graphic editor: text ────────────────────────────────────
export const TEXT_DIRECTIONS = opts([
  { value: "any", label: "Any" },
  { value: "shorter", label: "Make shorter" },
  { value: "clearer", label: "Make clearer" },
  { value: "conversational", label: "More conversational" },
  { value: "hook", label: "Stronger hook" },
  { value: "relatable", label: "More relatable" },
  { value: "contrarian", label: "More contrarian" },
  { value: "emotional", label: "More emotional" },
  { value: "punchline", label: "Add a punchline" },
  { value: "question", label: "Turn into a question" },
  { value: "contrast", label: "Create a contrast" },
] as const);
export type TextDirection = ValueOf<typeof TEXT_DIRECTIONS>;

// ── Graphic editor: identity ────────────────────────────────
export const BADGE_OPTIONS = opts([
  { value: "off", label: "Off" },
  { value: "brand", label: "Brand badge" },
] as const);
export type BadgeOption = ValueOf<typeof BADGE_OPTIONS>;

// ── Graphic editor: look ────────────────────────────────────
export const BACKGROUND_OPTIONS = opts([
  { value: "default", label: "Style default" },
  { value: "navy", label: "Dark Navy" },
  { value: "black", label: "Black" },
  { value: "white", label: "White" },
  { value: "brand", label: "Brand color" },
  { value: "custom", label: "Custom" },
] as const);
export type BackgroundOption = ValueOf<typeof BACKGROUND_OPTIONS>;

/** Colors used by the background chips (except Style default / Brand color / Custom). */
export const BACKGROUND_COLORS: Record<"navy" | "black" | "white", string> = {
  navy: "#0B1A3F",
  black: "#000000",
  white: "#FFFFFF",
};

export const FONT_OPTIONS = opts([
  { value: "clean", label: "Clean Sans" },
  { value: "bold", label: "Bold Sans" },
  { value: "heavy", label: "Heavy Statement" },
  { value: "editorial", label: "Editorial" },
] as const);
export type FontOption = ValueOf<typeof FONT_OPTIONS>;

export const SIZE_OPTIONS = opts([
  { value: "4:5", label: "4:5 feed" },
  { value: "1:1", label: "1:1 square" },
  { value: "9:16", label: "9:16 story" },
] as const);
export type SizeOption = ValueOf<typeof SIZE_OPTIONS>;

/** Export size in pixels for each size option (always 1080 wide). */
export const SIZE_PIXELS: Record<SizeOption, { width: number; height: number }> = {
  "4:5": { width: 1080, height: 1350 },
  "1:1": { width: 1080, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
};

// ── Accent words ────────────────────────────────────────────
export const ACCENT_COLORS = [
  { value: "yellow", label: "Yellow", onDark: "#FACC15", onLight: "#CA8A04" },
  { value: "red", label: "Red", onDark: "#F87171", onLight: "#DC2626" },
  { value: "green", label: "Green", onDark: "#4ADE80", onLight: "#16A34A" },
  { value: "blue", label: "Blue", onDark: "#60A5FA", onLight: "#2563EB" },
  { value: "purple", label: "Purple", onDark: "#C084FC", onLight: "#7C3AED" },
  { value: "highlight", label: "Highlighter", onDark: "#FACC15", onLight: "#FDE047" },
] as const;
export type AccentColor = (typeof ACCENT_COLORS)[number]["value"];

// ── Dark Quote look ─────────────────────────────────────────
export const DARK_QUOTE_VARIATIONS = opts([
  { value: "charcoal", label: "Charcoal Texture" },
  { value: "midnight", label: "Midnight Blue" },
  { value: "velvet", label: "Black Velvet" },
  { value: "brown", label: "Warm Brown" },
] as const);
export type DarkQuoteVariation = ValueOf<typeof DARK_QUOTE_VARIATIONS>;

export const DARK_QUOTE_TYPOGRAPHY = opts([
  { value: "classic", label: "Classic serif" },
  { value: "modern", label: "Modern sans" },
  { value: "italic", label: "Elegant italic" },
] as const);
export type DarkQuoteTypography = ValueOf<typeof DARK_QUOTE_TYPOGRAPHY>;

export const DARK_QUOTE_TEXT_COLORS = [
  { value: "white", label: "White", color: "#FFFFFF" },
  { value: "cream", label: "Cream", color: "#F3E9D2" },
  { value: "silver", label: "Silver", color: "#C9CDD4" },
  { value: "gold", label: "Gold", color: "#D4A93A" },
] as const;

// ── Quote cards (Bold White, Typewriter, Clean White, Vintage Cream) ──
export const QUOTE_FONTS = opts([
  { value: "default", label: "Style default" },
  { value: "sans", label: "Modern sans" },
  { value: "heavy", label: "Heavy sans" },
  { value: "serif", label: "Classic serif" },
  { value: "typewriter", label: "Typewriter" },
  { value: "handwritten", label: "Handwritten" },
] as const);
export type QuoteFont = ValueOf<typeof QUOTE_FONTS>;

// ── Caption + Pinned Comment ────────────────────────────────
export const CAPTION_GOALS = opts([
  { value: "educate", label: "Educate" },
  { value: "conversation", label: "Start a conversation" },
  { value: "take", label: "Share my take" },
  { value: "story", label: "Tell a story" },
  { value: "belief", label: "Belief shift" },
  { value: "adjacent", label: "Offer adjacent" },
  { value: "offer", label: "Direct offer" },
] as const);
export type CaptionGoal = ValueOf<typeof CAPTION_GOALS>;

export const CAPTION_LENGTHS = opts([
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
] as const);
export type CaptionLength = ValueOf<typeof CAPTION_LENGTHS>;

export const CTA_OPTIONS = opts([
  { value: "none", label: "No CTA" },
  { value: "soft", label: "Soft CTA" },
  { value: "comment", label: "Comment CTA" },
  { value: "link", label: "Link CTA" },
  { value: "direct", label: "Direct CTA" },
] as const);
export type CtaOption = ValueOf<typeof CTA_OPTIONS>;

export const PLATFORMS = opts([
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
] as const);
export type Platform = ValueOf<typeof PLATFORMS>;
