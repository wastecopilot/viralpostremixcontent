"use client";

import { useRef, useState } from "react";
import { ArrowLeft, PenLine, RotateCcw, Sparkles, WandSparkles } from "lucide-react";
import { COSTS } from "@/config/credits";
import { REWRITE_STRENGTHS, TONES, type RewriteStrength, type Tone } from "@/config/options";
import { TEMPLATE_MAP, TEMPLATES, type TemplateId } from "@/config/templates";
import { ExportButtons } from "@/components/graphic/ExportButtons";
import { PostGraphic } from "@/components/graphic/PostGraphic";
import { ScaledPreview } from "@/components/graphic/ScaledPreview";
import { DEFAULT_DARK_QUOTE, DEFAULT_LOOK, DEFAULT_QUOTE, NO_IMAGES, type GraphicData } from "@/components/graphic/types";
import { ProfilePicker } from "@/components/editor/ProfilePicker";
import type { EditorSeed } from "@/components/editor/editorState";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, FieldLabel } from "@/components/ui/Card";
import { ChipGroup, OptionCard } from "@/components/ui/Chip";
import { TextArea, TextInput } from "@/components/ui/Inputs";
import { DemoBadge, ErrorNote, InfoNote } from "@/components/ui/Notice";
import { Select } from "@/components/ui/Select";
import { UploadBox } from "@/components/ui/UploadBox";
import { cx } from "@/lib/cx";
import { SIZE_PIXELS } from "@/config/options";
import { useIdentity } from "@/lib/state";
import { wordCount } from "@/lib/text";
import { useAi } from "@/lib/useAi";

const STEPS = ["Upload & settings", "Rewrite", "Results"] as const;
type Step = 1 | 2 | 3;

/** Styles that don't need extra pictures, so the remix can show right away. */
const SIMPLE_TEMPLATES = TEMPLATES.filter((t) => t.images === 0);
const CLOSEST_SIMPLE: Partial<Record<TemplateId, TemplateId>> = {
  "viral-headline": "big-statement",
  "branded-two-image": "minimal-light",
  "breaking-news-circle": "big-statement",
};

function closestSimple(id: TemplateId): TemplateId {
  return TEMPLATE_MAP[id].images === 0 ? id : (CLOSEST_SIMPLE[id] ?? "personal-thought");
}

