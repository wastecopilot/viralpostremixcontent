import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/server/gemini";

export const dynamic = "force-dynamic";

/** Tells the browser whether the app is in demo mode (no Gemini key yet). */
export function GET() {
  return NextResponse.json({ demo: isDemoMode() });
}
