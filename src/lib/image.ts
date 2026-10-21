"use client";

// Reads an uploaded picture and makes it smaller so it is quick to use and save.

const MAX_FILE_BYTES = 25 * 1024 * 1024;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("load failed"));
    img.src = src;
  });
}

/**
 * Turns an uploaded file into a JPEG data URL, at most `maxSide` pixels wide/tall.
 * Throws an Error with a friendly message if the file can't be used.
 */
export async function readImageFile(file: File, maxSide: number, quality = 0.88): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (PNG or JPG).");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("That image is over 25 MB. Please pick a smaller one.");
  }
  const url = URL.createObjectURL(file);
  try {
    let img: HTMLImageElement;
    try {
      img = await loadImage(url);
    } catch {
      throw new Error("We couldn't open that image. Please use a PNG or JPG (iPhone HEIC photos may not work).");
    }
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser could not process that image.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}
