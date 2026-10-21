"use client";

import { useState } from "react";
import { ChevronDown, Layers, ScanSearch, Sparkles } from "lucide-react";
import { brand } from "@/config/brand";
import { COSTS } from "@/config/credits";
import {
  CAPTION_MAX_CHARS,
  REWRITE_LENGTHS,
  REWRITE_STRENGTHS,
  TONES,
  type RewriteLength,
  type RewriteStrength,
  type Tone,
} from "@/config/options";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, FieldLabel } from "@/components/ui/Card";
import { ChipGroup, OptionCard } from "@/components/ui/Chip";
import { CopyButton } from "@/components/ui/CopyButton";
import { TextArea } from "@/components/ui/Inputs";
import { DemoBadge, ErrorNote } from "@/components/ui/Notice";
import { cx } from "@/lib/cx";
import { wordCount } from "@/lib/text";
import { useAi } from "@/lib/useAi";

interface Analysis {
  hook: string;
  mainMessage: string;
  tone: string;
  structure: string;
  whyItWorks: string[];
  improvements: string[];
}

export function CaptionRewriteMode() {
  const [caption, setCaption] = useState("");
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<Tone>("conversational");
  const [strength, setStrength] = useState<RewriteStrength>("moderate");
  const [length, setLength] = useState<RewriteLength>("same");
  const [versions, setVersions] = useState<{ list: string[]; demo: boolean } | null>(null);
  const [analysis, setAnalysis] = useState<{ data: Analysis; demo: boolean } | null>(null);
  const { run, busy, error } = useAi();

  const words = wordCount(caption);
  const tooLong = caption.length > CAPTION_MAX_CHARS;
  const canRun = caption.trim().length > 0 && !tooLong && busy === null;

  const rewrite = async (action: "rewrite" | "versions") => {
    const cost = action === "versions" ? COSTS.captionVersions : COSTS.rewriteCaption;
    const data = await run<{ versions: string[] }>(action, "/api/caption-rewrite", { action, caption, tone, strength, length }, cost);
    if (data) setVersions({ list: data.versions, demo: Boolean(data.demo) });
  };

  const analyze = async () => {
    const data = await run<{ analysis: Analysis }>("analyze", "/api/caption-rewrite", { action: "analyze", caption, tone, strength, length }, COSTS.analyzeCaption);
    if (data) setAnalysis({ data: data.analysis, demo: Boolean(data.demo) });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          large
          title="Paste Your Caption"
          helper={`Paste a post, caption or draft and ${brand.name} will create an original version while preserving the message.`}
        />
        <TextArea
          aria-label="Your caption"
          rows={8}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Short captions and long 1,500+ word posts both work."
          className="min-h-44"
        />
        <p className={cx("mt-1.5 text-[12px]", tooLong ? "font-medium text-red-600" : "text-muted")}>
          {words.toLocaleString("en-US")} word{words === 1 ? "" : "s"} ·{" "}
          {tooLong
            ? `${caption.length.toLocaleString("en-US")} characters — please shorten to 15,000 or fewer`
            : "up to 15,000 characters"}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="primary"
            icon={<Sparkles className="size-4" aria-hidden />}
            onClick={() => rewrite("rewrite")}
            loading={busy === "rewrite"}
            disabled={!canRun}
            cost={COSTS.rewriteCaption}
          >
            Rewrite Caption
          </Button>
          <Button
            icon={<ScanSearch className="size-4" aria-hidden />}
            onClick={analyze}
            loading={busy === "analyze"}
            disabled={!canRun}
          >
            Analyze Caption
          </Button>
          <Button
            icon={<Layers className="size-4" aria-hidden />}
            onClick={() => rewrite("versions")}
            loading={busy === "versions"}
            disabled={!canRun}
            cost={COSTS.captionVersions}
          >
            Give Me 3 Versions
          </Button>
        </div>
        <ErrorNote className="mt-3">{error}</ErrorNote>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent"
        >
          <ChevronDown className={cx("size-4 transition-transform", open && "rotate-180")} aria-hidden />
          Customize Rewrite
        </button>

        {open && (
          <div className="animate-fade-in mt-3 space-y-4 rounded-2xl border border-line bg-[#FAFAFC] p-4">
            <div>
              <FieldLabel>Tone</FieldLabel>
              <ChipGroup label="Tone" options={TONES} value={tone} onChange={setTone} />
            </div>
            <div>
              <FieldLabel>Rewrite strength</FieldLabel>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {REWRITE_STRENGTHS.map((s) => (
                  <OptionCard
                    key={s.value}
                    selected={strength === s.value}
                    onClick={() => setStrength(s.value)}
                    title={s.label}
                    description={s.description}
                  />
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Length</FieldLabel>
              <ChipGroup label="Length" options={REWRITE_LENGTHS} value={length} onChange={setLength} />
            </div>
          </div>
        )}
      </Card>

      {busy && !versions && !analysis && <ResultSkeleton />}

      {versions && (
        <Card className="animate-fade-in">
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                {versions.list.length > 1 ? "Your 3 versions" : "Your rewrite"}
                <DemoBadge show={versions.demo} />
              </span>
            }
            helper="Read it once before posting — make sure it still sounds like you."
          />
          <div className="space-y-3">
            {versions.list.map((text, i) => (
              <ResultBlock key={i} label={versions.list.length > 1 ? `Version ${i + 1}` : undefined} text={text} />
            ))}
          </div>
        </Card>
      )}

      {analysis && (
        <Card className="animate-fade-in">
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                Caption analysis <DemoBadge show={analysis.demo} />
              </span>
            }
          />
          <dl className="grid gap-3 text-[13.5px] sm:grid-cols-2">
            <AnalysisItem term="Hook" value={analysis.data.hook} />
            <AnalysisItem term="Main message" value={analysis.data.mainMessage} />
            <AnalysisItem term="Tone" value={analysis.data.tone} />
            <AnalysisItem term="Structure" value={analysis.data.structure} />
          </dl>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <AnalysisList title="Why it works" items={analysis.data.whyItWorks} />
            <AnalysisList title="How to make it better" items={analysis.data.improvements} />
          </div>
        </Card>
      )}
    </div>
  );
}

function ResultBlock({ label, text }: { label?: string; text: string }) {
  return (
    <div className="rounded-2xl border border-line bg-[#FCFCFD] p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[12px] font-semibold text-muted">
          {label ? `${label} · ` : ""}
          {wordCount(text)} words
        </span>
        <CopyButton text={text} />
      </div>
      <p className="text-[14px] leading-relaxed whitespace-pre-wrap text-ink">{text}</p>
    </div>
  );
}

function AnalysisItem({ term, value }: { term: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#FAFAFC] p-3">
      <dt className="text-[12px] font-semibold text-muted">{term}</dt>
      <dd className="mt-0.5 text-ink">{value}</dd>
    </div>
  );
}

function AnalysisList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-1.5 text-[13px] font-semibold text-ink">{title}</h3>
      <ul className="list-disc space-y-1 pl-5 text-[13.5px] text-ink/90">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function ResultSkeleton() {
  return (
    <Card aria-hidden className="space-y-2">
      <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
      <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
      <div className="h-3 w-11/12 animate-pulse rounded bg-gray-100" />
      <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
    </Card>
  );
}
