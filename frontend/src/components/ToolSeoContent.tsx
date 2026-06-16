import { ToolInfo } from "@/lib/tools";
import { blogPosts } from "@/lib/blog";
import Link from "next/link";

export function ToolSeoContent({ tool }: { tool: ToolInfo }) {
  // Simple related posts based on categories or just pick top 3
  const relatedPosts = blogPosts.slice(0, 3);

  return (
    <div className="space-y-8 mt-8 animate-in fade-in duration-500">
      <section className="grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-xl font-bold text-textMain">How to use {tool.name}</h2>
          <ol className="space-y-3 text-sm leading-6 text-textMuted">
            {tool.howToUse.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-xl font-bold text-textMain">Benefits</h2>
          <ul className="space-y-3 text-sm leading-6 text-textMuted">
            {tool.benefits.map((benefit) => (
              <li key={benefit}>• {benefit}</li>
            ))}
          </ul>
        </div>
      </section>

      {tool.seoArticle && (
        <section 
          className="rounded-xl border border-border bg-surface p-6 text-sm leading-relaxed text-textMuted space-y-4 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-textMain [&>h3]:mt-6 [&>h3]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-2 [&>p]:mb-4"
          dangerouslySetInnerHTML={{ __html: tool.seoArticle }}
        />
      )}

      {/* Semantic Internal Linking Engine */}
      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-xl font-bold text-textMain mb-4">Related Knowledge Base</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {relatedPosts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block p-4 rounded-lg bg-background border border-border hover:border-primary transition-colors">
              <h3 className="font-bold text-sm text-textMain group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
              <p className="text-xs text-textMuted mt-2">{post.readingTime}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
