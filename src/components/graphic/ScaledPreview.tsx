"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";

/** Shows a full-size (1080 px wide) graphic shrunk to fit the space on screen. */
export function ScaledPreview({
  width,
  height,
  children,
  className,
  bordered,
}: {
  width: number;
  height: number;
  children: ReactNode;
  className?: string;
  bordered?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [boxWidth, setBoxWidth] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setBoxWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale = boxWidth > 0 ? boxWidth / width : 0;

  return (
    <div
      ref={wrapRef}
      className={cx("relative w-full overflow-hidden rounded-2xl", bordered && "ring-1 ring-line", className)}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          visibility: scale > 0 ? "visible" : "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
