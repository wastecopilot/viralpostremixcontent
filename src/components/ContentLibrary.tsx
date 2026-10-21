"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, FolderOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { ErrorNote } from "@/components/ui/Notice";
import { downloadDataUrl, fileNameFor } from "@/lib/export";
import { useDownloads, useSavedPosts, type SavedPost } from "@/lib/state";
import { useHydrated } from "@/lib/store";

/** Converts the saved picture to a PNG file for download. */
async function toPng(src: string, width: number, height: number): Promise<string> {
  const img = new Image();
  img.src = src;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = width || img.naturalWidth;
  canvas.height = height || img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

export function ContentLibrary() {
  const hydrated = useHydrated();
  const { posts, remove } = useSavedPosts();
  const downloads = useDownloads();

  return (
    <main className="mx-auto w-full max-w-[930px] px-4 pt-6 pb-24 sm:pt-8">
      <h1 className="flex items-center gap-2 text-[24px] font-bold tracking-tight text-ink sm:text-[26px]">
        <FolderOpen className="size-6 text-accent" aria-hidden />
        All Content
      </h1>
      <p className="mt-1 text-[13.5px] text-muted">
        Graphics you saved, with their captions. They are kept in this browser only.
      </p>

      {!hydrated ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-[20px] border border-line bg-white" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="mt-6 flex flex-col items-center py-12 text-center">
          <FolderOpen className="size-8 text-accent/60" aria-hidden />
          <h2 className="mt-3 text-[16px] font-semibold text-ink">Nothing saved yet</h2>
          <p className="mt-1 max-w-sm text-[13px] text-muted">
            Make a graphic on the Remix page and press <strong>Save to All Content</strong>. It will show up here.
          </p>
          <Link
            href="/remix"
            className="mt-4 inline-flex h-9 items-center rounded-[10px] bg-accent px-4 text-[13.5px] font-semibold text-white hover:bg-accent-hover"
          >
            Go to the Remixer
          </Link>
        </Card>
      ) : (
        <>
          <p className="mt-4 text-[12.5px] text-muted">
            {posts.length} saved post{posts.length === 1 ? "" : "s"} · {downloads.remaining} free download
            {downloads.remaining === 1 ? "" : "s"} remaining
          </p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={() => remove(post.id)}
                canDownload={downloads.remaining > 0}
                onDownloaded={downloads.useOne}
              />
            ))}
          </div>
          {downloads.remaining === 0 && (
            <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-[12.5px] text-amber-900">
              You&apos;ve used your free downloads. More downloads need an upgrade — coming soon.
            </p>
          )}
        </>
      )}
    </main>
  );
}

function PostCard({
  post,
  onDelete,
  canDownload,
  onDownloaded,
}: {
  post: SavedPost;
  onDelete: () => void;
  canDownload: boolean;
  onDownloaded: () => boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = async () => {
    setBusy(true);
    setError(null);
    try {
      const png = await toPng(post.image, post.width, post.height);
      downloadDataUrl(png, fileNameFor(post.text || post.style));
      onDownloaded();
    } catch {
      setError("Download failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden p-0! sm:p-0!">
      {/* eslint-disable-next-line @next/next/no-img-element -- saved data URL */}
      <img
        src={post.image}
        alt={post.text ? `Graphic: ${post.text.slice(0, 80)}` : `${post.style} graphic`}
        className="w-full border-b border-line object-cover"
        style={{ aspectRatio: `${post.width} / ${post.height}` }}
      />
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11.5px] text-muted">
          {post.style} · {new Date(post.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
        </p>
        {post.caption ? (
          <p className="mt-1.5 line-clamp-3 text-[13px] whitespace-pre-wrap text-ink/90">{post.caption}</p>
        ) : (
          <p className="mt-1.5 text-[12.5px] text-muted italic">No caption saved.</p>
        )}
        {post.pinnedComment && (
          <p className="mt-1.5 line-clamp-2 text-[12px] text-muted">
            <span className="font-medium text-ink/70">Pinned:</span> {post.pinnedComment}
          </p>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          <Button size="sm" icon={<Download className="size-3.5" aria-hidden />} onClick={download} loading={busy} disabled={!canDownload}>
            Download
          </Button>
          <CopyButton text={post.caption} label="Copy caption" />
          {confirming ? (
            <span className="flex items-center gap-1.5">
              <Button size="sm" className="bg-red-600! text-white! hover:bg-red-700!" onClick={onDelete}>
                Delete
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                Keep
              </Button>
            </span>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              icon={<Trash2 className="size-3.5" aria-hidden />}
              onClick={() => setConfirming(true)}
              aria-label="Delete this post"
            >
              Delete
            </Button>
          )}
        </div>
        <ErrorNote className="mt-2">{error}</ErrorNote>
      </div>
    </Card>
  );
}
