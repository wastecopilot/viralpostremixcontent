import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "ghost" | "link";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
  /** Shows "· N credits" inside the button when more than 1. */
  cost?: number;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-sm hover:bg-accent-hover disabled:bg-accent disabled:opacity-45 disabled:hover:bg-accent",
  secondary:
    "border border-line bg-white text-ink/80 shadow-[0_1px_2px_rgba(16,24,40,0.05)] hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white",
  ghost: "text-muted hover:bg-gray-100 hover:text-ink disabled:opacity-50",
  link: "text-accent underline-offset-2 hover:underline disabled:opacity-50 px-0! py-0! h-auto!",
};

const SIZES = {
  sm: "h-8 px-3 text-[12.5px] gap-1.5 rounded-lg",
  md: "h-9 px-4 text-[13.5px] gap-2 rounded-[10px]",
  lg: "h-11 px-5 text-[14.5px] gap-2 rounded-xl",
};

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  icon,
  cost,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        "inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
      {cost !== undefined && cost > 1 && (
        <span className={cx("font-normal", variant === "primary" ? "text-white/80" : "text-muted")}>· {cost} credits</span>
      )}
    </button>
  );
}
