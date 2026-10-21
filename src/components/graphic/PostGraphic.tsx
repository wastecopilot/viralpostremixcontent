"use client";

// THE GRAPHIC RENDERER.
// Draws one post graphic at full size (1080 px wide). The live preview shrinks it
// on screen; the PNG export uses it exactly as drawn here.

import type { CSSProperties, ReactNode, Ref, RefObject } from "react";
import { brand } from "@/config/brand";
import { ACCENT_COLORS, BACKGROUND_COLORS, SIZE_PIXELS, type FontOption, type QuoteFont } from "@/config/options";
import { TEMPLATE_MAP, type TemplateDef } from "@/config/templates";
import { formatHandle, linesOrSentences, splitAccents } from "@/lib/text";
import type { GraphicData } from "./types";
import { useFitText, useFontsVersion } from "./useFitText";

// ── Fonts ───────────────────────────────────────────────────

interface FontSpec {
  family: string;
  weight: number;
  /** Fonts that only come in one heavy weight should not be made "bolder". */
  singleWeight?: boolean;
  lineHeight?: number;
  letterSpacing?: string;
  italic?: boolean;
}

const SANS = "var(--font-inter), 'Inter', ui-sans-serif, system-ui, sans-serif";
const HEAVY = "var(--font-archivo), 'Archivo Black', var(--font-inter), sans-serif";
const SERIF = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const LORA = "var(--font-lora), 'Lora', Georgia, serif";
const HAND = "var(--font-caveat), 'Caveat', 'Comic Sans MS', cursive";
const TYPE = "var(--font-special), 'Special Elite', 'Courier New', monospace";
const CONDENSED = "var(--font-oswald), 'Oswald', 'Arial Narrow', sans-serif";

const LOOK_FONTS: Record<FontOption, FontSpec> = {
  clean: { family: SANS, weight: 500, lineHeight: 1.28, letterSpacing: "-0.01em" },
  bold: { family: SANS, weight: 700, lineHeight: 1.22, letterSpacing: "-0.02em" },
  heavy: { family: HEAVY, weight: 400, singleWeight: true, lineHeight: 1.16, letterSpacing: "-0.01em" },
  editorial: { family: SERIF, weight: 600, lineHeight: 1.22, letterSpacing: "-0.01em" },
};

const QUOTE_FONT_SPECS: Record<Exclude<QuoteFont, "default">, FontSpec> = {
  sans: { family: SANS, weight: 500, lineHeight: 1.3 },
  heavy: { family: HEAVY, weight: 400, singleWeight: true, lineHeight: 1.2 },
  serif: { family: SERIF, weight: 500, lineHeight: 1.3 },
  typewriter: { family: TYPE, weight: 400, singleWeight: true, lineHeight: 1.4 },
  handwritten: { family: HAND, weight: 600, lineHeight: 1.2 },
};

const QUOTE_DEFAULTS: Record<string, FontSpec> = {
  "bold-white-quote": { family: SANS, weight: 800, lineHeight: 1.18, letterSpacing: "-0.02em" },
  "typewriter-quote": { family: TYPE, weight: 400, singleWeight: true, lineHeight: 1.42 },
  "clean-white-quote": { family: SANS, weight: 400, lineHeight: 1.32, letterSpacing: "-0.01em" },
  "vintage-cream-quote": { family: LORA, weight: 500, lineHeight: 1.36 },
};

// ── Colors ──────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** True for light backgrounds (so the text should be dark). */
export function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45;
}

function resolveBackground(def: TemplateDef, data: GraphicData): string {
  switch (data.look.background) {
    case "navy":
    case "black":
    case "white":
      return BACKGROUND_COLORS[data.look.background];
    case "brand":
      return brand.colors.graphicBrandColor;
    case "custom":
      return data.look.customBackground;
    default:
      return def.background;
  }
}

const ENGAGEMENT_DEF: TemplateDef = {
  id: "minimal-dark",
  name: "Engagement Graphic",
  kind: "profileLeft",
  background: "#000000",
  maxFontSize: 80,
  align: "left",
  checks: ["text", "fit"],
  images: 0,
  usesLookFont: true,
  bestFor: "",
};

// ── Small building blocks ───────────────────────────────────

