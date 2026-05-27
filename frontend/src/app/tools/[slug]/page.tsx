import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ToolSeoContent } from "@/components/ToolSeoContent";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { categoryLabels, getRelatedTools, getTool, tools } from "@/lib/tools";

type ToolPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return tools
    .filter((tool) => tool.slug !== "compress-image")
    .map((tool) => ({
      slug: tool.slug,
    }));
}

export function generateMetadata({ params }: ToolPageProps): Metadata {
  const tool = getTool(params.slug);

  if (!tool) {
    return {
      title: "Tool Not Found",
    };
  }

  return {
    title: tool.title,
    description: tool.metaDescription,
    alternates: {
      canonical: `/tools/${tool.slug}`,
    },
  };
}

export default function ToolPage({ params }: ToolPageProps) {
  const tool = getTool(params.slug);

  if (!tool) {
    notFound();
  }

  const relatedTools = getRelatedTools(tool);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How do I use ${tool.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: tool.howToUse.join(" "),
        },
      },
      {
        "@type": "Question",
        name: `What are the benefits of ${tool.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: tool.benefits.join(", "),
        },
      },
    ],
  };

  return (
    <div className="w-full max-w-5xl py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Link href="/tools" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-textMuted transition-colors hover:text-textMain">
        <ArrowLeft size={16} />
        All tools
      </Link>

      <section className="mb-8">
        <span className="mb-3 inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          {categoryLabels[tool.category]}
        </span>
        <h1 className="text-3xl font-bold text-textMain md:text-5xl">{tool.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-textMuted md:text-base">{tool.metaDescription}</p>
      </section>

      <ToolWorkspace tool={tool} />

      <ToolSeoContent tool={tool} />

      {relatedTools.length > 0 && (
        <section className="mt-8 rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-xl font-bold text-textMain">Related tools</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {relatedTools.map((relatedTool) => (
              <Link
                key={relatedTool.slug}
                href={`/tools/${relatedTool.slug}`}
                className="group rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary"
              >
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
