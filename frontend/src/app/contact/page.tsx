import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { ContentPage, ContentSection } from "@/components/ContentPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the JaldiBhejo team for support, feedback, and product questions.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <ContentPage
      eyebrow="Contact"
      title="Get in touch"
      description={`For support, bug reports, product feedback, copyright concerns, or partnership questions, contact ${siteConfig.owner}.`}
    >
      <ContentSection title="Email">
        <a
          href={`mailto:${siteConfig.email}`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90"
        >
          <Mail size={18} />
          {siteConfig.email}
        </a>
      </ContentSection>

      <ContentSection title="Website owner">
        <p>Owner: {siteConfig.owner}</p>
        <p>Website: {siteConfig.url}</p>
      </ContentSection>

      <ContentSection title="Before you write">
        <p>
          If you are reporting a transfer issue, include your browser name, device type, approximate file size, and what happened before the transfer stopped.
        </p>
        <p>
          Do not send private files or sensitive personal documents by email unless we specifically ask for a safe reproduction sample.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