function Avatar({
  photo,
  size,
  placeholder,
  square,
  ring,
  border,
}: {
  photo: string | null;
  size: number;
  placeholder: string;
  square?: boolean;
  ring?: string;
  border?: string;
}) {
  const inner = (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: square ? Math.round(size * 0.22) : "50%",
        overflow: "hidden",
        background: placeholder,
        flexShrink: 0,
        border,
        boxSizing: "border-box",
      }}
    >
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element -- must be a plain <img> so it exports to PNG
        <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      )}
    </div>
  );
  if (!ring) return inner;
  return (
    <div style={{ padding: 5, border: `5px solid ${ring}`, borderRadius: "50%", flexShrink: 0, display: "flex" }}>{inner}</div>
  );
}

function BrandBadge({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }} aria-hidden>
      <circle cx="12" cy="12" r="12" fill={brand.colors.graphicBrandColor} />
      <path d="M12 5.2l1.7 4.3 4.6.3-3.6 2.9 1.2 4.5L12 14.7l-3.9 2.5 1.2-4.5-3.6-2.9 4.6-.3z" fill="#fff" />
    </svg>
  );
}

function IdentityText({
  data,
  color,
  muted,
  nameSize,
  align = "left",
}: {
  data: GraphicData;
  color: string;
  muted: string;
  nameSize: number;
  align?: "left" | "center";
}) {
  const { name, badge, showUsername } = data.identity;
  const handle = showUsername ? formatHandle(data.identity.handle) : "";
  if (!name.trim() && !handle) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : "flex-start", minWidth: 0, fontFamily: SANS }}>
      {name.trim() && (
        <div style={{ display: "flex", alignItems: "center", gap: nameSize * 0.3, fontSize: nameSize, fontWeight: 700, color, lineHeight: 1.2 }}>
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 700 }}>{name.trim()}</span>
          {badge === "brand" && <BrandBadge size={nameSize * 0.85} />}
        </div>
      )}
      {handle && (
        <div style={{ fontSize: nameSize * 0.82, color: muted, lineHeight: 1.3, marginTop: 4, whiteSpace: "nowrap" }}>
          {handle}
          {!name.trim() && badge === "brand" && (
            <span style={{ marginLeft: 8, display: "inline-flex", verticalAlign: "middle" }}>
              <BrandBadge size={nameSize * 0.75} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface LineStyle {
  color?: string;
}

/** Draws the text line by line, with accent words in the accent color and bold. */
function RichText({
  text,
  accents,
  accentHex,
  highlight,
  boldAccent,
  lineStyle,
  lines,
}: {
  text: string;
  accents: string[];
  accentHex: string;
  highlight: boolean;
  boldAccent: boolean;
  lineStyle?: (index: number, total: number) => LineStyle | undefined;
  lines?: string[];
}) {
  const list = lines ?? text.split("\n");
  const lastIndex = list.reduce((last, line, i) => (line.trim() ? i : last), -1);
  const accentStyle: CSSProperties = highlight
    ? {
        background: "#FDE047",
        color: "#111111",
        padding: "0 0.12em",
        borderRadius: "0.1em",
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
        fontWeight: boldAccent ? 800 : undefined,
      }
    : { color: accentHex, fontWeight: boldAccent ? 800 : undefined };
  return (
    <>
      {list.map((line, i) => {
        const style = lineStyle?.(i, lastIndex);
        return (
          <div key={i} style={{ minHeight: "1em", color: style?.color }}>
            {splitAccents(line, accents).map((seg, j) =>
              seg.accent ? (
                <span key={j} style={accentStyle}>
                  {seg.text}
                </span>
              ) : (
                <span key={j}>{seg.text}</span>
              ),
            )}
          </div>
        );
      })}
    </>
  );
}

/** A box that the text auto-fits into. */
function FitBox({
  boxRef,
  contentRef,
  textRef,
  children,
  decor,
  textStyle,
  style,
  justify = "center",
  header,
  headerGap = 48,
  align = "left",
}: {
  boxRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  textRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
  decor?: ReactNode;
  textStyle: CSSProperties;
  style?: CSSProperties;
  justify?: "center" | "flex-start" | "flex-end";
  header?: ReactNode;
  headerGap?: number;
  align?: "left" | "center";
}) {
  return (
    <div
      ref={boxRef}
      style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: justify, overflow: "hidden", ...style }}
    >
      <div
        ref={contentRef}
        style={{ display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : "stretch", gap: header ? headerGap : 0 }}
      >
        {header}
        <div ref={textRef} style={{ width: "100%", whiteSpace: "pre-wrap", textAlign: align, ...textStyle }}>
          {children}
        </div>
        {decor}
      </div>
    </div>
  );
}

function Bar({ color, width, height, center, marginTop }: { color: string; width: number | string; height: number; center?: boolean; marginTop: number }) {
  return (
    <div
      style={{
        width,
        height,
        background: color,
        borderRadius: height / 2,
        marginTop,
        alignSelf: center ? "center" : "flex-start",
        flexShrink: 0,
      }}
    />
  );
}

function Img({ src, style }: { src: string; style?: CSSProperties }) {
  // eslint-disable-next-line @next/next/no-img-element -- must be a plain <img> so it exports to PNG
  return <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...style }} />;
}

