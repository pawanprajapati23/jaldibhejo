import type { Metadata } from "next";
import { CategoryLinks, ToolGrid } from "@/components/ToolGrid";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Free Online Tools",
  description: "Explore JaldiBhejo tools for images, PDFs, converters, developers, AI writing, and daily utilities.",
  alternates: {
    canonical: "/tools",
  },
};

export default function ToolsPage() {
  return (
    <div className="w-full max-w-6xl py-8">
      <section className="mb-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-accent">Online tools platform</p>
        <h1 className="max-w-3xl text-3xl font-bold text-textMain md:text-5xl">Free browser tools for files, images, PDFs, developers, and creators</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-textMuted md:text-base">
          JaldiBhejo combines instant peer-to-peer file sharing with practical tools that help users compress, convert, format, generate, and prepare files faster.
        </p>
      </section>
      <CategoryLinks />
      <ToolGrid tools={tools} showCategory />
    </div>
  );
}
