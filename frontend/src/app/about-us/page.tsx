import type { Metadata } from "next";
import React from 'react';

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about JaldiBhejo, our privacy-first peer-to-peer file sharing philosophy, local processing, and commitment to free web utilities.",
  alternates: {
    canonical: "/about-us",
  },
};

export default function AboutUsPage() {
  return (
    <main className="max-w-4xl mx-auto py-12 px-4 prose prose-invert">
      <h1>About Us</h1>
      
      <h2>Welcome to JaldiBhejo</h2>
      <p>JaldiBhejo was created with a simple yet powerful mission: to provide fast, private, and hassle-free tools and file sharing capabilities to users worldwide, without the friction of sign-ups or subscriptions.</p>

      <h2>Our Philosophy</h2>
      <p>In an era where personal data is constantly harvested and services hide their best features behind paywalls, we believe in a different approach. We are committed to building a platform that respects your privacy and values your time.</p>

      <h2>What We Offer</h2>
      <ul>
        <li><strong>Privacy-First File Sharing:</strong> Utilizing WebRTC technology, our file sharing service creates a direct, peer-to-peer connection between sender and receiver. Your files never touch our servers, ensuring maximum privacy and security.</li>
        <li><strong>Local Processing:</strong> Many of our utility tools leverage cutting-edge WebAssembly (Wasm) technology to process your files directly within your browser. This means your sensitive data stays on your device.</li>
        <li><strong>No Sign-Ups Required:</strong> We don't need your email, your name, or your phone number. You can use JaldiBhejo instantly, completely anonymously.</li>
        <li><strong>Fast & Efficient:</strong> "Jaldi Bhejo" translates to "Send Quickly". We optimize our tools to be as lightweight and fast as possible.</li>
      </ul>

      <h2>Our Commitment</h2>
      <p>We are dedicated to maintaining JaldiBhejo as a free, accessible, and user-centric platform. We continually explore new technologies to bring you the best and most secure web-based tools available.</p>
    </main>
  );
}
