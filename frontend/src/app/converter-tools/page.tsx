import type { Metadata } from "next";
import { ToolCategoryPage } from "@/components/ToolCategoryPage";

export const metadata: Metadata = {
  title: "Converter Tools",
  description: "Convert images and files into useful formats with JaldiBhejo converter tools.",
  alternates: {
    canonical: "/converter-tools",
  },
};

export default function ConverterToolsPage() {
  return <ToolCategoryPage category="converter" description="Simple converter tools for changing file formats before uploading, sharing, or publishing online." />;
}
