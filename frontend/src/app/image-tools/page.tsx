import type { Metadata } from "next";
import { ToolCategoryPage } from "@/components/ToolCategoryPage";

export const metadata: Metadata = {
  title: "Image Tools",
  description: "Compress, resize, convert, and prepare images online with JaldiBhejo image tools.",
  alternates: {
    canonical: "/image-tools",
  },
};

export default function ImageToolsPage() {
  return <ToolCategoryPage category="image" description="Free image tools for compression, conversion, resizing, and turning images into shareable documents." />;
}
