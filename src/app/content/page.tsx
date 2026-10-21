import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { ContentLibrary } from "@/components/ContentLibrary";

export const metadata: Metadata = {
  title: `All Content · ${brand.name}`,
};

export default function ContentPage() {
  return <ContentLibrary />;
}
