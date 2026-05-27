import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { blogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "File Sharing Blog",
  description: "Guides about private file sharing, browser tools, WebRTC transfers, and safe productivity workflows from JaldiBhejo.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogIndexPage() {
  return (
    <div className="w-full max-w-5xl py-8">
      <section className="mb-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">JaldiBhejo Blog</p>
        <h1 className="max-w-3xl text-3xl font-bold text-textMain md:text-5xl">Guides for faster, safer browser file sharing</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-textMuted md:text-base">
          Practical articles about peer-to-peer transfers, privacy-first browser tools, and ways to move files without adding friction.
        </p>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        {blogPosts.map((post) => (
          <article key={post.slug} className="glass-panel flex flex-col p-6">
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-border bg-background px-3 py-1 text-xs text-textMuted">
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-xl font-bold leading-tight text-textMain">{post.title}</h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-textMuted">{post.description}</p>
            <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-4 text-xs text-textMuted">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={14} />
                {new Date(post.publishedAt).toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>{post.readingTime}</span>
            </div>
            <Link href={`/blog/${post.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80">
              Read article
              <ArrowRight size={16} />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
