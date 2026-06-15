"use client";

import { Coffee, Heart, Globe, CreditCard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-6 animate-in fade-in zoom-in duration-500">
      <Link href="/" className="inline-flex items-center gap-2 text-textMuted hover:text-primary transition-colors mb-8 font-medium">
        <ArrowLeft size={18} /> Back to Home
      </Link>

      <div className="text-center mb-12">
        <div className="w-20 h-20 rounded-full bg-[#FFDD00]/20 text-[#FFDD00] flex items-center justify-center mx-auto mb-6">
          <Heart size={40} fill="currentColor" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-textMain mb-4">Support this project ☕</h1>
        <p className="text-lg text-textMuted max-w-2xl mx-auto">
          JaldiBhejo is free, open, and respects your privacy. If this tool saves you time, consider supporting its development and server costs!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        {/* India Users Card */}
        <div className="glass-panel p-8 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-white to-green-500 opacity-80" />
          <h2 className="text-2xl font-bold text-textMain mb-2 flex items-center gap-2">
            🇮🇳 India Users
          </h2>
          <p className="text-textMuted text-sm mb-8">Scan to pay via any UPI app (GPay, PhonePe, Paytm)</p>
          
          <div className="bg-white p-4 rounded-3xl shadow-xl mb-6 transform group-hover:scale-105 transition-transform duration-300">
            <Image 
              src="/upi-qr.jpg" 
              alt="UPI QR Code" 
              width={250} 
              height={250} 
              className="rounded-xl object-contain"
              priority
            />
          </div>
          <p className="font-mono text-sm text-textMain bg-background border border-border px-4 py-2 rounded-lg select-all">
            Scan to pay via UPI
          </p>
        </div>

        {/* International Users Card */}
        <div className="glass-panel p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-80" />
          <div className="w-16 h-16 rounded-full bg-surface border border-border text-primary flex items-center justify-center mb-6">
            <Globe size={32} />
          </div>
          <h2 className="text-2xl font-bold text-textMain mb-2 flex items-center gap-2">
            🌍 International Users
          </h2>
          <p className="text-textMuted text-sm mb-8 max-w-[250px]">
            Support via PayPal or Stripe is being set up.
          </p>
          
          <button disabled className="px-8 py-4 bg-surface border-2 border-dashed border-border rounded-2xl font-bold text-textMuted flex items-center gap-3 cursor-not-allowed opacity-70">
            <CreditCard size={20} />
            Currently Unavailable
          </button>
          <p className="text-xs text-textMuted mt-4 uppercase tracking-widest font-bold">Coming Soon</p>
        </div>
      </div>
    </div>
  );
}
