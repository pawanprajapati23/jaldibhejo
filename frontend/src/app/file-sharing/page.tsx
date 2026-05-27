import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Link2, Lock, UploadCloud, Wifi } from "lucide-react";

export const metadata: Metadata = {
  title: "Peer-to-Peer File Sharing",
  description: "Send files without uploading them to server storage. JaldiBhejo uses WebRTC peer-to-peer file sharing for fast temporary transfers.",
  keywords: [
    "send files without internet upload",
    "peer to peer file sharing",
    "WebRTC file transfer",
    "send files without cloud storage",
    "browser file sharing",
  ],
  alternates: {
    canonical: "/file-sharing",
  },
};

const steps = [
  "Drag and drop a file or choose it from your device.",
  "JaldiBhejo creates a temporary code or QR connection flow.",
  "The receiver enters the code or opens the shared link.",
  "Both browsers connect through WebRTC and transfer the file directly where possible.",
];

const features = [
  {
    title: "No server upload",
    description: "Files are not intentionally uploaded to JaldiBhejo cloud storage. The transfer is designed as a direct browser-to-browser handoff.",
    icon: UploadCloud,
  },
  {
    title: "Peer-to-peer connection",
    description: "WebRTC helps connect devices directly for temporary transfers between trusted users.",
    icon: Wifi,
  },
  {
    title: "Temporary sharing",
    description: "Codes and transfer sessions are designed for quick file handoff, not long-term public file hosting.",
    icon: Link2,
  },
  {
    title: "Secure browser flow",
    description: "Modern browser security and WebRTC encryption help protect data in transit, while users remain responsible for file safety.",
    icon: Lock,
  },
];

export default function FileSharingPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does JaldiBhejo upload files to a server?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "JaldiBhejo is designed for WebRTC peer-to-peer transfers. Files are not intentionally uploaded to or stored permanently on JaldiBhejo servers.",
        },
      },
      {
        "@type": "Question",
        name: "What is peer-to-peer file sharing?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Peer-to-peer file sharing means files move directly between user devices where possible instead of using cloud storage as the main file host.",
        },
      },
    ],
  };

  return (
    <div className="w-full max-w-6xl py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="mb-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Main JaldiBhejo feature</p>
          <h1 className="text-3xl font-bold leading-tight text-textMain md:text-5xl">Send files instantly without uploading them to server storage</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-textMuted">
            JaldiBhejo uses WebRTC-based peer-to-peer file sharing so users can send files directly from one device to another using a temporary PIN or QR code.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90">
              Send Files Now
              <ArrowRight size={18} />
            </Link>
            <Link href="/tools" className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm font-bold text-textMain transition-colors hover:bg-surfaceHover">
              Explore Free Tools
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-5 text-xl font-bold text-textMain">How it works</h2>
          <ol className="space-y-4">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-6 text-textMuted">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mb-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="rounded-xl border border-border bg-surface p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background text-accent">
                <Icon size={20} />
              </div>
              <h2 className="font-bold text-textMain">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-textMuted">{feature.description}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-xl font-bold text-textMain">Best for</h2>
          <ul className="space-y-3 text-sm leading-6 text-textMuted">
            <li className="flex gap-2"><CheckCircle2 size={18} className="mt-0.5 text-accent" /> Sending photos, PDFs, ZIP files, and notes quickly.</li>
            <li className="flex gap-2"><CheckCircle2 size={18} className="mt-0.5 text-accent" /> Moving files between your phone, laptop, and desktop.</li>
            <li className="flex gap-2"><CheckCircle2 size={18} className="mt-0.5 text-accent" /> Temporary transfers where both devices are online together.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
          <h2 className="mb-4 text-xl font-bold text-textMain">Responsible use</h2>
          <p className="text-sm leading-6 text-textMuted">
            Do not use JaldiBhejo to share illegal files, malware, copyrighted content without permission, private information without consent, or harmful material. Only open files from people you trust.
          </p>
        </div>
      </section>
    </div>
  );
}
