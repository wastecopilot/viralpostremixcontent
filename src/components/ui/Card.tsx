import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        "rounded-[20px] border border-line bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.04),0_1px_2px_rgba(16,24,40,0.03)] sm:p-6",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  helper,
  icon,
  right,
  className,
  large,
}: {
  title: ReactNode;
  helper?: ReactNode;
  icon?: ReactNode;
  right?: ReactNode;
  className?: string;
  large?: boolean;
}) {
  return (
    <div className={cx("mb-4 flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className={cx("flex items-center gap-2 font-semibold text-ink", large ? "text-[19px]" : "text-[15px]")}>
          {icon}
          {title}
        </h2>
        {helper && <p className="mt-1 text-[13px] leading-snug text-muted">{helper}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

export function FieldLabel({
  children,
  htmlFor,
  hint,
  right,
  className,
}: {
  children: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("mb-1.5 flex items-center justify-between gap-2", className)}>
      <label htmlFor={htmlFor} className="text-[13px] font-semibold text-ink">
        {children}
        {hint && <span className="font-normal text-muted"> {hint}</span>}
      </label>
      {right}
    </div>
  );
}
