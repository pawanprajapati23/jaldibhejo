import type { Metadata } from "next";
import { ImageCompressorTool } from "@/components/ImageCompressorTool";
import { ToolSeoContent } from "@/components/ToolSeoContent";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getRelatedTools, getTool } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Free Image Compressor",
  description: "Compress JPG and PNG images online for free. JaldiBhejo's image compressor works privately in your browser before sharing or uploading.",
  alternates: {
    canonical: "/tools/compress-image",
  },
};

export default function CompressImagePage() {
  const tool = getTool("compress-image");
  const relatedTools = tool ? getRelatedTools(tool) : [];

  return (
    <div className="w-full max-w-5xl py-8">
      {tool && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "How do I compress an image online?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: tool.howToUse.join(" "),
                  },
                },
                {
                  "@type": "Question",
                  name: "Does JaldiBhejo upload my image while compressing?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "The image compressor runs in your browser using local browser APIs, so the selected image is not uploaded to a conversion server for this tool.",
                  },
                },
              ],
            }),
          }}
        />
      )}
      <section className="mb-8 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-accent">Free browser tool</p>
        <h1 className="text-3xl font-bold text-textMain md:text-5xl">Compress JPG and PNG Images</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-textMuted md:text-base">
          Reduce image file size before sharing, uploading, or emailing. Compression happens locally in your browser, so your images are not uploaded to a server.
        </p>
      </section>

      <ImageCompressorTool />
      {tool && <ToolSeoContent tool={tool} />}

      {relatedTools.length > 0 && (
        <section className="mt-8 rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-xl font-bold text-textMain">Related image tools</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {relatedTools.map((relatedTool) => (
              <Link key={relatedTool.slug} href={`/tools/${relatedTool.slug}`} className="group rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary">
                <span className="flex items-center justify-between gap-3 font-semibold text-textMain">
                  {relatedTool.name}
                  <ArrowRight size={16} className="text-textMuted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </span>
                <span className="mt-2 block text-xs leading-5 text-textMuted">{relatedTool.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
