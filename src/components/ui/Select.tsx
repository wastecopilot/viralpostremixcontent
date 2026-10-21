"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cx } from "@/lib/cx";

export interface SelectOption<V extends string> {
  value: V;
  label: string;
}

/** A dropdown: rounded white panel, the chosen option has a lavender fill and a check mark. */
export function Select<V extends string>({
  value,
  options,
  onChange,
  id,
  ariaLabel,
  className,
  size = "md",
}: {
  value: V;
  options: readonly SelectOption<V>[];
  onChange: (value: V) => void;
  id?: string;
  ariaLabel?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const selected = options[selectedIndex];

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  const openList = () => {
    setHighlight(selectedIndex);
    setOpen(true);
  };

  const choose = (index: number) => {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) return openList();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setHighlight((h) => (h + step + options.length) % options.length);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) choose(highlight);
      else openList();
    } else if (event.key === "Escape" || event.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={cx("relative", className)}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={cx(
          "flex w-full items-center justify-between gap-2 rounded-xl border border-line bg-white text-left text-ink shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors hover:border-gray-300 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/15 focus-visible:outline-none",
          size === "sm" ? "h-8 px-2.5 text-[13px]" : "h-10 px-3.5 text-[14px]",
        )}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown className={cx("size-4 shrink-0 text-muted transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-activedescendant={`${listId}-${highlight}`}
          className="thin-scroll animate-fade-in absolute top-full left-0 z-40 mt-1 max-h-72 min-w-full overflow-auto rounded-xl border border-line bg-white p-1 shadow-[0_8px_24px_rgba(16,24,40,0.12)]"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlight(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(index)}
                className={cx(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-[14px] whitespace-nowrap",
                  isSelected ? "bg-accent-soft text-[#2A1F7A]" : index === highlight ? "bg-gray-50 text-ink" : "text-ink",
                )}
              >
                {option.label}
                {isSelected && <Check className="size-4 text-[#2A1F7A]" aria-hidden />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
