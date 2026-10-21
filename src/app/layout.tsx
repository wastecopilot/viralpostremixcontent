import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import { brand } from "@/config/brand";
import { TopBar } from "@/components/TopBar";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: `${brand.toolName} · ${brand.name}`,
  description: brand.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: brand.colors.pageBackground,
};

const brandVariables = {
  "--brand-accent": brand.colors.accent,
  "--brand-accent-hover": brand.colors.accentHover,
  "--brand-accent-soft": brand.colors.accentSoft,
  "--brand-page": brand.colors.pageBackground,
  "--brand-border": brand.colors.border,
  "--brand-ink": brand.colors.ink,
  "--brand-muted": brand.colors.muted,
} as CSSProperties;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables} style={brandVariables}>
      <body className="min-h-screen bg-page text-ink antialiased">
        <TopBar />
        {children}
      </body>
    </html>
  );
}
