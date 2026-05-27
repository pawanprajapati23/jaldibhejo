import type { Metadata } from "next";
import { ToolCategoryPage } from "@/components/ToolCategoryPage";

export const metadata: Metadata = {
  title: "AI Tools",
  description: "Use JaldiBhejo AI tools for background removal, text summaries, and content title ideas.",
  alternates: {
    canonical: "/ai-tools",
  },
};

export default function AiToolsPage() {
  return <ToolCategoryPage category="ai" description="AI-powered utility pages for creators, students, businesses, and everyday productivity workflows." />;
}
