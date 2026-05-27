import type { Metadata } from "next";
import { ContentPage, ContentSection } from "@/components/ContentPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Read JaldiBhejo's disclaimer for peer-to-peer file sharing, online tools, and user responsibility.",
  alternates: {
    canonical: "/disclaimer",
  },
};

export default function DisclaimerPage() {
  return (
    <ContentPage
      eyebrow="Disclaimer"
      title="Disclaimer"
      description="This disclaimer explains user responsibility and platform limitations for JaldiBhejo file sharing and online tools."
    >
      <ContentSection title="General information">
        <p>
          JaldiBhejo is a file sharing and online tools platform owned by {siteConfig.owner}. The website is provided for general productivity, file transfer, and utility purposes.
        </p>
      </ContentSection>

      <ContentSection title="File sharing responsibility">
        <p>
          Users are fully responsible for the files they send, receive, download, convert, compress, or process. JaldiBhejo does not verify ownership, legality, quality, accuracy, or safety of user-shared files.
        </p>
        <p>
          Do not use JaldiBhejo to share malware, illegal content, copyrighted material without permission, private information without consent, harmful content, or any file that violates applicable laws.
        </p>
      </ContentSection>

      <ContentSection title="No server storage claim">
        <p>
          JaldiBhejo&apos;s main file sharing feature is designed around WebRTC peer-to-peer transfer. Files are not intentionally stored permanently on JaldiBhejo servers, but technical connection data may be processed temporarily to establish a transfer.
        </p>
      </ContentSection>

      <ContentSection title="Security notice">
        <p>
          Only accept files from people you trust. Always use your own device security tools before opening files from unknown senders. JaldiBhejo is not responsible for damage, data loss, malware, or misuse caused by user-shared files.
        </p>
      </ContentSection>

      <ContentSection title="Contact">
        <p>
          For questions, contact {siteConfig.email}.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
