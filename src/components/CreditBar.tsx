"use client";

import { STANDARD_REMIX_COST, STARTING_CREDITS } from "@/config/credits";
import { useCredits, useDemoMode, useDownloads } from "@/lib/state";

export function CreditBar() {
  const { credits, reset } = useCredits();
  const downloads = useDownloads();
  const demo = useDemoMode();
  const percent = Math.max(0, Math.min(100, (credits / STARTING_CREDITS) * 100));
  const remixes = Math.floor(credits / STANDARD_REMIX_COST);

  return (
    <div className="rounded-[20px] border border-line bg-white px-4 py-3 shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
      {credits > 0 ? (
        <p className="text-[12.5px] text-ink/80">
          {credits} free AI credit{credits === 1 ? "" : "s"} left — about {remixes} standard remix{remixes === 1 ? "" : "es"} (
          {STANDARD_REMIX_COST} credits each). Manual editing and PNG export are free.
        </p>
      ) : (
        <p className="text-[12.5px] text-ink/80">
          You&apos;ve used all your free AI credits — nice work! You can still edit text by hand, pick styles and export
          PNGs for free.
          {demo && (
            <>
              {" "}
              <button
                type="button"
                className="font-semibold text-accent underline underline-offset-2"
                onClick={() => {
                  reset();
                  downloads.reset();
                }}
              >
                Reset demo credits
              </button>
            </>
          )}
        </p>
      )}
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-accent-soft"
        role="progressbar"
        aria-label="Free AI credits left"
        aria-valuemin={0}
        aria-valuemax={STARTING_CREDITS}
        aria-valuenow={credits}
      >
        <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
