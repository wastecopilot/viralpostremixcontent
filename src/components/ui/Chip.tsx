import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export function Chip({
  selected,
  onClick,
  children,
  className,
  title,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      title={title}
      onClick={onClick}
      className={cx(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-[13px] whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        selected
          ? "border-accent bg-accent-soft font-medium text-accent"
          : "border-line bg-white text-ink/85 hover:border-gray-300 hover:bg-gray-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ChipGroup<V extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { value: V; label: string }[];
  value: V;
  onChange: (value: V) => void;
  label?: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o.value} selected={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </Chip>
      ))}
    </div>
  );
}

/** A bigger selectable card with a title and a one-line description. */
export function OptionCard({
  selected,
  onClick,
  title,
  description,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cx(
        "rounded-[14px] border px-3.5 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        selected ? "border-accent bg-accent-soft" : "border-line bg-white hover:border-gray-300 hover:bg-gray-50",
        className,
      )}
    >
      <span className={cx("block text-[13px] font-semibold", selected ? "text-[#2A1F7A]" : "text-ink")}>{title}</span>
      {description && <span className="mt-0.5 block text-[12px] leading-snug text-muted">{description}</span>}
    </button>
  );
}
