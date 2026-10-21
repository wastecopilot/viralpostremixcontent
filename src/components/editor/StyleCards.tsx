"use client";

// Extra cards that only show for some styles.

import { ImagePlus } from "lucide-react";
import { COSTS } from "@/config/credits";
import {
  DARK_QUOTE_TEXT_COLORS,
  DARK_QUOTE_TYPOGRAPHY,
  DARK_QUOTE_VARIATIONS,
  QUOTE_FONTS,
  type SizeOption,
} from "@/config/options";
import type { TemplateDef } from "@/config/templates";
import type { DarkQuoteSettings, GraphicImages, QuoteSettings } from "@/components/graphic/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, FieldLabel } from "@/components/ui/Card";
import { TextInput } from "@/components/ui/Inputs";
import { DemoBadge, ErrorNote } from "@/components/ui/Notice";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { UploadBox } from "@/components/ui/UploadBox";
import { cx } from "@/lib/cx";
import { useAi } from "@/lib/useAi";
import { useState } from "react";

function ColorSwatch({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (color: string) => void;
  label: string;
}) {
  return (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      title={label}
      className="h-9 w-12 cursor-pointer rounded-lg border border-line bg-white p-1"
    />
  );
}

// ── Dark Quote ──────────────────────────────────────────────

export function DarkQuoteCard({
  settings,
  onChange,
  text,
  size,
}: {
  settings: DarkQuoteSettings;
  onChange: (p: Partial<DarkQuoteSettings>) => void;
  text: string;
  size: SizeOption;
}) {
  const { run, busy, error } = useAi();
  const [demo, setDemo] = useState(false);
  const isPreset = DARK_QUOTE_TEXT_COLORS.some((c) => c.color.toLowerCase() === settings.textColor.toLowerCase());

  const generate = async () => {
    const data = await run<{ image: string }>(
      "bg",
      "/api/image",
      { purpose: "darkQuoteBackground", variation: settings.variation, text, aspect: size },
      COSTS.aiBackground,
    );
    if (data) {
      onChange({ aiBackground: data.image });
      setDemo(Boolean(data.demo));
    }
  };

  return (
    <Card>
      <CardHeader title={<span>Dark Quote look <span className="font-normal text-muted">(built-in backgrounds are free)</span></span>} className="mb-3" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel>Style variation</FieldLabel>
          <Select
            ariaLabel="Style variation"
            value={settings.variation}
            options={DARK_QUOTE_VARIATIONS}
            onChange={(variation) => onChange({ variation, aiBackground: null })}
          />
        </div>
        <div>
          <FieldLabel>Typography</FieldLabel>
          <Select ariaLabel="Typography" value={settings.typography} options={DARK_QUOTE_TYPOGRAPHY} onChange={(typography) => onChange({ typography })} />
        </div>
        <div>
          <FieldLabel htmlFor="dq-branding">Branding text</FieldLabel>
          <TextInput
            id="dq-branding"
            value={settings.brandingText}
            onChange={(e) => onChange({ brandingText: e.target.value })}
            placeholder="Your page name (optional)"
          />
        </div>
        <div>
          <FieldLabel>Brand accent</FieldLabel>
          <ColorSwatch value={settings.brandAccent} onChange={(brandAccent) => onChange({ brandAccent })} label="Brand accent colour" />
        </div>
      </div>
      <div className="mt-3">
        <FieldLabel>
          Text color <span className="font-normal text-muted">(quote only)</span>
        </FieldLabel>
        <div className="flex items-center gap-2.5" role="radiogroup" aria-label="Quote text colour">
          {DARK_QUOTE_TEXT_COLORS.map((c) => {
            const selected = c.color.toLowerCase() === settings.textColor.toLowerCase();
            return (
              <button
                key={c.value}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={c.label}
                title={c.label}
                onClick={() => onChange({ textColor: c.color })}
                className={cx("size-7 rounded-full border border-gray-300", selected && "ring-2 ring-ink ring-offset-2")}
                style={{ background: c.color }}
              />
            );
          })}
          <label className={cx("relative inline-flex rounded-md", !isPreset && "ring-2 ring-ink ring-offset-2")} title="Custom colour">
            <span className="sr-only">Custom text colour</span>
            <input
              type="color"
              value={settings.textColor}
              onChange={(e) => onChange({ textColor: e.target.value })}
              className="h-7 w-9 cursor-pointer rounded-md border border-gray-300 bg-white p-0.5"
            />
          </label>
        </div>
      </div>
      <p className="mt-3 text-[12px] text-muted">No branding is shown until you add your page name or select an Image Profile.</p>

      <div className="mt-4 border-t border-line pt-4">
        <p className="text-[13px] font-semibold text-ink">
          AI Background <span className="font-normal text-muted">(optional)</span>
        </p>
        <p className="mt-0.5 text-[12px] text-muted">Create a unique dark background with AI. Your quote stays crisp on top.</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            icon={<ImagePlus className="size-3.5" aria-hidden />}
            onClick={generate}
            loading={busy === "bg"}
            disabled={busy !== null}
            cost={COSTS.aiBackground}
          >
            {settings.aiBackground ? "Make another" : "Generate AI background"}
          </Button>
          {settings.aiBackground && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
              <img src={settings.aiBackground} alt="AI background" className="h-10 w-8 rounded-md object-cover ring-1 ring-line" />
              <DemoBadge show={demo} />
              <button type="button" onClick={() => onChange({ aiBackground: null })} className="text-[12.5px] text-muted hover:text-red-600">
                Remove
              </button>
            </>
          )}
        </div>
        <ErrorNote className="mt-2">{error}</ErrorNote>
      </div>
    </Card>
  );
}

