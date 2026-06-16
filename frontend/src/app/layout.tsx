import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { siteConfig } from "@/lib/site";
import { ThemeProvider } from "@/components/ThemeProvider";
import { GlobalDropzone } from "@/components/GlobalDropzone";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { WasmPrefetcher } from "@/components/WasmPrefetcher";
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
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "JaldiBhejo Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JaldiBhejo - Send Anything Instantly",
    description: "Fast WebRTC peer-to-peer file sharing with free online tools.",
    images: ["/logo.png"],
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
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
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5696239388754680"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-G84D3MPBVZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-G84D3MPBVZ');
          `}
        </Script>
      </head>
      <body className={`bg-background text-textMain antialiased selection:bg-primary/20 selection:text-primary`}>
        <ThemeProvider>
          <GlobalDropzone>
            <SiteHeader />

            <main className="min-h-screen flex flex-col items-center justify-center p-6 pt-24">
              {children}
            </main>
            <SiteFooter />
          </GlobalDropzone>
        </ThemeProvider>
        <Suspense fallback={null}>
          <ServiceWorkerRegister />
          <WasmPrefetcher />
        </Suspense>
      </body>
    </html>
  );
}
