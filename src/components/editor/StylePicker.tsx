"use client";

import { useState } from "react";
import { WandSparkles } from "lucide-react";
import { COSTS } from "@/config/credits";
import { TEMPLATE_MAP, TEMPLATES, type TemplateId } from "@/config/templates";
import { TemplateThumb } from "@/components/graphic/TemplateThumb";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { DemoBadge, ErrorNote } from "@/components/ui/Notice";
import { cx } from "@/lib/cx";
import { useAi } from "@/lib/useAi";

export function StylePicker({
  value,
  onChange,
  text,
}: {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
  text: string;
}) {
  const { run, busy, error } = useAi();
  const [tip, setTip] = useState<{ id: TemplateId; reason: string; demo: boolean } | null>(null);

  const recommend = async () => {
    const data = await run<{ templateId: TemplateId; reason: string }>("recommend", "/api/text", { action: "recommend", text }, COSTS.recommendStyle);
    if (!data) return;
    onChange(data.templateId);
    setTip({ id: data.templateId, reason: data.reason, demo: Boolean(data.demo) });
  };

  return (
    <Card>
      <CardHeader
        title="Choose a style"
        className="mb-3"
        right={
          <Button
            size="sm"
            icon={<WandSparkles className="size-3.5" aria-hidden />}
            onClick={recommend}
            loading={busy === "recommend"}
            disabled={!text.trim() || busy !== null}
            title={text.trim() ? "AI picks the best style for your text (1 credit)" : "Type your text first"}
          >
            Recommend a style
          </Button>
        }
      />
      <div
        className="grid grid-cols-3 gap-2 min-[420px]:grid-cols-4 sm:grid-cols-5 md:grid-cols-10"
        role="radiogroup"
        aria-label="Graphic style"
      >
        {TEMPLATES.map((t) => {
          const selected = t.id === value;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(t.id)}
              className={cx(
                "flex flex-col rounded-xl border p-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                selected ? "border-accent bg-accent-soft shadow-[0_0_0_1px_var(--brand-accent)]" : "border-line bg-white hover:border-gray-300",
              )}
            >
              <TemplateThumb id={t.id} />
              <span
                className={cx(
                  "mt-1.5 line-clamp-2 min-h-[2.5em] text-[10.5px] leading-[1.25] font-medium break-words hyphens-auto",
                  selected ? "text-[#2A1F7A]" : "text-ink/85",
                )}
              >
                {t.name}
              </span>
            </button>
          );
        })}
      </div>
      {tip && (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-[12.5px] text-ink/80">
          <span>
            <span className="font-semibold text-accent">Recommended: {TEMPLATE_MAP[tip.id].name}</span>
            {tip.reason ? ` — ${tip.reason}` : ""}
          </span>
          <DemoBadge show={tip.demo} />
        </p>
      )}
      <ErrorNote className="mt-2">{error}</ErrorNote>
    </Card>
  );
}
