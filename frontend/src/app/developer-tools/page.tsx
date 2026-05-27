import type { Metadata } from "next";
import { ToolCategoryPage } from "@/components/ToolCategoryPage";

export const metadata: Metadata = {
  title: "Developer Tools",
  description: "Format JSON, HTML, CSS, JavaScript, Base64, and URLs with JaldiBhejo developer tools.",
  alternates: {
    canonical: "/developer-tools",
  },
};

export default function DeveloperToolsPage() {
  return <ToolCategoryPage category="developer" description="Developer utilities for formatting, encoding, decoding, and cleaning common web data quickly." />;
}
