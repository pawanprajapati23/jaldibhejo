import type { Metadata } from "next";
import React from 'react';

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with JaldiBhejo. Send feedback, report issues or inquire about partnerships.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto py-12 px-4 prose prose-invert">
      <h1>Contact Us</h1>
      
      <p>We value your feedback and are always here to help. Whether you have a question about our tools, need assistance with a file transfer, or want to report an issue, please don't hesitate to reach out.</p>

      <h2>Get in Touch</h2>
      <p>The best way to contact us is via email. We aim to respond to all inquiries within 24-48 hours.</p>

      <div className="not-prose my-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-2">Email Address</h3>
        <p className="text-gray-300">
          <a href="mailto:admin@jaldibhejo.com" className="text-blue-400 hover:text-blue-300 transition-colors">
            admin@jaldibhejo.com
          </a>
        </p>
      </div>

      <h2>Business Inquiries & Partnerships</h2>
      <p>For business proposals, advertising inquiries, or partnership opportunities, please use the same email address provided above. Ensure you include a descriptive subject line so we can route your email to the appropriate team member.</p>

      <h2>Reporting Abuse</h2>
      <p>Because JaldiBhejo operates on a peer-to-peer basis, we do not host user files. However, if you encounter malicious behavior or abuse related to our platform, please report it immediately to admin@jaldibhejo.com with as much detail as possible.</p>
    </main>
  );
}
