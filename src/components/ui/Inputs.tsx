import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cx } from "@/lib/cx";

const BASE =
  "w-full rounded-xl border border-line bg-white text-[14px] text-ink placeholder:text-gray-400 shadow-[0_1px_2px_rgba(16,24,40,0.04)] outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15";

export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(BASE, "resize-y px-3.5 py-3 leading-relaxed", className)} {...rest} />;
}

export function TextInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(BASE, "h-10 px-3.5", className)} {...rest} />;
}
