import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export function Toggle({
  checked,
  onChange,
  label,
  className,
  labelFirst,
  title,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  className?: string;
  labelFirst?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      title={title}
      onClick={() => onChange(!checked)}
      className={cx(
        "inline-flex items-center gap-2 rounded-full text-[13px] text-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        labelFirst && "flex-row-reverse",
        className,
      )}
    >
      <span
        aria-hidden
        className={cx(
          "relative inline-block h-[22px] w-[38px] shrink-0 rounded-full transition-colors",
          checked ? "bg-accent" : "bg-gray-200",
        )}
      >
        <span
          className={cx(
            "absolute top-[3px] left-[3px] size-4 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-4",
          )}
        />
      </span>
      {label && <span className="whitespace-nowrap">{label}</span>}
    </button>
  );
}
