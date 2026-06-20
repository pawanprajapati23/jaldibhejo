import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/d/",      // Block temporary download URLs
        "/api/",    // Block API endpoints
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
