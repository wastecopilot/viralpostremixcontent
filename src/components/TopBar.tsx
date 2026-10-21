"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@/config/brand";
import { cx } from "@/lib/cx";
import { useDemoMode } from "@/lib/state";

const LINKS = [
  { href: "/remix", label: "Remix" },
  { href: "/content", label: "All Content" },
];

export function TopBar() {
  const pathname = usePathname();
  const demo = useDemoMode();
  return (
    <header className="border-b border-line/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[930px] items-center gap-4 px-4">
        <Link href="/remix" className="flex items-center gap-2 font-bold text-ink">
          <span className="flex size-7 items-center justify-center rounded-lg bg-accent text-[11px] font-extrabold tracking-tight text-white">
            {brand.logoText}
          </span>
          <span className="text-[15px]">{brand.name}</span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Main">
          {LINKS.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                  active ? "bg-accent-soft text-accent" : "text-muted hover:bg-gray-100 hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        {demo && (
          <span
            className="ml-auto rounded-full bg-amber-100 px-2.5 py-1 text-[11.5px] font-semibold text-amber-800"
            title="No Gemini key found in .env.local, so AI buttons return sample results."
          >
            Demo mode
          </span>
        )}
      </div>
    </header>
  );
}
