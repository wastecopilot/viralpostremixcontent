import type { ReactNode } from "react";
import { Info, TriangleAlert } from "lucide-react";
import { cx } from "@/lib/cx";

export function ErrorNote({ children, className }: { children: ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <p role="alert" className={cx("flex items-start gap-1.5 text-[13px] text-red-600", className)}>
      <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

export function InfoNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cx("flex items-start gap-1.5 rounded-xl bg-accent-soft/60 px-3 py-2 text-[12.5px] text-[#3A2F8F]", className)}>
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

export function DemoBadge({ show }: { show?: boolean }) {
  if (!show) return null;
  return (
    <span
      title="No Gemini key yet, so this is a sample result. Add your key to .env.local for real AI."
      className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800"
    >
      Demo sample
    </span>
  );
}
