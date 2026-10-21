"use client";

import { brand } from "@/config/brand";
import { BACKGROUND_OPTIONS, FONT_OPTIONS, SIZE_OPTIONS } from "@/config/options";
import type { TemplateDef } from "@/config/templates";
import { Card, CardHeader, FieldLabel } from "@/components/ui/Card";
import { Chip, ChipGroup } from "@/components/ui/Chip";
import type { LookSettings } from "@/components/graphic/types";

export function LookCard({
  look,
  onChange,
  template,
}: {
  look: LookSettings;
  onChange: (p: Partial<LookSettings>) => void;
  template: TemplateDef;
}) {
  const fontNote =
    template.kind === "darkQuote"
      ? "This style uses its own font — change it in “Dark Quote look”."
      : template.kind === "quote"
        ? "This style uses its own font — change it in “Show branding”."
        : "This style uses a handwriting font.";

  return (
    <Card>
      <CardHeader title="Look" className="mb-3" />
      <div className="space-y-4">
        <div>
          <FieldLabel>Background</FieldLabel>
          <div className="flex flex-wrap items-center gap-2">
            {BACKGROUND_OPTIONS.map((o) => (
              <Chip key={o.value} selected={look.background === o.value} onClick={() => onChange({ background: o.value })}>
                {o.value === "brand" && (
                  <span className="size-3 rounded-full" style={{ background: brand.colors.graphicBrandColor }} aria-hidden />
                )}
                {o.value === "custom" && (
                  <span className="size-3 rounded-full ring-1 ring-black/10" style={{ background: look.customBackground }} aria-hidden />
                )}
                {o.label}
              </Chip>
            ))}
            {look.background === "custom" && (
              <label className="inline-flex items-center gap-2 text-[12.5px] text-muted">
                <input
                  type="color"
                  value={look.customBackground}
                  onChange={(e) => onChange({ customBackground: e.target.value })}
                  className="h-8 w-10 cursor-pointer rounded-md border border-line bg-white p-0.5"
                  aria-label="Custom background colour"
                />
                Pick colour
              </label>
            )}
          </div>
        </div>
        <div>
          <FieldLabel>Font</FieldLabel>
          {template.usesLookFont ? (
            <ChipGroup label="Font" options={FONT_OPTIONS} value={look.font} onChange={(font) => onChange({ font })} />
          ) : (
            <p className="text-[12.5px] text-muted">{fontNote}</p>
          )}
        </div>
        <div>
          <FieldLabel>Size</FieldLabel>
          <ChipGroup label="Size" options={SIZE_OPTIONS} value={look.size} onChange={(size) => onChange({ size })} />
        </div>
      </div>
    </Card>
  );
}
