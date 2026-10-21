// The settings of the "Start with my own text" editor.

import type {
  AccentColor,
  CaptionGoal,
  CaptionLength,
  CtaOption,
  Platform,
  TextDirection,
} from "@/config/options";
import { isTemplateId, type TemplateId } from "@/config/templates";
import { readValue, writeValue } from "@/lib/store";
import {
  DEFAULT_DARK_QUOTE,
  DEFAULT_LOOK,
  DEFAULT_QUOTE,
  NO_IMAGES,
  type DarkQuoteSettings,
  type GraphicImages,
  type LookSettings,
  type QuoteSettings,
} from "@/components/graphic/types";

export interface CaptionSettings {
  goal: CaptionGoal;
  length: CaptionLength;
  cta: CtaOption;
  platform: Platform;
  optimizeDiscussion: boolean;
  sourceFacts: string;
  existingCaption: string;
  showFacts: boolean;
  showExisting: boolean;
  caption: string;
  pinned: string;
}

export interface EditorState {
  templateId: TemplateId;
  text: string;
  autoLayout: boolean;
  direction: TextDirection;
  useBrandVoice: boolean;
  audienceId: string | null;
  accents: string[];
  accentColor: AccentColor;
  autoSuggest: boolean;
  look: LookSettings;
  images: GraphicImages;
  darkQuote: DarkQuoteSettings;
  quote: QuoteSettings;
  cap: CaptionSettings;
}

export const DEFAULT_CAPTION: CaptionSettings = {
  goal: "conversation",
  length: "medium",
  cta: "none",
  platform: "facebook",
  optimizeDiscussion: true,
  sourceFacts: "",
  existingCaption: "",
  showFacts: false,
  showExisting: false,
  caption: "",
  pinned: "",
};

export const DEFAULT_EDITOR: EditorState = {
  templateId: "big-statement",
  text: "",
  autoLayout: false,
  direction: "any",
  useBrandVoice: true,
  audienceId: null,
  accents: [],
  accentColor: "yellow",
  autoSuggest: true,
  look: DEFAULT_LOOK,
  images: NO_IMAGES,
  darkQuote: DEFAULT_DARK_QUOTE,
  quote: DEFAULT_QUOTE,
  cap: DEFAULT_CAPTION,
};

/** What gets passed into the editor from other modes (Idea, Remix). */
export interface EditorSeed {
  text: string;
  templateId?: TemplateId;
  accents?: string[];
  caption?: string;
  pinned?: string;
}

const STORAGE_KEY = "editor";

/** Loads the last editor settings (big pictures are not kept, to save space). */
export function loadEditor(): EditorState {
  const saved = readValue<Partial<EditorState> | null>(STORAGE_KEY, null);
  if (!saved || typeof saved !== "object") return DEFAULT_EDITOR;
  return {
    ...DEFAULT_EDITOR,
    ...saved,
    templateId: isTemplateId(saved.templateId) ? saved.templateId : DEFAULT_EDITOR.templateId,
    accents: Array.isArray(saved.accents) ? saved.accents.filter((a) => typeof a === "string") : [],
    look: { ...DEFAULT_LOOK, ...saved.look },
    images: NO_IMAGES,
    darkQuote: { ...DEFAULT_DARK_QUOTE, ...saved.darkQuote, aiBackground: null },
    quote: { ...DEFAULT_QUOTE, ...saved.quote },
    cap: { ...DEFAULT_CAPTION, ...saved.cap },
  };
}

export function saveEditor(state: EditorState) {
  const { images: _images, ...rest } = state;
  void _images;
  writeValue(STORAGE_KEY, { ...rest, darkQuote: { ...rest.darkQuote, aiBackground: null } });
}
