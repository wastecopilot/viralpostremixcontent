"use client";

// Auto-fit: makes the text as big as possible while still fitting its box.
// It shrinks step by step and never lets the text get cut off.

import { useEffectEvent, useLayoutEffect, useRef, useSyncExternalStore } from "react";

let fontsVersion = 0;
const fontListeners = new Set<() => void>();
let fontsHooked = false;

function subscribeFonts(listener: () => void) {
  fontListeners.add(listener);
  if (!fontsHooked && typeof document !== "undefined" && document.fonts) {
    fontsHooked = true;
    const bump = () => {
      fontsVersion += 1;
      fontListeners.forEach((l) => l());
    };
    document.fonts.addEventListener("loadingdone", bump);
    void document.fonts.ready.then(bump);
  }
  return () => {
    fontListeners.delete(listener);
  };
}

/** Changes whenever new web fonts finish loading, so text gets measured again. */
export function useFontsVersion(): number {
  return useSyncExternalStore(
    subscribeFonts,
    () => fontsVersion,
    () => 0,
  );
}

const ABSOLUTE_MIN = 14;

export function useFitText(signature: string, max: number, min: number, onFit?: (fits: boolean) => void) {
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const reportFit = useEffectEvent((fits: boolean) => onFit?.(fits));

  useLayoutEffect(() => {
    const box = boxRef.current;
    const content = contentRef.current;
    const text = textRef.current;
    if (!box || !content || !text) {
      reportFit(true);
      return;
    }
    const fits = () =>
      content.scrollHeight <= box.clientHeight + 1 && content.scrollWidth <= content.clientWidth + 1;
    const setSize = (px: number) => {
      text.style.fontSize = `${px}px`;
    };

    text.style.overflowWrap = "normal";
    setSize(max);
    let best = max;
    if (!fits()) {
      let lo = min;
      let hi = max;
      best = min;
      for (let i = 0; i < 10; i++) {
        const mid = (lo + hi) / 2;
        setSize(mid);
        if (fits()) {
          best = mid;
          lo = mid;
        } else {
          hi = mid;
        }
      }
    }
    let size = Math.floor(best);
    setSize(size);
    let ok = fits();
    // Still too big at the normal minimum: keep shrinking instead of cutting text off.
    while (!ok && size > ABSOLUTE_MIN) {
      size -= 2;
      setSize(size);
      ok = fits();
    }
    if (!ok) {
      text.style.overflowWrap = "anywhere";
      ok = fits();
    }
    reportFit(ok);
  }, [signature, max, min]);

  return { boxRef, contentRef, textRef };
}
