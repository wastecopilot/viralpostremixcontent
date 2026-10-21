// Tiny drawings of each style for the "Choose a style" grid.

import type { CSSProperties, ReactNode } from "react";
import type { TemplateId } from "@/config/templates";

type Box = [left: number, top: number, width: number, height: number];

function Bar({ at, color, round = true }: { at: Box; color: string; round?: boolean }) {
  const [left, top, width, height] = at;
  return (
    <span
      style={{
        position: "absolute",
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        height: `${height}%`,
        background: color,
        borderRadius: round ? 999 : 1,
      }}
    />
  );
}

function Dot({ x, y, size, color, style }: { x: number; y: number; size: number; color: string; style?: CSSProperties }) {
  return (
    <span
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}%`,
        aspectRatio: "1",
        borderRadius: "50%",
        background: color,
        ...style,
      }}
    />
  );
}

function Frame({ bg, children, light }: { bg: string; children: ReactNode; light?: boolean }) {
  return (
    <span
      className="relative block aspect-[4/5] w-full overflow-hidden rounded-[7px]"
      style={{ background: bg, boxShadow: light ? "inset 0 0 0 1px #E5E7EB" : undefined }}
    >
      {children}
    </span>
  );
}

/** Avatar dot + name line at top-left. */
function HeaderLeft({ dot, line }: { dot: string; line: string }) {
  return (
    <>
      <Dot x={8} y={6} size={12} color={dot} />
      <Bar at={[25, 9, 22, 3.5]} color={line} />
    </>
  );
}

export function TemplateThumb({ id }: { id: TemplateId }) {
  switch (id) {
    case "personal-thought":
      return (
        <Frame bg="#2F3A52">
          <HeaderLeft dot="#C8CEDA" line="#C8CEDA" />
          <Bar at={[8, 22, 70, 3.5]} color="#fff" />
          <Bar at={[8, 29, 62, 3.5]} color="#fff" />
          <Bar at={[8, 36, 50, 3.5]} color="#fff" />
          <Bar at={[8, 43, 34, 2.5]} color="#9AA3B5" />
          <Bar at={[8, 50, 18, 2.5]} color="#FACC15" />
        </Frame>
      );
    case "contrast-statement":
      return (
        <Frame bg="#0F1626">
          <HeaderLeft dot="#9AA3B5" line="#9AA3B5" />
          <Bar at={[8, 22, 66, 3.5]} color="#5B6478" />
          <Bar at={[8, 30, 56, 3.5]} color="#5B6478" />
          <Bar at={[8, 40, 72, 4]} color="#fff" />
        </Frame>
      );
    case "centered-observation":
      return (
        <Frame bg="#1F2328">
          <Dot x={44} y={6} size={12} color="#9CA3AF" />
          <Bar at={[22, 42, 56, 4]} color="#fff" />
          <Bar at={[30, 50, 40, 4]} color="#fff" />
        </Frame>
      );
    case "minimal-dark":
      return (
        <Frame bg="#000">
          <HeaderLeft dot="#9CA3AF" line="#9CA3AF" />
          <Bar at={[8, 22, 72, 3.5]} color="#fff" />
          <Bar at={[8, 29, 62, 3.5]} color="#fff" />
          <Bar at={[8, 36, 44, 3.5]} color="#fff" />
        </Frame>
      );
    case "minimal-light":
      return (
        <Frame bg="#fff" light>
          <HeaderLeft dot="#4B5563" line="#6B7280" />
          <Bar at={[8, 22, 76, 5]} color="#111" />
          <Bar at={[8, 31, 62, 5]} color="#111" />
          <Bar at={[8, 40, 46, 5]} color="#111" />
        </Frame>
      );
    case "punchline-emphasis":
      return (
        <Frame bg="#fff" light>
          <HeaderLeft dot="#4B5563" line="#6B7280" />
          <Bar at={[8, 20, 72, 3]} color="#111" />
          <Bar at={[8, 26, 64, 3]} color="#111" />
          <Bar at={[8, 32, 54, 3]} color="#111" />
          <Bar at={[8, 39, 40, 3.5]} color="#E5484D" />
        </Frame>
      );
    case "big-statement":
      return (
        <Frame bg="#0B1A3F">
          <HeaderLeft dot="#C8CEDA" line="#C8CEDA" />
          <Bar at={[8, 44, 74, 7]} color="#fff" />
          <Bar at={[8, 55, 64, 7]} color="#fff" />
          <Bar at={[8, 66, 46, 7]} color="#fff" />
        </Frame>
      );
    case "viral-headline":
      return (
        <Frame bg="#000">
          <span className="absolute inset-x-0 top-0 h-[56%]" style={{ background: "linear-gradient(to bottom, #8B9099, #1B1B1D 85%, #000)" }} />
          <Bar at={[8, 55, 84, 1.2]} color="rgba(255,255,255,0.6)" round={false} />
          <Dot x={43} y={50} size={14} color="#C9CDD4" style={{ boxShadow: "0 0 0 1.5px #fff" }} />
          <Bar at={[16, 66, 68, 3.5]} color="#fff" />
          <Bar at={[24, 73, 52, 3.5]} color="#fff" />
          <Bar at={[32, 81, 36, 3]} color="#FACC15" />
        </Frame>
      );
    case "question-card":
      return (
        <Frame bg="#121C38">
          <Dot x={44} y={7} size={12} color="#C8CEDA" />
          <Bar at={[20, 42, 60, 4.5]} color="#fff" />
          <Bar at={[28, 51, 44, 4.5]} color="#fff" />
        </Frame>
      );
    case "branded-two-image":
      return (
        <Frame bg="#fff" light>
          <span className="absolute rounded-[2px]" style={{ left: "7%", top: "6%", width: "11%", aspectRatio: "1", background: "#D1D5DB" }} />
          <Bar at={[22, 7, 30, 2.5]} color="#111" />
          <Bar at={[22, 12, 20, 2]} color="#9CA3AF" />
          <Bar at={[7, 21, 82, 3.5]} color="#111" />
          <Bar at={[7, 27, 66, 3.5]} color="#111" />
          <span className="absolute rounded-[3px]" style={{ left: "7%", top: "46%", width: "42%", height: "46%", background: "linear-gradient(135deg,#8C98A9,#6E7B8E)" }} />
          <span className="absolute rounded-[3px]" style={{ left: "51%", top: "46%", width: "42%", height: "46%", background: "linear-gradient(135deg,#B49A6B,#8E7650)" }} />
        </Frame>
      );
    case "dark-profile-statement":
      return (
        <Frame bg="#000">
          <Dot x={8} y={6} size={12} color="#9CA3AF" style={{ boxShadow: "0 0 0 1.5px #22D3EE" }} />
          <Bar at={[25, 9, 22, 3.5]} color="#fff" />
          <Bar at={[8, 22, 76, 3.5]} color="#fff" />
          <Bar at={[8, 29, 66, 3.5]} color="#fff" />
          <Bar at={[8, 36, 44, 3.5]} color="#fff" />
        </Frame>
      );
    case "reddit-story":
      return (
        <Frame bg="#1A1514">
          <Dot x={8} y={6} size={12} color="#FF5A1F" />
          <Bar at={[25, 8, 26, 3.5]} color="#fff" />
          <Bar at={[25, 13, 16, 2]} color="#A8A29E" />
          <Bar at={[8, 24, 76, 3]} color="#fff" />
          <Bar at={[8, 30, 70, 3]} color="#fff" />
          <Bar at={[8, 36, 60, 3]} color="#fff" />
        </Frame>
      );
    case "breaking-news-circle":
      return (
        <Frame bg="#000">
          <span className="absolute inset-x-0 top-0 h-[64%]" style={{ background: "linear-gradient(to bottom,#5F666B 70%,#2a2d30)" }} />
          <Dot x={52} y={5} size={40} color="#E9EAEC" style={{ boxShadow: "0 0 0 1.5px #fff" }} />
          <Bar at={[6, 54, 48, 6]} color="#E11D2A" round={false} />
          <Bar at={[6, 66, 86, 2.5]} color="#fff" />
          <Bar at={[6, 72, 62, 3.5]} color="#FACC15" round={false} />
        </Frame>
      );
    case "handwritten-note":
      return (
        <Frame bg="#F3ECDC">
          <span className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,0.3), rgba(120,90,40,0.15))" }} />
          <Bar at={[10, 10, 74, 3]} color="#2340A0" />
          <Bar at={[10, 18, 62, 3]} color="#2340A0" />
          <Bar at={[10, 26, 70, 3]} color="#2340A0" />
          <Bar at={[10, 34, 46, 3]} color="#2340A0" />
          <Bar at={[10, 86, 18, 2.5]} color="#2340A0" />
        </Frame>
      );
    case "dark-quote":
      return (
        <Frame bg="#1C1C1C">
          <span className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 45%, #161616 0%, #232323 45%, #4E4E4E 100%)" }} />
          <Bar at={[20, 40, 60, 3.5]} color="#fff" />
          <Bar at={[29, 48, 42, 3.5]} color="#fff" />
          <Bar at={[44, 80, 12, 2.5]} color="#D4A93A" />
          <Bar at={[40, 85, 20, 1.6]} color="#bbb" />
        </Frame>
      );
    case "bold-white-quote":
      return (
        <Frame bg="#fff" light>
          <Bar at={[33, 45, 34, 2.4]} color="#111" round={false} />
          <Bar at={[38, 50, 24, 2.4]} color="#111" round={false} />
        </Frame>
      );
    case "typewriter-quote":
      return (
        <Frame bg="#fff" light>
          <Bar at={[30, 45, 40, 1.6]} color="#333" round={false} />
          <Bar at={[34, 50, 32, 1.6]} color="#333" round={false} />
          <Bar at={[40, 55, 20, 1.6]} color="#333" round={false} />
        </Frame>
      );
    case "clean-white-quote":
      return (
        <Frame bg="#fff" light>
          <Bar at={[34, 46, 32, 1.4]} color="#222" round={false} />
          <Bar at={[38, 51, 24, 1.4]} color="#222" round={false} />
        </Frame>
      );
    case "vintage-cream-quote":
      return (
        <Frame bg="#F5EEDD">
          <span className="absolute rounded-[2px]" style={{ inset: "5%", border: "2px double #3B2F2A" }} />
          <Bar at={[33, 12, 12, 0.8]} color="#3B2F2A" round={false} />
          <Dot x={47} y={10.5} size={6} color="#C0392B" />
          <Bar at={[55, 12, 12, 0.8]} color="#3B2F2A" round={false} />
          <Bar at={[28, 45, 44, 1.8]} color="#3B2F2A" round={false} />
          <Bar at={[33, 50, 34, 1.8]} color="#3B2F2A" round={false} />
        </Frame>
      );
  }
}
