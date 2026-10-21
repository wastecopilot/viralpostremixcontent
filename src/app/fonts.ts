import { Archivo_Black, Caveat, Inter, Lora, Oswald, Playfair_Display, Special_Elite } from "next/font/google";

// Fonts used by the app and by the graphic templates.
export const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
export const archivoBlack = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-archivo", display: "swap" });
export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});
export const lora = Lora({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-lora", display: "swap" });
export const caveat = Caveat({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-caveat", display: "swap" });
export const specialElite = Special_Elite({ subsets: ["latin"], weight: "400", variable: "--font-special", display: "swap" });
export const oswald = Oswald({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-oswald", display: "swap" });

export const fontVariables = [inter, archivoBlack, playfair, lora, caveat, specialElite, oswald]
  .map((f) => f.variable)
  .join(" ");
