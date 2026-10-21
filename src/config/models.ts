// ─────────────────────────────────────────────────────────────
// AI MODEL NAMES — change these if Google releases newer models.
// Full list: https://ai.google.dev/gemini-api/docs/models
// ─────────────────────────────────────────────────────────────

export const models = {
  /**
   * Reads text, writes text and reads screenshots (vision).
   * (The newer "gemini-3.8-flash" was often overloaded when this app was built — you can try it again later.)
   */
  text: "gemini-3.6-flash",
  /** Backup used automatically when the main text model is busy. */
  textBackup: "gemini-3.5-flash-lite",
  /** Creates images. */
  image: "gemini-nano-banana-2.1",
  /** Backup used automatically when the main image model is busy. */
  imageBackup: "gemini-3.1-flash-image",
} as const;

/** Base address of the Gemini API. */
export const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
