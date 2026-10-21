"use client";

import { useState } from "react";
import { Layers, MessageSquare, Sparkles } from "lucide-react";
import { COSTS } from "@/config/credits";
import { CAPTION_GOALS, CAPTION_LENGTHS, CTA_OPTIONS, PLATFORMS } from "@/config/options";
import type { CaptionWant } from "@/lib/prompts";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, FieldLabel } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { TextArea } from "@/components/ui/Inputs";
import { DemoBadge, ErrorNote } from "@/components/ui/Notice";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import type { Audience } from "@/lib/state";
import { wordCount } from "@/lib/text";
import { useAi } from "@/lib/useAi";
import type { CaptionSettings } from "./editorState";

interface CaptionResult {
  captions: string[];
  pinnedComments: string[];
}

export function CaptionCard({
  cap,
  onChange,
  graphicText,
  brandVoice,
  audience,
}: {
  cap: CaptionSettings;
  onChange: (p: Partial<CaptionSettings>) => void;
  graphicText: string;
  brandVoice: string;
  audience: Audience | null;
}) {
  const { run, busy, error } = useAi();
  const [captionOptions, setCaptionOptions] = useState<string[] | null>(null);
  const [pinnedOptions, setPinnedOptions] = useState<string[] | null>(null);
  const [demo, setDemo] = useState(false);

  const hasSource = Boolean(graphicText.trim() || cap.existingCaption.trim() || cap.sourceFacts.trim());

  const generate = async (want: CaptionWant, cost: number) => {
    const data = await run<CaptionResult>(
      want,
      "/api/caption",
      {
        want,
        graphicText,
        goal: cap.goal,
        length: cap.length,
        cta: cap.cta,
        platform: cap.platform,
        optimizeDiscussion: cap.optimizeDiscussion,
        sourceFacts: cap.showFacts ? cap.sourceFacts : "",
        existingCaption: cap.showExisting ? cap.existingCaption : "",
        brandVoice,
        audience: audience ? { name: audience.name, who: audience.who, problem: audience.problem, tone: audience.tone } : null,
      },
      cost,
    );
    if (!data) return;
    setDemo(Boolean(data.demo));
    if (want === "both") {
      onChange({ caption: data.captions[0] ?? cap.caption, pinned: data.pinnedComments[0] ?? cap.pinned });
    } else if (want === "caption") {
      onChange({ caption: data.captions[0] ?? cap.caption });
    } else if (want === "captionVersions") {
      setCaptionOptions(data.captions);
    } else if (want === "pinned") {
      onChange({ pinned: data.pinnedComments[0] ?? cap.pinned });
    } else {
      setPinnedOptions(data.pinnedComments);
    }
  };

  const disabled = !hasSource || busy !== null;
  const words = wordCount(cap.caption);

  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            Caption + Pinned Comment <DemoBadge show={demo} />
          </span>
        }
        helper="The graphic earns attention, the caption expands the idea, the pinned comment starts a second conversation."
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <FieldLabel>What should this caption do?</FieldLabel>
          <Select ariaLabel="Caption goal" value={cap.goal} options={CAPTION_GOALS} onChange={(goal) => onChange({ goal })} />
        </div>
        <div>
          <FieldLabel>Length</FieldLabel>
          <Select ariaLabel="Caption length" value={cap.length} options={CAPTION_LENGTHS} onChange={(length) => onChange({ length })} />
        </div>
        <div>
          <FieldLabel>CTA</FieldLabel>
          <Select ariaLabel="Call to action" value={cap.cta} options={CTA_OPTIONS} onChange={(cta) => onChange({ cta })} />
        </div>
        <div>
          <FieldLabel>Platform</FieldLabel>
          <Select ariaLabel="Platform" value={cap.platform} options={PLATFORMS} onChange={(platform) => onChange({ platform })} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Toggle
          checked={cap.optimizeDiscussion}
          onChange={(optimizeDiscussion) => onChange({ optimizeDiscussion })}
          label="Optimize for discussion"
        />
        <button
          type="button"
          onClick={() => onChange({ showFacts: !cap.showFacts })}
          aria-expanded={cap.showFacts}
          className="text-[12.5px] text-accent underline underline-offset-2 hover:text-accent-hover"
        >
          Add source facts (numbers kept exactly)
        </button>
        <button
          type="button"
          onClick={() => onChange({ showExisting: !cap.showExisting })}
          aria-expanded={cap.showExisting}
          className="text-[12.5px] text-accent underline underline-offset-2 hover:text-accent-hover"
        >
          Paste existing caption
        </button>
      </div>

      {cap.showFacts && (
        <div className="animate-fade-in mt-3">
          <FieldLabel htmlFor="cap-facts">Source facts</FieldLabel>
          <TextArea
            id="cap-facts"
            rows={3}
            value={cap.sourceFacts}
            onChange={(e) => onChange({ sourceFacts: e.target.value })}
            placeholder="Facts and numbers to keep exactly as written, e.g. “Went from 200 to 3,400 followers in 6 months.”"
          />
        </div>
      )}
      {cap.showExisting && (
        <div className="animate-fade-in mt-3">
          <FieldLabel htmlFor="cap-existing">Existing caption</FieldLabel>
          <TextArea
            id="cap-existing"
            rows={4}
            value={cap.existingCaption}
            onChange={(e) => onChange({ existingCaption: e.target.value })}
            placeholder="Paste a caption you already have — the AI improves it and keeps its meaning."
          />
        </div>
      )}

      <div className="mt-4">
        <Button
          variant="primary"
          icon={<Sparkles className="size-4" aria-hidden />}
          onClick={() => generate("both", COSTS.captionAndComment)}
          loading={busy === "both"}
          disabled={disabled}
          cost={COSTS.captionAndComment}
        >
          Generate Caption + Comment
        </Button>
        {!hasSource && <p className="mt-1.5 text-[12px] text-muted">Add your graphic text above first — the caption builds on it.</p>}
        <ErrorNote className="mt-2">{error}</ErrorNote>
      </div>

      <div className="mt-5">
        <FieldLabel htmlFor="cap-caption" right={<span className="text-[12px] text-muted">{words} word{words === 1 ? "" : "s"}</span>}>
          Caption
        </FieldLabel>
        <TextArea
          id="cap-caption"
          rows={6}
          value={cap.caption}
          onChange={(e) => onChange({ caption: e.target.value })}
          placeholder="Generate a caption or write your own"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            size="sm"
            icon={<Sparkles className="size-3.5" aria-hidden />}
            onClick={() => generate("caption", COSTS.generateCaption)}
            loading={busy === "caption"}
            disabled={disabled}
            cost={COSTS.generateCaption}
          >
            Generate Caption
          </Button>
          <Button
            size="sm"
            icon={<Layers className="size-3.5" aria-hidden />}
            onClick={() => generate("captionVersions", COSTS.captionVersions)}
            loading={busy === "captionVersions"}
            disabled={disabled}
            cost={COSTS.captionVersions}
          >
            Give Me 3 Versions
          </Button>
          <CopyButton text={cap.caption} label="Copy Caption" variant="ghost" />
        </div>
        {captionOptions && (
          <OptionsList
            title="Pick a caption"
            options={captionOptions}
            onPick={(caption) => {
              onChange({ caption });
              setCaptionOptions(null);
            }}
            onClose={() => setCaptionOptions(null)}
          />
        )}
      </div>

      <div className="mt-5">
        <FieldLabel htmlFor="cap-pinned">
          <span className="inline-flex items-center gap-1.5">
            <MessageSquare className="size-3.5" aria-hidden /> Pinned Comment
          </span>
        </FieldLabel>
        <TextArea
          id="cap-pinned"
          rows={2}
          value={cap.pinned}
          onChange={(e) => onChange({ pinned: e.target.value })}
          placeholder="An easy question that opens a second conversation"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            size="sm"
            icon={<Sparkles className="size-3.5" aria-hidden />}
            onClick={() => generate("pinned", COSTS.generatePinned)}
            loading={busy === "pinned"}
            disabled={disabled}
          >
            Generate Pinned Comment
          </Button>
          <Button
            size="sm"
            icon={<Layers className="size-3.5" aria-hidden />}
            onClick={() => generate("pinnedVersions", COSTS.pinnedVersions)}
            loading={busy === "pinnedVersions"}
            disabled={disabled}
            cost={COSTS.pinnedVersions}
          >
            Give Me 3 Pinned Comments
          </Button>
          <CopyButton text={cap.pinned} label="Copy Pinned Comment" variant="ghost" />
        </div>
        {pinnedOptions && (
          <OptionsList
            title="Pick a pinned comment"
            options={pinnedOptions}
            onPick={(pinned) => {
              onChange({ pinned });
              setPinnedOptions(null);
            }}
            onClose={() => setPinnedOptions(null)}
          />
        )}
      </div>
    </Card>
  );
}

function OptionsList({
  title,
  options,
  onPick,
  onClose,
}: {
  title: string;
  options: string[];
  onPick: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="animate-fade-in mt-3 space-y-2 rounded-2xl border border-line bg-[#FAFAFC] p-3">
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-semibold text-ink">{title}</span>
        <button type="button" onClick={onClose} className="text-[12px] text-muted hover:text-ink">
          Close
        </button>
      </div>
      {options.map((option, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-xl border border-line bg-white p-3 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-[13.5px] whitespace-pre-wrap text-ink">{option}</p>
          <Button size="sm" variant="primary" onClick={() => onPick(option)}>
            Use this
          </Button>
        </div>
      ))}
    </div>
  );
}
