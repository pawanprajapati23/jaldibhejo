import type { Metadata } from "next";
import { ToolCategoryPage } from "@/components/ToolCategoryPage";

export const metadata: Metadata = {
  title: "PDF Tools",
  description: "Merge, split, compress, and convert PDF files online with JaldiBhejo PDF tools.",
  alternates: {
    canonical: "/pdf-tools",
  },
};

export default function PdfToolsPage() {
  return <ToolCategoryPage category="pdf" description="PDF tools for merging, splitting, compressing, and converting documents for school, work, and daily sharing." />;
}
