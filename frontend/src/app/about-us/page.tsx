import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, ContentSection } from "@/components/ContentPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about JaldiBhejo, a browser-based peer-to-peer file sharing app built for quick, private transfers.",
  alternates: {
    canonical: "/about-us",
  },
};

export default function AboutUsPage() {
  return (
    <ContentPage
      eyebrow="About JaldiBhejo"
      title="Fast file sharing without unnecessary friction"
      description="JaldiBhejo combines WebRTC peer-to-peer file sharing with useful online tools for images, PDFs, converters, developers, AI, and daily utilities."
    >
      <ContentSection title="What we build">
        <p>
          JaldiBhejo is a browser-based platform owned by {siteConfig.owner}. It is designed for quick handoffs between devices without account creation, long setup steps, or permanent public links.
        </p>
        <p>
          The main USP is WebRTC-based peer-to-peer file sharing. Files are designed to move directly from one device to another and are not intentionally uploaded to or stored permanently on JaldiBhejo servers.
        </p>
      </ContentSection>

      <ContentSection title="Our approach">
        <p>
          We prefer browser-native workflows where possible. File transfers use WebRTC data channels, while tools like image compression can run locally in the browser.
        </p>
        <p>
          JaldiBhejo also provides online tools for images, PDFs, converters, developer utilities, AI utilities, and everyday productivity tasks.
        </p>
      </ContentSection>

      <ContentSection title="Useful links">
        <p>
          Read our <Link href="/blog" className="text-primary hover:text-primary/80">file sharing guides</Link>, try the{" "}
          <Link href="/tools/compress-image" className="text-primary hover:text-primary/80">image compressor</Link>, or{" "}
          <Link href="/contact" className="text-primary hover:text-primary/80">contact us</Link> with feedback.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
