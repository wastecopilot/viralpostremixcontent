"use client";

// Turns the live preview into a picture file (PNG for download, JPEG for saving).

import { toJpeg, toPng } from "html-to-image";

export interface PixelSize {
  width: number;
  height: number;
}

export async function exportNode(node: HTMLElement, size: PixelSize, format: "png" | "jpeg" = "png"): Promise<string> {
  if (typeof document !== "undefined" && document.fonts) {
    await document.fonts.ready;
  }
  const options = {
    width: size.width,
    height: size.height,
    canvasWidth: size.width,
    canvasHeight: size.height,
    pixelRatio: 1,
    // The preview is shrunk on screen; the export uses the real full size.
    style: { transform: "none", transformOrigin: "top left", margin: "0", left: "0", top: "0" },
  };
  try {
    return format === "png"
      ? await toPng(node, options)
      : await toJpeg(node, { ...options, quality: 0.86 });
  } catch (err) {
    console.error("[export] failed", err);
    throw new Error("We couldn't create the picture. Please try again.");
  }
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function fileNameFor(base: string, ext: "png" | "jpg" = "png"): string {
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const stamp = new Date().toISOString().slice(0, 10);
  return `${slug || "post"}-${stamp}.${ext}`;
}
