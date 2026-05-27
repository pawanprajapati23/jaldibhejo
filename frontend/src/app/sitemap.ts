import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/site";
import { categoryRoutes, tools } from "@/lib/tools";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/file-sharing",
    "/tools",
    "/tools/compress-image",
    ...Object.values(categoryRoutes),
    "/blog",
    "/about-us",
    "/contact",
    "/privacy-policy",
    "/terms-of-service",
    "/disclaimer",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : 0.7,
    })),
    ...blogPosts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...tools
      .filter((tool) => tool.slug !== "compress-image")
      .map((tool) => ({
        url: `${siteUrl}/tools/${tool.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
  ];
}
