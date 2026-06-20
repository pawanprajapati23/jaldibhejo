import type { Metadata } from "next";
import React from 'react';

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Read the JaldiBhejo Disclaimer. Understand general information, client-side processing, peer-to-peer transfers, and tool usage terms.",
  alternates: {
    canonical: "/disclaimer",
  },
};

export default function DisclaimerPage() {
  return (
    <main className="max-w-4xl mx-auto py-12 px-4 prose prose-invert">
      <h1>Disclaimer</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <h2>1. General Information</h2>
      <p>The information provided by JaldiBhejo ("we," "us," or "our") on our website is for general informational and utility purposes only. All information and tools on the site are provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information or tools on the site.</p>

      <h2>2. "As Is" Tools</h2>
      <p>All online tools provided on JaldiBhejo are provided "as is" and "as available" without any warranties of any kind. We do not guarantee that the tools will meet your specific requirements, be uninterrupted, timely, secure, or error-free. Your use of any tools on this site is solely at your own risk.</p>

      <h2>3. Client-Side Processing (WebAssembly)</h2>
      <p>Many of the tools on JaldiBhejo utilize WebAssembly (Wasm) and client-side processing. This means the processing occurs directly within your web browser on your local device. While this enhances privacy as your files are not uploaded to our servers for processing, performance may vary significantly depending on your device's hardware and browser capabilities.</p>

      <h2>4. Peer-to-Peer Transfers</h2>
      <p>File transfers on JaldiBhejo are facilitated via WebRTC, meaning data is sent directly between users without being stored on our servers. We do not inspect, log, or moderate the content being transferred. Users are solely responsible for the legality and safety of the files they share.</p>

      <h2>5. External Links Disclaimer</h2>
      <p>Our website may contain links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.</p>
    </main>
  );
}
