import { ImageResponse } from "next/og";
import { brand } from "@/config/brand";

// The browser-tab icon, drawn from the logo text and color in src/config/brand.ts.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: brand.colors.accent,
          color: "#FFFFFF",
          fontSize: 28,
          fontWeight: 800,
          borderRadius: 14,
          letterSpacing: -1,
        }}
      >
        {brand.logoText}
      </div>
    ),
    size,
  );
}
