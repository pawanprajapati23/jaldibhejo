"use client";

import { Heart, Globe, CreditCard, ArrowLeft, ShieldCheck, Zap, Ban, Coffee, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4 sm:px-6 animate-in fade-in zoom-in duration-700">
      <Link href="/" className="inline-flex items-center gap-2 text-textMuted hover:text-primary transition-colors mb-10 font-bold uppercase tracking-widest text-xs">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      {/* Hero Section */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 blur-[60px] rounded-full -z-10" />
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold uppercase tracking-widest mb-6">
          <Heart size={14} className="fill-current animate-pulse" /> Support The Creator
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-textMain tracking-tight mb-6">
          Keep JaldiBhejo <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Free & Fast.</span>
        </h1>
        <p className="text-lg md:text-xl text-textMuted max-w-2xl mx-auto leading-relaxed">
          We built this platform because we hated slow uploads, intrusive ads, and forced logins. If our tools saved you <strong className="text-textMain">10 minutes today</strong>, consider buying us a coffee. Your support pays for our servers and keeps this tool alive.
        </p>
        <p className="mt-4 text-sm font-bold text-textMain bg-surface inline-block px-4 py-2 rounded-lg border border-border shadow-sm">
          💡 Even ₹10 or $1 makes a massive difference.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-stretch mb-16">
        {/* India Users Card (UPI) */}
        <div className="glass-panel p-8 sm:p-10 flex flex-col items-center text-center relative overflow-hidden group border-2 hover:border-orange-500/50 transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 via-white to-green-500 opacity-90" />
          
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-6">
            <span className="text-2xl font-black">₹</span>
          </div>
          
          <h2 className="text-2xl font-bold text-textMain mb-2">Indian Supporters</h2>
          <p className="text-textMuted text-sm mb-8 px-4">
            Zero platform fees. Scan with GPay, PhonePe, Paytm, or any UPI app.
          </p>
          
          <div className="bg-white p-4 rounded-3xl shadow-[0_0_40px_rgba(249,115,22,0.15)] mb-8 transform group-hover:scale-105 transition-all duration-500 border border-border">
            <Image 
              src="/upi-qr.jpg" 
              alt="UPI QR Code" 
              width={220} 
              height={220} 
              className="rounded-xl object-contain"
              priority
            />
          </div>
          
          <div className="w-full space-y-3">
             <div className="flex items-center justify-center gap-2 text-sm font-bold text-textMain bg-background border border-border py-3 px-4 rounded-xl">
               <CheckCircle2 size={16} className="text-green-500" /> Instant UPI Transfer
             </div>
          </div>
        </div>

        {/* International Users Card (PayPal) */}
        <div className="glass-panel p-8 sm:p-10 flex flex-col items-center justify-between text-center relative overflow-hidden group border-2 hover:border-blue-500/50 transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#003087] to-[#009CDE] opacity-90" />
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
              <Globe size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-textMain mb-2">Global Supporters</h2>
            <p className="text-textMuted text-sm mb-8 px-4">
              Support us securely from anywhere in the world using PayPal or Credit Card.
            </p>
          </div>
          
          <div className="w-full flex flex-col items-center">
            <div className="w-32 h-32 mb-8 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 flex items-center justify-center">
              <Coffee size={80} strokeWidth={1} className="text-blue-500" />
            </div>
            
            <a 
              href="https://www.paypal.com/ncp/payment/QHT392F2ZNXS6" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-4 bg-[#0070BA] hover:bg-[#003087] text-white font-bold rounded-xl shadow-[0_0_30px_rgba(0,112,186,0.3)] hover:shadow-[0_0_40px_rgba(0,112,186,0.5)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
            >
              <CreditCard size={22} />
              Donate via PayPal
            </a>
            <p className="text-xs text-textMuted mt-4 flex items-center gap-1">
              <ShieldCheck size={14} /> 100% Secure Checkout
            </p>
          </div>
        </div>
      </div>

      {/* Trust Indicators / The Impact */}
      <section className="grid md:grid-cols-3 gap-6 pt-10 border-t border-border">
        <div className="flex flex-col items-center text-center p-4">
          <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-textMain mb-4">
            <Ban size={20} className="text-red-500" />
          </div>
          <h3 className="font-bold text-textMain mb-2">No Ads, No Logins</h3>
          <p className="text-sm text-textMuted leading-relaxed">Your support ensures we never have to show annoying pop-ups or sell your data.</p>
        </div>
        <div className="flex flex-col items-center text-center p-4">
          <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-textMain mb-4">
            <Zap size={20} className="text-yellow-500" />
          </div>
          <h3 className="font-bold text-textMain mb-2">Faster Servers</h3>
          <p className="text-sm text-textMuted leading-relaxed">Donations go directly into paying for better WebRTC signaling servers and hosting.</p>
        </div>
        <div className="flex flex-col items-center text-center p-4">
          <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-textMain mb-4">
            <ShieldCheck size={20} className="text-green-500" />
          </div>
          <h3 className="font-bold text-textMain mb-2">Privacy Maintained</h3>
          <p className="text-sm text-textMuted leading-relaxed">Being community-funded means we answer to our users, not corporate advertisers.</p>
        </div>
      </section>
    </div>
  );
}
