import type { Metadata } from "next";
import { ToolCategoryPage } from "@/components/ToolCategoryPage";

export const metadata: Metadata = {
  title: "Utility Tools",
  description: "Generate QR codes, passwords, count words, and convert text case with JaldiBhejo utility tools.",
  alternates: {
    canonical: "/utility-tools",
  },
};

export default function UtilityToolsPage() {
  return <ToolCategoryPage category="utility" description="Everyday utilities for quick tasks like QR generation, password creation, word counting, and text formatting." />;
}
