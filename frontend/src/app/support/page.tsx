"use client";

import { Heart, Globe, CreditCard, ArrowLeft, ShieldCheck, Zap, Ban, Coffee, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4 animate-in fade-in zoom-in duration-500">
      <Link href="/" className="inline-flex items-center gap-2 text-textMuted hover:text-primary transition-colors mb-8 font-bold uppercase tracking-widest text-[10px]">
        <ArrowLeft size={14} /> Back to Home
      </Link>

      {/* Hero Section */}
      <div className="text-center mb-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary/20 blur-[50px] rounded-full -z-10" />
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest mb-4">
          <Heart size={12} className="fill-current animate-pulse" /> Support The Creator
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-textMain tracking-tight mb-4">
          Keep JaldiBhejo <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Free.</span>
        </h1>
        <p className="text-sm md:text-base text-textMuted max-w-xl mx-auto leading-relaxed">
          We hate slow uploads and ads as much as you do. If our tools saved you <strong className="text-textMain">10 minutes today</strong>, a small coffee helps pay for our servers.
        </p>
        <p className="mt-3 text-xs font-bold text-textMain bg-surface inline-block px-3 py-1.5 rounded-lg border border-border shadow-sm">
          💡 Even ₹10 or $1 makes a huge difference.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 items-start mb-10">
        {/* India Users Card (UPI) */}
        <div className="glass-panel p-6 flex flex-col items-center text-center relative overflow-hidden group border border-border hover:border-orange-500/50 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-white to-green-500 opacity-90" />
          
          <h2 className="text-lg font-bold text-textMain mb-1">Indian Supporters</h2>
          <p className="text-textMuted text-xs mb-5 px-2">
            Scan via GPay, PhonePe, or Paytm.
          </p>
          
          <div className="bg-white p-3 rounded-2xl shadow-sm mb-4 border border-border">
            <Image 
              src="/upi-qr.jpg" 
              alt="UPI QR Code" 
              width={160} 
              height={160} 
              className="rounded-lg object-contain"
              priority
            />
          </div>
          
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-textMain bg-background border border-border py-2 px-3 rounded-lg w-full">
            <CheckCircle2 size={14} className="text-green-500" /> Instant UPI Transfer
          </div>
        </div>

        {/* International Users Card (PayPal) */}
        <div className="glass-panel p-6 flex flex-col items-center justify-between text-center relative overflow-hidden group border border-border hover:border-blue-500/50 transition-colors h-full">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#003087] to-[#009CDE] opacity-90" />
          
          <div className="flex flex-col items-center w-full">
            <h2 className="text-lg font-bold text-textMain mb-1">Global Supporters</h2>
            <p className="text-textMuted text-xs mb-6 px-2">
              Support us securely via PayPal or Card.
            </p>
            
            <div className="w-16 h-16 mb-8 flex items-center justify-center bg-blue-500/5 rounded-full">
              <Coffee size={32} strokeWidth={1.5} className="text-blue-500" />
            </div>
            
            <a 
              href="https://www.paypal.com/ncp/payment/QHT392F2ZNXS6" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-3 bg-[#0070BA] hover:bg-[#003087] text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-sm"
            >
              <CreditCard size={16} />
              Donate via PayPal
            </a>
            <p className="text-[10px] text-textMuted mt-3 flex items-center gap-1">
              <ShieldCheck size={12} /> 100% Secure Checkout
            </p>
          </div>
        </div>
      </div>

      {/* Trust Indicators / The Impact */}
      <section className="grid grid-cols-3 gap-3 pt-6 border-t border-border">
        <div className="flex flex-col items-center text-center p-2">
          <Ban size={16} className="text-red-500 mb-2" />
          <h3 className="font-bold text-textMain text-xs mb-1">No Ads/Logins</h3>
          <p className="text-[10px] text-textMuted leading-snug hidden sm:block">No pop-ups or data selling.</p>
        </div>
        <div className="flex flex-col items-center text-center p-2">
          <Zap size={16} className="text-yellow-500 mb-2" />
          <h3 className="font-bold text-textMain text-xs mb-1">Fast Servers</h3>
          <p className="text-[10px] text-textMuted leading-snug hidden sm:block">Donations pay for WebRTC relays.</p>
        </div>
        <div className="flex flex-col items-center text-center p-2">
          <ShieldCheck size={16} className="text-green-500 mb-2" />
          <h3 className="font-bold text-textMain text-xs mb-1">Private</h3>
          <p className="text-[10px] text-textMuted leading-snug hidden sm:block">Community-funded & open.</p>
        </div>
      </section>
    </div>
  );
}
