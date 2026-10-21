"use client";

import { useRef, useState } from "react";
import { ImagePlus, SlidersHorizontal } from "lucide-react";
import { brand } from "@/config/brand";
import { COSTS } from "@/config/credits";
import {
  IMAGE_ASPECTS,
  IMAGE_TYPES,
  PEOPLE_OPTIONS,
  SIZE_PIXELS,
  VISUAL_DIRECTIONS,
  type ImageAspect,
  type ImageType,
  type PeopleOption,
  type VisualDirection,
} from "@/config/options";
import { ExportButtons } from "@/components/graphic/ExportButtons";
import { PhotoGraphic, PostGraphic } from "@/components/graphic/PostGraphic";
import { ScaledPreview } from "@/components/graphic/ScaledPreview";
import { DEFAULT_DARK_QUOTE, DEFAULT_LOOK, DEFAULT_QUOTE, NO_IMAGES, type GraphicData } from "@/components/graphic/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, FieldLabel } from "@/components/ui/Card";
import { ChipGroup } from "@/components/ui/Chip";
import { CopyButton } from "@/components/ui/CopyButton";
import { TextArea } from "@/components/ui/Inputs";
import { DemoBadge, ErrorNote } from "@/components/ui/Notice";
import { Select } from "@/components/ui/Select";
import { cx } from "@/lib/cx";
import { useFreeImage, useIdentity } from "@/lib/state";
import { useAi } from "@/lib/useAi";

type ResultType = "visual" | "engagement";

interface ImageResult {
  type: ResultType;
  image: string;
  headline: string;
  accents: string[];
  aspect: ImageAspect;
  demo: boolean;
}

const SHOW_AS = [
  { value: "visual", label: "Visual Only" },
  { value: "engagement", label: "Engagement Graphic" },
] as const;