function Heart({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 21s-7.5-4.6-9.6-9.2C1 8.6 3 5 6.6 5c2.1 0 3.6 1.2 4.4 2.6.1.2.4.2.5 0C12.4 6.2 13.9 5 16 5c3.6 0 5.6 3.6 4.2 6.8C19.5 16.4 12 21 12 21z"
        fill="#C0392B"
      />
    </svg>
  );
}

function SpeechIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6c-.5.4-1.3.1-1.3-.6V16A2.5 2.5 0 0 1 4 13.5z" fill="#fff" />
      <circle cx="9" cy="9.6" r="1.3" fill="#FF5A1F" />
      <circle cx="15" cy="9.6" r="1.3" fill="#FF5A1F" />
    </svg>
  );
}

const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.09 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

const DARK_QUOTE_BACKGROUNDS: Record<string, string> = {
  charcoal: "radial-gradient(ellipse at 50% 45%, #161616 0%, #222222 38%, #4A4A4A 82%, #5E5E5E 100%)",
  midnight: "radial-gradient(ellipse at 50% 45%, #070C1C 0%, #0F1A36 45%, #2D3E66 90%, #3A4D78 100%)",
  velvet: "radial-gradient(ellipse at 50% 45%, #020202 0%, #0C0C0C 50%, #242424 95%)",
  brown: "radial-gradient(ellipse at 50% 45%, #1A110D 0%, #2B1D15 45%, #5E412E 92%, #6B4A35 100%)",
};

// ── Main renderer ───────────────────────────────────────────

