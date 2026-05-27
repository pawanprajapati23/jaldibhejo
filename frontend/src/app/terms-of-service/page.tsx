import type { Metadata } from "next";
import { ContentPage, ContentSection } from "@/components/ContentPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the terms that apply when using JaldiBhejo's browser file sharing app and utility tools.",
  alternates: {
    canonical: "/terms-of-service",
  },
};

export default function TermsOfServicePage() {
  return (
    <ContentPage
      eyebrow="Terms"
      title="Terms & Conditions"
      description="These terms describe acceptable use of JaldiBhejo and the responsibilities that apply when sending or receiving content."
    >
      <ContentSection title="Use of the service">
        <p>
          JaldiBhejo is owned by {siteConfig.owner}. By using {siteConfig.url}, you agree to these Terms & Conditions.
        </p>
        <p>
          JaldiBhejo is provided for lawful file sharing and online tool workflows. You may use the service to send files, text, and process supported files through available tools.
        </p>
      </ContentSection>

      <ContentSection title="WebRTC and file storage">
        <p>
          JaldiBhejo uses WebRTC peer-to-peer technology for file sharing. Files are intended to transfer directly between devices where possible and are not intentionally stored permanently on JaldiBhejo servers.
        </p>
        <p>
          Temporary connection data such as room codes, signaling messages, and IP-related network information may be used to establish and maintain a transfer session.
        </p>
      </ContentSection>

      <ContentSection title="Your responsibilities">
        <p>
          You are responsible for the content you send, receive, or process. Do not use JaldiBhejo to share illegal content, malware, copyrighted material without permission, abusive content, or any content that violates another person&apos;s rights.
        </p>
        <p>
          Only accept files from senders you trust. JaldiBhejo cannot guarantee that files from other users are safe or appropriate.
        </p>
      </ContentSection>

      <ContentSection title="Availability">
        <p>
          We aim to keep JaldiBhejo reliable, but the service may be interrupted by browser limitations, network conditions, server maintenance, or technical issues outside our control.
        </p>
      </ContentSection>

      <ContentSection title="No warranties">
        <p>
          JaldiBhejo is provided as is. We do not guarantee that every transfer will complete, that every connection will be direct, or that files from other users are risk-free.
        </p>
      </ContentSection>

      <ContentSection title="Contact">
        <p>
          Questions about these terms can be sent to {siteConfig.email}.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
