import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JaldiBhejo - Send Anything Instantly",
    template: "%s | JaldiBhejo",
  },
  description: "Send files, text, and useful browser tools from JaldiBhejo. Fast peer-to-peer sharing with privacy-focused utilities.",
  applicationName: "JaldiBhejo",
  keywords: [
    "JaldiBhejo",
    "peer to peer file sharing",
    "browser file transfer",
    "send files without internet upload",
    "WebRTC file transfer",
    "send files online",
    "image compressor",
    "PDF tools",
    "converter tools",
    "developer tools",
    "private file sharing",
  ],
  authors: [{ name: siteConfig.owner }],
  creator: siteConfig.owner,
  publisher: siteConfig.name,
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "JaldiBhejo",
    title: "JaldiBhejo - Send Anything Instantly",
    description: "Fast WebRTC peer-to-peer file sharing with image, PDF, converter, developer, AI, and utility tools.",
  },
  twitter: {
    card: "summary_large_image",
    title: "JaldiBhejo - Send Anything Instantly",
    description: "Fast WebRTC peer-to-peer file sharing with free online tools.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`bg-background text-textMain antialiased selection:bg-primary/20 selection:text-primary`}>
        <SiteHeader />

        <main className="min-h-screen flex flex-col items-center justify-center p-6 pt-24">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
