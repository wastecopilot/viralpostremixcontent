// ─────────────────────────────────────────────────────────────
// BRAND SETTINGS — change the app name, logo text and colors here.
// Everything in the app reads from this one file.
// ─────────────────────────────────────────────────────────────

export const brand = {
  /** The app name shown everywhere (top bar, helper texts, page title). */
  name: "ContentRemix",
  /** Short text shown inside the little logo square. */
  logoText: "CR",
  /** Name of the main tool page. */
  toolName: "Viral Post Remixer",
  /** Short description used for the browser tab / search engines. */
  description:
    "Upload a post that worked, rewrite it so the wording is yours, and recreate the graphic with your own photo, name and handle.",
  colors: {
    /** Main purple used for buttons, selected cards and links. */
    accent: "#5B45E0",
    /** Darker purple for button hover. */
    accentHover: "#4A35CC",
    /** Very light lavender fill for selected cards and chips. */
    accentSoft: "#ECEBFD",
    /** Page background. */
    pageBackground: "#F8F8FB",
    /** Card border. */
    border: "#E6E6EE",
    /** Headings and main text. */
    ink: "#14141F",
    /** Secondary text. */
    muted: "#6B6B7B",
    /** Used by the "Brand color" background option in the graphic editor. */
    graphicBrandColor: "#5B45E0",
  },
} as const;

export type Brand = typeof brand;
