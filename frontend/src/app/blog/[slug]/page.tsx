import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { blogPosts, getBlogPost } from "@/lib/blog";

type BlogPostPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = getBlogPost(params.slug);

  if (!post) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      tags: post.tags,
    },
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jaldibhejo.sizesnap.in";

  const breadcrumbListJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `${siteUrl}/blog`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `${siteUrl}/blog/${post.slug}`
      }
    ]
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: "JaldiBhejo",
    },
    publisher: {
      "@type": "Organization",
      name: "JaldiBhejo",
    },
  };

  return (
    <article className="w-full max-w-3xl py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <Link href="/blog" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-textMuted transition-colors hover:text-textMain">
        <ArrowLeft size={16} />
        Back to blog
      </Link>

      <header className="mb-10">
        <div className="mb-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-textMuted">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl font-bold leading-tight text-textMain md:text-5xl">{post.title}</h1>
        <p className="mt-5 text-base leading-7 text-textMuted">{post.description}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-textMuted">
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={16} />
            {new Date(post.publishedAt).toLocaleDateString("en", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span>{post.readingTime}</span>
        </div>
      </header>

      <div className="space-y-9">
        {post.content ? (
          <div 
            className="prose prose-invert max-w-none text-base leading-8 text-textMuted [&>h2]:mb-4 [&>h2]:mt-8 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-textMain [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:mb-4 [&>ol]:list-decimal [&>ol]:pl-5"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
        ) : (
          post.sections?.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-4 text-2xl font-bold text-textMain">{section.heading}</h2>
              <div className="space-y-4">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-8 text-textMuted">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </article>
  );
}