export function PostGraphic({
  data,
  onFitChange,
  nodeRef,
}: {
  data: GraphicData;
  onFitChange?: (fits: boolean) => void;
  nodeRef?: Ref<HTMLDivElement>;
}) {
  const isEngagement = data.templateId === "engagement";
  const def = isEngagement ? ENGAGEMENT_DEF : TEMPLATE_MAP[data.templateId as keyof typeof TEMPLATE_MAP];
  const { width, height } = SIZE_PIXELS[data.look.size];
  const fontsVersion = useFontsVersion();

  const bg = resolveBackground(def, data);
  const light = isLightColor(bg);
  const ink = light ? "#111111" : "#FFFFFF";
  const muted = light ? "#6B7280" : "rgba(255,255,255,0.62)";
  const placeholder = light ? "#D9DCE1" : "#3A3D44";
  const accentDef = ACCENT_COLORS.find((a) => a.value === data.accentColor) ?? ACCENT_COLORS[0];
  const highlight = data.accentColor === "highlight";
  const padX = 90;
  const padY = data.look.size === "9:16" ? 230 : data.look.size === "1:1" ? 80 : 90;
  const sizeFactor = data.look.size === "1:1" ? 0.9 : 1;

  let font: FontSpec = LOOK_FONTS[data.look.font];
  let maxFont = def.maxFontSize * sizeFactor;
  if (def.kind === "handwritten") font = { family: HAND, weight: 600, lineHeight: 1.18 };
  if (def.kind === "darkQuote") {
    font =
      data.darkQuote.typography === "modern"
        ? { family: SANS, weight: 600, lineHeight: 1.28, letterSpacing: "-0.01em" }
        : data.darkQuote.typography === "italic"
          ? { family: SERIF, weight: 500, lineHeight: 1.3, italic: true }
          : { family: SERIF, weight: 500, lineHeight: 1.3 };
  }
  if (def.kind === "quote") {
    font = data.quote.font === "default" ? QUOTE_DEFAULTS[def.id] : QUOTE_FONT_SPECS[data.quote.font];
    maxFont *= data.quote.fontScale;
  }
  if (def.id === "big-statement" && data.look.font === "bold") font = { ...font, weight: 800 };

  const signature = JSON.stringify([
    data.templateId,
    data.text,
    data.accents,
    data.look,
    data.autoLayout,
    data.identity.name,
    data.identity.handle,
    data.identity.showUsername,
    Boolean(data.identity.photo),
    data.identity.badge,
    data.darkQuote.typography,
    data.darkQuote.brandingText,
    data.quote,
    fontsVersion,
  ]);
  const { boxRef, contentRef, textRef } = useFitText(signature, Math.round(maxFont), 24, onFitChange);

  const textStyle: CSSProperties = {
    fontFamily: font.family,
    fontWeight: font.weight,
    lineHeight: font.lineHeight ?? 1.25,
    letterSpacing: font.letterSpacing,
    fontStyle: font.italic ? "italic" : undefined,
    color: ink,
  };
  const accentHex = def.kind === "breakingNews" ? "#FACC15" : light ? accentDef.onLight : accentDef.onDark;
  const bodyText = data.text.replace(/\r/g, "");
  const hasText = bodyText.trim().length > 0;
  const rich = (opts?: { lineStyle?: (i: number, last: number) => LineStyle | undefined; lines?: string[]; accentOverride?: string }) => (
    <RichText
      text={bodyText}
      lines={opts?.lines}
      accents={data.accents}
      accentHex={opts?.accentOverride ?? accentHex}
      highlight={highlight && def.kind !== "breakingNews"}
      boldAccent={!font.singleWeight}
      lineStyle={opts?.lineStyle}
    />
  );

  const root = (children: ReactNode, style?: CSSProperties) => (
    <div
      ref={nodeRef}
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        background: bg,
        color: ink,
        fontFamily: SANS,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </div>
  );

  // ── Engagement graphic (Caption → Image) ──
  if (isEngagement) {
    return root(
      <>
        {data.backgroundImage && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Img src={data.backgroundImage} />
          </div>
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.72) 66%, rgba(0,0,0,0.92) 100%)",
          }}
        />
        <div style={{ position: "absolute", left: padX, right: padX, top: height * 0.42, bottom: padY, display: "flex", flexDirection: "column" }}>
          <FitBox
            boxRef={boxRef} contentRef={contentRef} textRef={textRef}
            justify="flex-end"
            textStyle={{ ...textStyle, color: "#FFFFFF" }}
            header={
              data.identity.photo || data.identity.name || data.identity.handle ? (
                <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                  <Avatar photo={data.identity.photo} size={84} placeholder="#3A3D44" border="3px solid rgba(255,255,255,0.9)" />
                  <IdentityText data={data} color="#FFFFFF" muted="rgba(255,255,255,0.75)" nameSize={34} />
                </div>
              ) : undefined
            }
            headerGap={34}
          >
            {hasText && rich({ accentOverride: accentDef.onDark })}
          </FitBox>
        </div>
      </>,
      { background: data.backgroundImage ? "#000" : bg, color: "#fff" },
    );
  }

  switch (def.kind) {
    // ── Avatar + name at top-left, text below ──
    case "profileLeft": {
      const ring = def.id === "dark-profile-statement" ? "#22D3EE" : undefined;
      const header = (
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <Avatar photo={data.identity.photo} size={ring ? 86 : 96} placeholder={placeholder} ring={ring} />
          <IdentityText data={data} color={ink} muted={muted} nameSize={36} />
        </div>
      );
      let lineStyle: ((i: number, last: number) => LineStyle | undefined) | undefined;
      let lines: string[] | undefined;
      if (def.id === "contrast-statement") {
        lines = linesOrSentences(bodyText);
        const dim = light ? "#9CA3AF" : "#6F7A92";
        lineStyle = (i, last) => ({ color: i === last ? ink : dim });
      } else if (def.id === "punchline-emphasis") {
        const red = light ? "#E5484D" : "#FF6B6B";
        lineStyle = (i, last) => (i === last && last > 0 ? { color: red } : undefined);
      }
      const decor =
        hasText && def.id === "personal-thought" ? (
          <Bar color={accentDef.onDark} width={120} height={10} marginTop={40} />
        ) : hasText && def.id === "big-statement" ? (
          <Bar color={accentDef.onDark} width={200} height={14} marginTop={44} />
        ) : undefined;
      return root(
        <div style={{ position: "absolute", inset: 0, padding: `${padY}px ${padX}px`, display: "flex", flexDirection: "column" }}>
          {!data.autoLayout && header}
          <FitBox
            boxRef={boxRef} contentRef={contentRef} textRef={textRef}
            textStyle={textStyle}
            decor={decor}
            header={data.autoLayout ? header : undefined}
            style={{ marginTop: data.autoLayout ? 0 : 56 }}
          >
            {hasText && rich({ lineStyle, lines })}
          </FitBox>
        </div>,
      );
    }

    // ── Avatar centered at top, centered text ──
    case "profileCenter": {
      const header = (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <Avatar photo={data.identity.photo} size={92} placeholder={placeholder} />
          <IdentityText data={data} color={ink} muted={muted} nameSize={32} align="center" />
        </div>
      );
      return root(
        <div style={{ position: "absolute", inset: 0, padding: `${padY}px ${padX}px`, display: "flex", flexDirection: "column", alignItems: "stretch" }}>
          {!data.autoLayout && header}
          <FitBox
            boxRef={boxRef} contentRef={contentRef} textRef={textRef}
            textStyle={textStyle}
            align="center"
            header={data.autoLayout ? header : undefined}
            style={{ marginTop: data.autoLayout ? 0 : 40 }}
          >
            {hasText && rich()}
          </FitBox>
        </div>,
      );
    }

    // ── Big photo on top, line with avatar, headline below ──
    case "viralHeadline": {
      const imageH = Math.round(height * 0.56);
      const lineY = imageH + 10;
      const hasIdentity = Boolean(data.identity.name.trim() || (data.identity.showUsername && data.identity.handle.trim()));
      return root(
        <>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: imageH, background: "linear-gradient(to bottom, #3B3B3D, #0A0A0A)" }}>
            {data.images.main ? (
              <Img src={data.images.main} />
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.45)", fontSize: 34 }}>
                Upload a main image
              </div>
            )}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,0.7) 82%, #000 100%)" }} />
          </div>
          <div style={{ position: "absolute", left: 60, right: 60, top: lineY, height: 3, background: "rgba(255,255,255,0.55)" }} />
          <div style={{ position: "absolute", top: lineY - 60, left: (width - 120) / 2 }}>
            <Avatar photo={data.identity.photo} size={120} placeholder="#3A3D44" border="4px solid #FFFFFF" />
          </div>
          {hasIdentity && (
            <div style={{ position: "absolute", top: lineY + 76, left: padX, right: padX, display: "flex", justifyContent: "center" }}>
              <IdentityText data={data} color="#FFFFFF" muted="rgba(255,255,255,0.65)" nameSize={28} align="center" />
            </div>
          )}
          <div
            style={{
              position: "absolute",
              top: lineY + (hasIdentity ? 170 : 100),
              bottom: Math.max(60, padY * 0.8),
              left: 80,
              right: 80,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <FitBox
              boxRef={boxRef} contentRef={contentRef} textRef={textRef}
              align="center"
              textStyle={{ ...textStyle, color: "#FFFFFF" }}
              decor={hasText ? <Bar color={accentDef.onDark} width={220} height={12} marginTop={34} center /> : undefined}
            >
              {hasText && rich({ accentOverride: accentDef.onDark })}
            </FitBox>
          </div>
        </>,
        { background: light ? "#000000" : bg },
      );
    }

    // ── White card, logo square, headline, two images ──
    case "brandedTwoImage": {
      const imagesH = Math.round(height * 0.44);
      const slot = (src: string | null, label: string) => (
        <div
          style={{
            flex: 1,
            height: "100%",
            borderRadius: 18,
            overflow: "hidden",
            background: "#EEF0F4",
            border: src ? "none" : "3px dashed #C7CBD3",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8A909C",
            fontSize: 30,
          }}
        >
          {src ? <Img src={src} /> : label}
        </div>
      );
      return root(
        <div style={{ position: "absolute", inset: 0, padding: `${Math.max(70, padY - 20)}px 70px`, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <Avatar photo={data.identity.photo} size={88} placeholder="#E5E7EB" square />
            <IdentityText data={data} color={ink} muted={muted} nameSize={32} />
          </div>
          <FitBox boxRef={boxRef} contentRef={contentRef} textRef={textRef} textStyle={textStyle} style={{ margin: "36px 0" }}>
            {hasText && rich()}
          </FitBox>
          <div style={{ height: imagesH, display: "flex", gap: 16, flexShrink: 0 }}>
            {slot(data.images.img1, "Add image 1")}
            {slot(data.images.img2, "Add image 2")}
          </div>
        </div>,
      );
    }

    // ── Story card with an orange speech-bubble avatar ──
    case "reddit": {
      const handle = data.identity.showUsername ? formatHandle(data.identity.handle) : "";
      const by = [data.identity.name.trim(), handle].filter(Boolean).join(" · ");
      return root(
        <div style={{ position: "absolute", inset: 0, padding: `${padY + 10}px ${padX}px`, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {data.identity.photo ? (
              <Avatar photo={data.identity.photo} size={92} placeholder="#FF5A1F" border="5px solid #FF5A1F" />
            ) : (
              <div style={{ width: 92, height: 92, borderRadius: "50%", background: "#FF5A1F", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <SpeechIcon size={54} />
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <div style={{ fontSize: 38, fontWeight: 800, color: light ? "#111" : "#FFFFFF", lineHeight: 1.2 }}>Reddit post</div>
              {by && <div style={{ fontSize: 28, color: light ? "#6B7280" : "#A8A29E", marginTop: 4 }}>{by}</div>}
            </div>
          </div>
          <FitBox boxRef={boxRef} contentRef={contentRef} textRef={textRef} textStyle={textStyle} style={{ marginTop: 52 }}>
            {hasText && rich()}
          </FitBox>
        </div>,
      );
    }

    // ── Breaking news: background photo, circle photo, red label ──
    case "breakingNews": {
      const circle = 420;
      return root(
        <>
          {data.images.img2 && (
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: Math.round(height * 0.68) }}>
              <Img src={data.images.img2} />
            </div>
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0) 32%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.9) 64%, #000 78%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: Math.max(70, padY - 20),
              right: 70,
              width: circle,
              height: circle,
              borderRadius: "50%",
              border: "10px solid #FFFFFF",
              overflow: "hidden",
              boxSizing: "border-box",
              boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
            }}
          >
            {data.images.img1 && <Img src={data.images.img1} />}
          </div>
          <div style={{ position: "absolute", left: 64, right: 64, top: Math.round(height * 0.55), bottom: Math.max(64, padY * 0.8), display: "flex", flexDirection: "column" }}>
            <div
              style={{
                alignSelf: "flex-start",
                background: "#E11D2A",
                color: "#FFFFFF",
                fontFamily: CONDENSED,
                fontWeight: 700,
                fontSize: 58,
                letterSpacing: "0.02em",
                lineHeight: 1.12,
                padding: "6px 26px 8px",
                textTransform: "uppercase",
              }}
            >
              Breaking News
            </div>
            <FitBox
              boxRef={boxRef} contentRef={contentRef} textRef={textRef}
              justify="flex-start"
              textStyle={{ ...textStyle, color: "#FFFFFF" }}
              style={{ marginTop: 30 }}
              decor={<Bar color="#FACC15" width="58%" height={12} marginTop={30} />}
            >
              {hasText && rich({ accentOverride: "#FACC15" })}
            </FitBox>
          </div>
        </>,
      );
    }

    // ── Cream paper, handwriting in blue ink ──
    case "handwritten": {
      const inkBlue = light ? "#2340A0" : "#BFD3FF";
      const showSignature = Boolean(data.identity.photo || data.identity.name.trim());
      const handle = data.identity.showUsername ? formatHandle(data.identity.handle) : "";
      return root(
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 55%, rgba(120,90,40,0.16) 100%)",
            }}
          />
          <div style={{ position: "absolute", inset: 0, padding: `${padY + 30}px 110px`, display: "flex", flexDirection: "column" }}>
            <FitBox boxRef={boxRef} contentRef={contentRef} textRef={textRef} textStyle={{ ...textStyle, color: inkBlue }}>
              {hasText && rich()}
            </FitBox>
            {showSignature && (
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 40, fontFamily: HAND, color: inkBlue }}>
                <Avatar photo={data.identity.photo} size={76} placeholder="#D8CDB4" />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {data.identity.name.trim() && <span style={{ fontSize: 50, fontWeight: 700, lineHeight: 1.1 }}>— {data.identity.name.trim()}</span>}
                  {handle && <span style={{ fontSize: 36, opacity: 0.8 }}>{handle}</span>}
                </div>
              </div>
            )}
          </div>
        </>,
      );
    }

    // ── Dark textured quote with gold mark ──
    case "darkQuote": {
      const dq = data.darkQuote;
      const useCustomBg = data.look.background !== "default";
      const handle = data.identity.showUsername ? formatHandle(data.identity.handle) : "";
      const hasProfile = Boolean(data.identity.name.trim() || data.identity.photo || handle);
      return root(
        <>
          {!useCustomBg && !dq.aiBackground && <div style={{ position: "absolute", inset: 0, background: DARK_QUOTE_BACKGROUNDS[dq.variation] }} />}
          {dq.aiBackground && (
            <div style={{ position: "absolute", inset: 0 }}>
              <Img src={dq.aiBackground} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
            </div>
          )}
          <div style={{ position: "absolute", inset: 0, backgroundImage: NOISE, opacity: 0.6 }} />
          <div style={{ position: "absolute", inset: 0, padding: `${padY + 30}px 110px`, display: "flex", flexDirection: "column", alignItems: "stretch" }}>
            <FitBox boxRef={boxRef} contentRef={contentRef} textRef={textRef} align="center" textStyle={{ ...textStyle, color: dq.textColor }}>
              {hasText && rich()}
            </FitBox>
            {hasText && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, marginTop: 44 }}>
                <div style={{ width: 64, height: 6, borderRadius: 3, background: dq.brandAccent }} />
                {dq.brandingText.trim() ? (
                  <div style={{ fontSize: 26, letterSpacing: "0.22em", textTransform: "uppercase", color: dq.brandAccent, fontFamily: SANS, fontWeight: 600 }}>
                    {dq.brandingText.trim()}
                  </div>
                ) : hasProfile ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    {data.identity.photo && <Avatar photo={data.identity.photo} size={60} placeholder="#3A3D44" />}
                    <IdentityText data={data} color="rgba(255,255,255,0.9)" muted="rgba(255,255,255,0.6)" nameSize={26} />
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </>,
        useCustomBg ? undefined : { background: "#1C1C1C" },
      );
    }

    // ── Bold White / Typewriter / Clean White / Vintage Cream quotes ──
    case "quote": {
      const vintage = def.id === "vintage-cream-quote";
      const lineColor = "#3B2F2A";
      const handle = data.identity.showUsername ? formatHandle(data.identity.handle) : "";
      const branding = [data.identity.name.trim(), handle].filter(Boolean).join("  ·  ");
      const quoteInk = light ? data.quote.textColor : isLightColor(data.quote.textColor) ? data.quote.textColor : "#FFFFFF";
      return root(
        <>
          {vintage && (
            <>
              <div style={{ position: "absolute", inset: 40, border: `7px double ${lineColor}`, borderRadius: 6 }} />
              <div style={{ position: "absolute", top: Math.max(100, padY), left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
                <div style={{ width: 80, height: 2, background: lineColor }} />
                <Heart size={30} />
                <div style={{ width: 80, height: 2, background: lineColor }} />
              </div>
            </>
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              padding: vintage ? `${padY + 110}px 140px ${padY + 70}px` : `${padY + 40}px 120px`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <FitBox boxRef={boxRef} contentRef={contentRef} textRef={textRef} align="center" textStyle={{ ...textStyle, color: quoteInk }}>
              {hasText && rich()}
            </FitBox>
            {data.quote.showBranding && branding && (
              <div
                style={{
                  marginTop: 40,
                  textAlign: "center",
                  fontSize: 28,
                  color: quoteInk,
                  opacity: 0.6,
                  fontFamily: vintage ? LORA : SANS,
                  fontStyle: vintage ? "italic" : undefined,
                }}
              >
                {branding}
              </div>
            )}
          </div>
        </>,
      );
    }
  }
}

/** A plain full-bleed picture (used for "Visual Only" images so they export the same way). */
export function PhotoGraphic({
  src,
  width,
  height,
  nodeRef,
}: {
  src: string;
  width: number;
  height: number;
  nodeRef?: Ref<HTMLDivElement>;
}) {
  return (
    <div ref={nodeRef} style={{ width, height, position: "relative", overflow: "hidden", background: "#111" }}>
      <Img src={src} />
    </div>
  );
}
