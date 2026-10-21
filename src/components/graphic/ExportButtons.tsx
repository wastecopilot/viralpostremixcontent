"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheck, Download, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ErrorNote } from "@/components/ui/Notice";
import { downloadDataUrl, exportNode, fileNameFor, type PixelSize } from "@/lib/export";
import { useDownloads, useSavedPosts } from "@/lib/state";

export interface SaveMeta {
  text: string;
  caption: string;
  pinnedComment: string;
  style: string;
}

/** "Download" + "Save to All Content" buttons, with the free-download counter. */
export function ExportButtons({
  getNode,
  size,
  meta,
  blockedReason,
  disabled = false,
}: {
  getNode: () => HTMLElement | null;
  size: PixelSize;
  meta: SaveMeta;
  /** When set, both buttons are disabled and this red message is shown. */
  blockedReason?: string | null;
  /** Disables both buttons without a message (for example when there is no text yet). */
  disabled?: boolean;
}) {
  const downloads = useDownloads();
  const posts = useSavedPosts();
  const [busy, setBusy] = useState<"download" | "save" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const download = async () => {
    const node = getNode();
    if (!node) return;
    if (downloads.remaining <= 0) return;
    setBusy("download");
    setError(null);
    try {
      const png = await exportNode(node, size, "png");
      downloadDataUrl(png, fileNameFor(meta.text || meta.style));
      downloads.useOne();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    const node = getNode();
    if (!node) return;
    setBusy("save");
    setError(null);
    setSaved(false);
    try {
      const jpeg = await exportNode(node, size, "jpeg");
      const ok = posts.add({ image: jpeg, width: size.width, height: size.height, ...meta });
      if (ok) setSaved(true);
      else setError("Your browser storage is full. Delete a few saved posts on the All Content page, then try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saving failed. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const outOfDownloads = downloads.remaining <= 0;

  return (
    <div className="space-y-2">
      {blockedReason && <p className="text-[12.5px] text-red-600">{blockedReason}</p>}
      <div className="flex flex-wrap gap-2">
        <Button
          icon={<Download className="size-4" aria-hidden />}
          onClick={download}
          loading={busy === "download"}
          disabled={disabled || Boolean(blockedReason) || outOfDownloads || busy !== null}
        >
          Download
        </Button>
        <Button
          variant="primary"
          icon={<Save className="size-4" aria-hidden />}
          onClick={save}
          loading={busy === "save"}
          disabled={disabled || Boolean(blockedReason) || busy !== null}
        >
          Save to All Content
        </Button>
      </div>
      <p className="text-[12px] text-muted">
        {downloads.remaining} free download{downloads.remaining === 1 ? "" : "s"} remaining
      </p>
      {outOfDownloads && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-[12.5px] text-amber-900">
          You&apos;ve used your free downloads. More downloads need an upgrade — coming soon. You can still save to All Content.
        </p>
      )}
      {saved && (
        <p className="flex items-center gap-1.5 text-[12.5px] text-green-700">
          <CircleCheck className="size-3.5" aria-hidden />
          Saved!{" "}
          <Link href="/content" className="font-medium underline underline-offset-2">
            View All Content
          </Link>
        </p>
      )}
      <ErrorNote>{error}</ErrorNote>
    </div>
  );
}
