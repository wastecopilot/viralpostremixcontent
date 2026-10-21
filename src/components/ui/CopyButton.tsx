"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "./Button";

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers: fall back to a hidden text box.
    const box = document.createElement("textarea");
    box.value = text;
    box.style.position = "fixed";
    box.style.opacity = "0";
    document.body.appendChild(box);
    box.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    box.remove();
    return ok;
  }
}

export function CopyButton({
  text,
  label = "Copy",
  size = "sm",
  variant = "secondary",
  disabled,
}: {
  text: string;
  label?: string;
  size?: "sm" | "md";
  variant?: "secondary" | "ghost";
  disabled?: boolean;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  return (
    <Button
      size={size}
      variant={variant}
      disabled={disabled || !text.trim()}
      icon={state === "copied" ? <Check className="size-3.5 text-green-600" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      onClick={async () => {
        const ok = await copyText(text);
        setState(ok ? "copied" : "failed");
        setTimeout(() => setState("idle"), 1600);
      }}
    >
      {state === "copied" ? "Copied!" : state === "failed" ? "Copy failed" : label}
    </Button>
  );
}
