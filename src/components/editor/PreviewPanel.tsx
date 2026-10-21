"use client";

import { useRef, useState } from "react";
import { Check, TriangleAlert } from "lucide-react";
import { SIZE_PIXELS } from "@/config/options";
import { TEMPLATE_MAP, type CheckId } from "@/config/templates";
import { ExportButtons } from "@/components/graphic/ExportButtons";
import { PostGraphic, isLightColor } from "@/components/graphic/PostGraphic";
import { ScaledPreview } from "@/components/graphic/ScaledPreview";
import type { GraphicData } from "@/components/graphic/types";
import { Card } from "@/components/ui/Card";
import { cx } from "@/lib/cx";
import { formatHandle } from "@/lib/text";
import type { TemplateId } from "@/config/templates";

const CHECK_LABELS: Record<CheckId, string> = {
  text: "Text added",
  fit: "Text fits without clipping",
  photo: "Profile photo added",
  username: "@username legible",
  main: "Main image added",
  img1: "Image 1 added",
  img2: "Image 2 added",
};

export function PreviewPanel({
  data,
  caption,
  pinnedComment,
}: {
  data: GraphicData & { templateId: TemplateId };
  caption: string;
  pinnedComment: string;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [fits, setFits] = useState(true);
  const def = TEMPLATE_MAP[data.templateId];
  const size = SIZE_PIXELS[data.look.size];
  const hasText = data.text.trim().length > 0;
  const handle = formatHandle(data.identity.handle);

  const passed: Record<CheckId, boolean> = {
    text: hasText,
    fit: !hasText || fits,
    photo: Boolean(data.identity.photo),
    username: data.identity.showUsername && handle.length > 1 && handle.length <= 31,
    main: Boolean(data.images.main),
    img1: Boolean(data.images.img1),
    img2: Boolean(data.images.img2),
  };

  const missingImages = def.checks.filter((c) => (c === "main" || c === "img1" || c === "img2") && !passed[c]);
  let blockedReason: string | null = null;
  if (missingImages.includes("main")) blockedReason = "Add a main image before downloading or saving.";
  else if (missingImages.length === 2) blockedReason = "Add image 1 and image 2 before downloading or saving.";
  else if (missingImages.length === 1) blockedReason = `Add ${missingImages[0] === "img1" ? "image 1" : "image 2"} before downloading or saving.`;

  const lightBackground = def.kind === "quote" || def.kind === "brandedTwoImage" || (def.kind !== "darkQuote" && isLightColor(def.background) && data.look.background === "default") || data.look.background === "white";

  return (
    <Card className="p-4 sm:p-5">
      <h2 className="mb-3 text-[16px] font-semibold text-ink">Live preview</h2>
      <div className="mx-auto w-full max-w-[300px] md:max-w-none">
        <ScaledPreview width={size.width} height={size.height} bordered={lightBackground}>
          <PostGraphic data={data} nodeRef={nodeRef} onFitChange={setFits} />
        </ScaledPreview>
      </div>
      <ul className="mt-3 space-y-1" aria-label="Checklist">
        {def.checks.map((c) => (
          <li key={c} className={cx("flex items-center gap-1.5 text-[12.5px]", passed[c] ? "text-muted" : "text-red-600")}>
            {passed[c] ? <Check className="size-3.5" aria-hidden /> : <TriangleAlert className="size-3.5" aria-hidden />}
            {CHECK_LABELS[c]}
            <span className="sr-only">{passed[c] ? "(done)" : "(missing)"}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3">
        <ExportButtons
          getNode={() => nodeRef.current}
          size={size}
          meta={{ text: data.text, caption, pinnedComment, style: def.name }}
          blockedReason={blockedReason}
          disabled={!hasText}
        />
      </div>
    </Card>
  );
}
