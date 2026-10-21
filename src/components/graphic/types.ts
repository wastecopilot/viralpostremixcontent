import type {
  AccentColor,
  BackgroundOption,
  BadgeOption,
  DarkQuoteTypography,
  DarkQuoteVariation,
  FontOption,
  QuoteFont,
  SizeOption,
} from "@/config/options";
import type { TemplateId } from "@/config/templates";

/** The 19 styles plus the special "engagement" layout used by Caption → Image. */
export type RenderTemplateId = TemplateId | "engagement";

export interface GraphicIdentity {
  name: string;
  handle: string;
  photo: string | null;
  showUsername: boolean;
  badge: BadgeOption;
}

export interface LookSettings {
  background: BackgroundOption;
  customBackground: string;
  font: FontOption;
  size: SizeOption;
}

export interface GraphicImages {
  main: string | null;
  img1: string | null;
  img2: string | null;
}

export interface DarkQuoteSettings {
  variation: DarkQuoteVariation;
  typography: DarkQuoteTypography;
  brandingText: string;
  brandAccent: string;
  textColor: string;
  aiBackground: string | null;
}

export interface QuoteSettings {
  showBranding: boolean;
  font: QuoteFont;
  textColor: string;
  /** 0.6 – 1.4, multiplies the biggest text size. */
  fontScale: number;
}

/** Everything the renderer needs to draw one graphic. */
export interface GraphicData {
  templateId: RenderTemplateId;
  text: string;
  accents: string[];
  accentColor: AccentColor;
  autoLayout: boolean;
  identity: GraphicIdentity;
  look: LookSettings;
  images: GraphicImages;
  darkQuote: DarkQuoteSettings;
  quote: QuoteSettings;
  /** Background picture for the engagement layout. */
  backgroundImage?: string | null;
}

export const DEFAULT_LOOK: LookSettings = { background: "default", customBackground: "#1E293B", font: "bold", size: "4:5" };
export const NO_IMAGES: GraphicImages = { main: null, img1: null, img2: null };
export const DEFAULT_DARK_QUOTE: DarkQuoteSettings = {
  variation: "charcoal",
  typography: "classic",
  brandingText: "",
  brandAccent: "#C9A227",
  textColor: "#FFFFFF",
  aiBackground: null,
};
export const DEFAULT_QUOTE: QuoteSettings = { showBranding: false, font: "default", textColor: "#141414", fontScale: 1 };
