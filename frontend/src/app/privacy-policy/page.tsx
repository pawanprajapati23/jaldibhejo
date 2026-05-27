import type { Metadata } from "next";
import { ContentPage, ContentSection } from "@/components/ContentPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read JaldiBhejo's privacy policy for WebRTC file sharing, online tools, cookies, Google AdSense, and Analytics.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <ContentPage
      eyebrow="Privacy Policy"
      title="Privacy Policy"
      description={`This policy explains how ${siteConfig.name} handles information when you use our WebRTC file sharing feature and online tools.`}
    >
      <ContentSection title="Overview">
        <p>
          {siteConfig.name} is owned by {siteConfig.owner}. The website is available at {siteConfig.url}. For privacy questions, contact {siteConfig.email}.
        </p>
        <p>
          JaldiBhejo is designed for quick browser-based file transfers and online tools. We do not ask users to create an account to send or receive files.
        </p>
      </ContentSection>

      <ContentSection title="WebRTC file sharing">
        <p>
          JaldiBhejo uses WebRTC peer-to-peer technology for file sharing. When possible, files move directly from the sender&apos;s browser to the receiver&apos;s browser through a temporary connection.
        </p>
        <p>
          Files are not intentionally uploaded to or stored permanently on JaldiBhejo servers. Our signaling service may process temporary connection messages so two devices can discover and connect with each other.
        </p>
      </ContentSection>

      <ContentSection title="Information we process">
        <p>
          The app may process temporary technical information such as room identifiers, signaling messages, connection state, browser type, device information, IP-related network information, and logs needed to operate, secure, or troubleshoot the service.
        </p>
        <p>
          Some online tools, including browser-based image compression, may run locally in your browser. If a future tool requires server-side processing, that tool page should explain the processing clearly.
        </p>
      </ContentSection>

      <ContentSection title="Files and text transfers">
        <p>
          JaldiBhejo does not provide long-term storage for transferred files or text. Receivers should only accept files from trusted senders.
        </p>
        <p>
          You are responsible for the files you choose to send and for complying with applicable laws and rights.
        </p>
      </ContentSection>

      <ContentSection title="Cookies, Analytics, and Google AdSense">
        <p>
          JaldiBhejo may use cookies, local storage, Google Analytics, Google AdSense, and similar technologies to measure usage, improve performance, prevent abuse, and show advertisements.
        </p>
        <p>
          Third-party vendors, including Google, may use cookies, web beacons, IP addresses, or similar technologies to serve ads, measure ad performance, and provide analytics. Users can control cookies through browser settings and Google ad settings.
        </p>
      </ContentSection>

      <ContentSection title="Responsible use">
        <p>
          Users are responsible for the files they choose to send, receive, download, convert, or process. Do not use JaldiBhejo to share illegal content, malware, copyrighted material without permission, or private data without consent.
        </p>
      </ContentSection>

      <ContentSection title="Contact">
        <p>
          For privacy questions, contact us at {siteConfig.email}.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