// ── Bold White / Typewriter / Clean White / Vintage Cream ───

export function QuoteBrandingCard({
  settings,
  onChange,
  hasIdentity,
}: {
  settings: QuoteSettings;
  onChange: (p: Partial<QuoteSettings>) => void;
  hasIdentity: boolean;
}) {
  return (
    <Card>
      <CardHeader
        title="Show branding"
        className="mb-3"
        right={<Toggle checked={settings.showBranding} onChange={(showBranding) => onChange({ showBranding })} />}
      />
      {settings.showBranding && !hasIdentity && (
        <p className="mb-3 text-[12px] text-muted">Add your name or @username in “Your identity” below to show it on the quote.</p>
      )}
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div>
          <FieldLabel>Font</FieldLabel>
          <Select ariaLabel="Quote font" value={settings.font} options={QUOTE_FONTS} onChange={(font) => onChange({ font })} />
        </div>
        <div>
          <FieldLabel>Text color</FieldLabel>
          <ColorSwatch value={settings.textColor} onChange={(textColor) => onChange({ textColor })} label="Quote text colour" />
        </div>
      </div>
      <div className="mt-4">
        <FieldLabel htmlFor="quote-size" right={<span className="text-[12px] text-muted">{Math.round(settings.fontScale * 100)}%</span>}>
          Font size
        </FieldLabel>
        <input
          id="quote-size"
          type="range"
          min={0.6}
          max={1.4}
          step={0.05}
          value={settings.fontScale}
          onChange={(e) => onChange({ fontScale: Number(e.target.value) })}
          className="w-full accent-[var(--brand-accent)]"
        />
        <p className="mt-1 text-[12px] text-muted">Long quotes still shrink automatically so nothing gets cut off.</p>
      </div>
    </Card>
  );
}

// ── Picture uploads (Viral Headline, Branded Two-Image, Breaking News) ──

export function ImagesCard({
  template,
  images,
  onChange,
}: {
  template: TemplateDef;
  images: GraphicImages;
  onChange: (p: Partial<GraphicImages>) => void;
}) {
  if (template.id === "viral-headline") {
    return (
      <Card>
        <CardHeader title="Main image" helper="This photo fills the top of the graphic." className="mb-3" />
        <UploadBox hint="A strong photo that goes with your headline" value={images.main} onChange={(main) => onChange({ main })} compact boxClassName="min-h-40" />
      </Card>
    );
  }
  const breaking = template.id === "breaking-news-circle";
  return (
    <Card>
      <CardHeader
        title="Images"
        helper={
          breaking
            ? "Image 1 goes in the big circle. Image 2 is the background photo."
            : "Two photos side by side. Your profile photo is used as the small logo square."
        }
        className="mb-3"
      />
      <div className="grid grid-cols-2 gap-3">
        <UploadBox
          title={breaking ? "Image 1 (circle)" : "Image 1 (left)"}
          hint="Click to choose"
          value={images.img1}
          onChange={(img1) => onChange({ img1 })}
          compact
          boxClassName="min-h-36"
        />
        <UploadBox
          title={breaking ? "Image 2 (background)" : "Image 2 (right)"}
          hint="Click to choose"
          value={images.img2}
          onChange={(img2) => onChange({ img2 })}
          compact
          boxClassName="min-h-36"
        />
      </div>
    </Card>
  );
}
