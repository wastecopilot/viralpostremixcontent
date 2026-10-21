"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { Upload, X } from "lucide-react";
import { cx } from "@/lib/cx";
import { readImageFile } from "@/lib/image";
import { ErrorNote } from "./Notice";

/** A dashed "Click to upload" box that shows a preview once a picture is chosen. */
export function UploadBox({
  title,
  hint,
  value,
  onChange,
  maxSide = 1600,
  className,
  boxClassName,
  compact,
}: {
  title?: string;
  hint: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  maxSide?: number;
  className?: string;
  boxClassName?: string;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      onChange(await readImageFile(file, maxSide));
    } catch (err) {
      setError(err instanceof Error ? err.message : "That image could not be used.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void handleFile(event.dataTransfer.files[0]);
  };

  return (
    <div className={className}>
      {title && (
        <label htmlFor={inputId} className="mb-1.5 block text-[13px] font-semibold text-ink">
          {title}
        </label>
      )}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cx(
          "relative flex items-center justify-center overflow-hidden rounded-xl border border-dashed transition-colors",
          dragging ? "border-accent bg-accent-soft/50" : "border-gray-300 bg-white hover:border-accent/60",
          compact ? "min-h-28" : "min-h-56",
          boxClassName,
        )}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
            <img
              src={value}
              alt={title ? `${title} preview` : "Uploaded image preview"}
              className="absolute inset-0 size-full object-contain p-2"
            />
            <div className="absolute right-2 bottom-2 flex gap-1.5">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-lg border border-line bg-white/95 px-2.5 py-1 text-[12px] font-medium text-ink shadow-sm hover:bg-white"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                aria-label="Remove image"
                className="rounded-lg border border-line bg-white/95 p-1.5 text-muted shadow-sm hover:bg-white hover:text-red-600"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex size-full flex-col items-center justify-center gap-1 p-4 text-center"
          >
            <Upload className={cx("mb-1 size-4 text-ink/70", loading && "animate-pulse")} aria-hidden />
            <span className="text-[13px] font-semibold text-ink">{loading ? "Loading…" : "Click to upload"}</span>
            <span className="text-[12px] text-muted">{hint}</span>
          </button>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>
      <ErrorNote className="mt-1.5">{error}</ErrorNote>
    </div>
  );
}