export function RemixPostMode({ onOpenEditor }: { onOpenEditor: (seed: EditorSeed) => void }) {
  const identity = useIdentity();
  const [step, setStep] = useState<Step>(1);
  const [furthest, setFurthest] = useState<Step>(1);
  const [original, setOriginal] = useState<string | null>(null);
  const [tone, setTone] = useState<Tone>("conversational");
  const [strength, setStrength] = useState<RewriteStrength>("moderate");
  const [extracted, setExtracted] = useState("");
  const [rewritten, setRewritten] = useState("");
  const [accents, setAccents] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState<TemplateId>("personal-thought");
  const [demo, setDemo] = useState(false);
  const [fits, setFits] = useState(true);
  const nodeRef = useRef<HTMLDivElement>(null);
  const { run, busy, error } = useAi();

  const goTo = (next: Step) => {
    setStep(next);
    setFurthest((f) => (next > f ? next : f));
  };

  const analyze = async () => {
    if (!original) return;
    const data = await run<{ extractedText: string; rewrittenText: string; suggestedTemplate: TemplateId; accents: string[] }>(
      "analyze",
      "/api/remix",
      { action: "analyze", image: original, tone, strength },
      COSTS.remixPost,
    );
    if (!data) return;
    setExtracted(data.extractedText);
    setRewritten(data.rewrittenText);
    setAccents(data.accents);
    setTemplateId(closestSimple(data.suggestedTemplate));
    setDemo(Boolean(data.demo));
    goTo(2);
  };

  const rewriteAgain = async () => {
    const data = await run<{ text: string; accents: string[] }>(
      "rewrite",
      "/api/remix",
      { action: "rewrite", text: extracted, tone, strength },
      COSTS.rewriteAgain,
    );
    if (!data) return;
    setRewritten(data.text);
    setAccents(data.accents);
    setDemo(Boolean(data.demo));
  };

  const startOver = () => {
    setStep(1);
    setFurthest(1);
    setOriginal(null);
    setExtracted("");
    setRewritten("");
    setAccents([]);
  };

  const size = SIZE_PIXELS["4:5"];
  const graphic: GraphicData = {
    templateId,
    text: rewritten,
    accents,
    accentColor: "yellow",
    autoLayout: false,
    identity: {
      name: identity.name,
      handle: identity.handle,
      photo: identity.photo,
      showUsername: identity.settings.showUsername,
      badge: identity.settings.badge,
    },
    look: DEFAULT_LOOK,
    images: NO_IMAGES,
    darkQuote: DEFAULT_DARK_QUOTE,
    quote: { ...DEFAULT_QUOTE, showBranding: true },
  };

  return (
    <div className="space-y-4">
      <ol className="flex flex-wrap gap-2" aria-label="Steps">
        {STEPS.map((label, i) => {
          const n = (i + 1) as Step;
          const current = n === step;
          const reachable = n <= furthest;
          return (
            <li key={label}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => setStep(n)}
                aria-current={current ? "step" : undefined}
                className={cx(
                  "inline-flex h-8 items-center gap-2 rounded-full border px-3 text-[12.5px] font-medium transition-colors",
                  current
                    ? "border-accent bg-white text-accent shadow-[0_0_0_1px_var(--brand-accent)]"
                    : reachable
                      ? "border-line bg-white text-ink/80 hover:border-gray-300"
                      : "border-line bg-white text-muted",
                )}
              >
                <span
                  className={cx(
                    "flex size-5 items-center justify-center rounded-full text-[11px]",
                    current ? "bg-accent-soft text-accent" : "bg-gray-100 text-muted",
                  )}
                >
                  {n}
                </span>
                {label}
              </button>
            </li>
          );
        })}
      </ol>

      {step === 1 && (
        <Card className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UploadBox
              title="Original viral post image"
              hint="Screenshot of the post you want to remix"
              value={original}
              onChange={setOriginal}
              maxSide={1600}
              boxClassName="min-h-64 sm:min-h-96"
            />
            <UploadBox
              title="Your profile image"
              hint="Used as the avatar in the new graphic"
              value={identity.photo}
              onChange={(photo) => identity.updateFields({ photo })}
              maxSide={400}
              boxClassName="min-h-56 sm:min-h-80"
            />
          </div>

          <ProfilePicker identity={identity} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="rm-name">Display name</FieldLabel>
              <TextInput
                id="rm-name"
                value={identity.name}
                onChange={(e) => identity.updateFields({ name: e.target.value })}
                placeholder="Josh Elder"
                autoComplete="name"
              />
            </div>
            <div>
              <FieldLabel htmlFor="rm-handle">Username / handle</FieldLabel>
              <TextInput
                id="rm-handle"
                value={identity.handle}
                onChange={(e) => identity.updateFields({ handle: e.target.value })}
                placeholder="@joshelder"
              />
            </div>
          </div>

          <div>
            <FieldLabel>Tone</FieldLabel>
            <ChipGroup label="Tone" options={TONES} value={tone} onChange={setTone} />
          </div>

          <div>
            <FieldLabel>Rewrite strength</FieldLabel>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:max-w-[680px]">
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

          <div className="space-y-2">
            <Button
              variant="primary"
              icon={<WandSparkles className="size-4" aria-hidden />}
              onClick={analyze}
              loading={busy === "analyze"}
              disabled={!original || busy !== null}
              cost={COSTS.remixPost}
            >
              {busy === "analyze" ? "Reading your post…" : "Analyze post"}
            </Button>
            {!original && <p className="text-[12px] text-muted">Upload the screenshot of the post first.</p>}
            <ErrorNote>{error}</ErrorNote>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="animate-fade-in">
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                Rewrite <DemoBadge show={demo} />
              </span>
            }
            helper="We read the text from your screenshot and rewrote it in fresh words. Edit either side — the right side goes on your graphic."
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="rm-extracted" right={<span className="text-[12px] text-muted">{wordCount(extracted)} words</span>}>
                Text from the post
              </FieldLabel>
              <TextArea id="rm-extracted" rows={9} value={extracted} onChange={(e) => setExtracted(e.target.value)} className="bg-[#FAFAFC]" />
            </div>
            <div>
              <FieldLabel htmlFor="rm-rewritten" right={<span className="text-[12px] text-muted">{wordCount(rewritten)} words</span>}>
                Your rewrite
              </FieldLabel>
              <TextArea id="rm-rewritten" rows={9} value={rewritten} onChange={(e) => setRewritten(e.target.value)} />
            </div>
          </div>
          <p className="mt-3 text-[12.5px] text-muted">
            Tone: {TONES.find((t) => t.value === tone)?.label} · {REWRITE_STRENGTHS.find((s) => s.value === strength)?.label}{" "}
            <button type="button" className="font-medium text-accent hover:underline" onClick={() => setStep(1)}>
              Change
            </button>
          </p>
          <InfoNote className="mt-3">
            Keep the idea, not someone else&apos;s personal story. If the original was about the author&apos;s own life, tell it
            as a lesson or observation — not as your own experience.
          </InfoNote>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="primary"
              icon={<Sparkles className="size-4" aria-hidden />}
              onClick={() => goTo(3)}
              disabled={!rewritten.trim() || busy !== null}
            >
              Create graphic
            </Button>
            <Button
              icon={<RotateCcw className="size-4" aria-hidden />}
              onClick={rewriteAgain}
              loading={busy === "rewrite"}
              disabled={!extracted.trim() || busy !== null}
              cost={COSTS.rewriteAgain}
            >
              Rewrite again
            </Button>
            <Button variant="ghost" icon={<ArrowLeft className="size-4" aria-hidden />} onClick={() => setStep(1)}>
              Back
            </Button>
          </div>
          <ErrorNote className="mt-3">{error}</ErrorNote>
        </Card>
      )}

      {step === 3 && (
        <Card className="animate-fade-in">
          <CardHeader title="Your new graphic" helper="Your photo, name and handle with your rewritten words. Download it or save it to All Content." />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,380px)_1fr]">
            <div>
              <ScaledPreview width={size.width} height={size.height} bordered>
                <PostGraphic data={graphic} nodeRef={nodeRef} onFitChange={setFits} />
              </ScaledPreview>
              {!fits && <p className="mt-2 text-[12.5px] text-red-600">The text is very long — shorten it so it reads well.</p>}
            </div>
            <div className="space-y-5">
              <div>
                <FieldLabel>Style</FieldLabel>
                <Select
                  ariaLabel="Graphic style"
                  value={templateId}
                  options={SIMPLE_TEMPLATES.map((t) => ({ value: t.id, label: t.name }))}
                  onChange={setTemplateId}
                />
                <p className="mt-1.5 text-[12px] text-muted">We picked the closest style to the original post. Try others for free.</p>
              </div>
              {!identity.photo && (
                <p className="text-[12.5px] text-muted">
                  Tip: add your profile image in step 1 so your photo shows on the graphic.
                </p>
              )}
              <ExportButtons
                getNode={() => nodeRef.current}
                size={size}
                meta={{ text: rewritten, caption: "", pinnedComment: "", style: TEMPLATE_MAP[templateId].name }}
              />
              <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
                <Button
                  icon={<PenLine className="size-4" aria-hidden />}
                  onClick={() => onOpenEditor({ text: rewritten, templateId, accents })}
                >
                  Open in full editor
                </Button>
                <button type="button" onClick={startOver} className="text-[13px] font-medium text-accent hover:underline">
                  Start over
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
