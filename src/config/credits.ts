// ─────────────────────────────────────────────────────────────
// CREDIT COSTS — how many free AI credits each button uses.
// Manual editing and PNG export are always free.
// ─────────────────────────────────────────────────────────────

export const STARTING_CREDITS = 30;
export const STANDARD_REMIX_COST = 6;
export const FREE_DOWNLOADS = 5;
/** One free AI image every this many hours (Caption → Image). */
export const FREE_IMAGE_EVERY_HOURS = 6;

export const COSTS = {
  remixPost: 6,
  rewriteAgain: 2,
  rewriteCaption: 2,
  analyzeCaption: 1,
  captionVersions: 2,
  pinnedComment: 1,
  pinnedVersions: 2,
  improveText: 1,
  textVersions: 2,
  suggestAccents: 1,
  recommendStyle: 1,
  captionAndComment: 3,
  generateCaption: 2,
  generatePinned: 1,
  idea: 5,
  captionToImage: 10,
  aiBackground: 10,
} as const;

export type CostKey = keyof typeof COSTS;