export function CaptionImageMode() {
  const identity = useIdentity();
  const free = useFreeImage();
  const { run, busy, error } = useAi();
  const [caption, setCaption] = useState("");
  const [imageType, setImageType] = useState<ImageType>("auto");
  const [showVisual, setShowVisual] = useState(true);
  const [direction, setDirection] = useState<VisualDirection>("auto");
  const [people, setPeople] = useState<PeopleOption>("auto");
  const [aspect, setAspect] = useState<ImageAspect>("4:5");
  const [result, setResult] = useState<ImageResult | null>(null);
  const [fits, setFits] = useState(true);
  const nodeRef = useRef<HTMLDivElement>(null);

  const cost = free.isFree ? 0 : COSTS.captionToImage;

  const create = async () => {
    const wasFree = free.isFree;
    const data = await run<{ imageType: ResultType; image: string; headline: string; accents: string[] }>(
      "create",
      "/api/image",
      { purpose: "captionImage", caption, imageType, direction, people, aspect },
      cost,
    );
    if (!data) return;
    if (wasFree) free.markUsed();
    setResult({
      type: data.imageType,
      image: data.image,
      headline: data.headline,
      accents: data.accents,
      aspect,
      demo: Boolean(data.demo),
    });
  };

  const size = SIZE_PIXELS[result?.aspect ?? "4:5"];
  const graphic: GraphicData | null =
    result && result.type === "engagement"
      ? {
          templateId: "engagement",
          text: result.headline,
          accents: result.accents,
          accentColor: "yellow",
          autoLayout: false,
          identity: {
            name: identity.name,
            handle: identity.handle,
            photo: identity.photo,
            showUsername: identity.settings.showUsername,
            badge: identity.settings.badge,
          },
          look: { ...DEFAULT_LOOK, size: result.aspect },
          images: NO_IMAGES,
          darkQuote: DEFAULT_DARK_QUOTE,
          quote: DEFAULT_QUOTE,
          backgroundImage: result.image,
        }
      : null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader large title="Caption → Image" helper="Paste your Facebook caption and create an original visual or editable engagement graphic." />
        <label htmlFor="ci-caption" className="mb-1.5 block text-[13px] font-semibold text-ink">
          Paste your Facebook caption
        </label>
        <TextArea
          id="ci-caption"
          rows={7}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Paste your Facebook caption…"
          className="min-h-40"
        />
        <p className="mt-1.5 text-[12px] text-muted">Your full caption stays unchanged. Suggested graphic text comes only from its meaning.</p>

        <div className="mt-4">
          <FieldLabel>Image type</FieldLabel>
          <Select ariaLabel="Image type" value={imageType} options={IMAGE_TYPES} onChange={setImageType} />
        </div>

        <Button
          className="mt-4"
          size="sm"
          icon={<SlidersHorizontal className="size-3.5" aria-hidden />}
          onClick={() => setShowVisual((v) => !v)}
          aria-expanded={showVisual}
        >
          Visual settings
        </Button>

        {showVisual && (
          <div className="animate-fade-in mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <FieldLabel>Visual direction</FieldLabel>
              <Select ariaLabel="Visual direction" value={direction} options={VISUAL_DIRECTIONS} onChange={setDirection} />
            </div>
            <div>
              <FieldLabel>People</FieldLabel>
              <Select ariaLabel="People" value={people} options={PEOPLE_OPTIONS} onChange={setPeople} />
            </div>
            <div>
              <FieldLabel>Aspect ratio</FieldLabel>
              <Select ariaLabel="Aspect ratio" value={aspect} options={IMAGE_ASPECTS} onChange={setAspect} />
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
          <Button
            variant="primary"
            size="lg"
            icon={<ImagePlus className="size-4" aria-hidden />}
            onClick={create}
            loading={busy === "create"}
            disabled={!caption.trim() || busy !== null}
          >
            {busy === "create" ? "Creating image…" : free.isFree ? "Create Image · free" : "Create Image"}
          </Button>
          <span className="text-[12.5px] text-muted">10 AI credits · one complete image</span>
          <span className={cx("text-[12.5px]", free.isFree ? "font-medium text-green-700" : "text-muted")}>{free.countdown}</span>
        </div>
        {busy === "create" && <p className="mt-2 text-[12px] text-muted">Making a brand-new image can take up to a minute.</p>}
        <ErrorNote className="mt-3">{error}</ErrorNote>
        <p className="mt-4 text-[12px] text-muted">
          The AI creates only the original visual. {brand.name} renders Engagement Graphic text and identity crisply.
        </p>
      </Card>

      {result && (
        <Card className="animate-fade-in">
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                Your image <DemoBadge show={result.demo} />
              </span>
            }
            helper={
              result.type === "engagement"
                ? "The AI made the picture. Your text, photo and name are drawn on top — edit the text below."
                : "An original visual to post with your caption."
            }
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,380px)_1fr]">
            <ScaledPreview width={size.width} height={size.height}>
              {graphic ? (
                <PostGraphic data={graphic} nodeRef={nodeRef} onFitChange={setFits} />
              ) : (
                <PhotoGraphic src={result.image} width={size.width} height={size.height} nodeRef={nodeRef} />
              )}
            </ScaledPreview>
            <div className="space-y-4">
              <div>
                <FieldLabel>Show as</FieldLabel>
                <ChipGroup
                  label="Show as"
                  options={SHOW_AS}
                  value={result.type}
                  onChange={(type) => setResult({ ...result, type })}
                />
              </div>
              {result.type === "engagement" && (
                <div>
                  <FieldLabel htmlFor="ci-headline">Graphic text</FieldLabel>
                  <TextArea
                    id="ci-headline"
                    rows={3}
                    value={result.headline}
                    onChange={(e) => setResult({ ...result, headline: e.target.value })}
                    placeholder="Short text for the image"
                  />
                  {!fits && <p className="mt-1 text-[12px] text-red-600">That&apos;s a lot of text — shorten it so it reads well.</p>}
                  {!identity.photo && !identity.name && (
                    <p className="mt-1.5 text-[12px] text-muted">
                      Tip: add your photo and name in “Start with my own text” → Your identity and they appear here too.
                    </p>
                  )}
                </div>
              )}
              <ExportButtons
                getNode={() => nodeRef.current}
                size={size}
                meta={{
                  text: result.type === "engagement" ? result.headline : "",
                  caption,
                  pinnedComment: "",
                  style: result.type === "engagement" ? "Engagement Graphic" : "Visual Only",
                }}
                disabled={result.type === "engagement" && !result.headline.trim()}
              />
              <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
                <span className="text-[12.5px] text-muted">Your caption stays exactly as you wrote it.</span>
                <CopyButton text={caption} label="Copy caption" />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
