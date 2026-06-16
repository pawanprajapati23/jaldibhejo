"use client";

import { useTransferStore } from "@/store/useTransferStore";
import { AnimatePresence, motion } from "framer-motion";
import { IdleView } from "@/components/IdleView";
import { SendView } from "@/components/SendView";
import { ReceiveView } from "@/components/ReceiveView";
import { TransferView } from "@/components/TransferView";
import { useEffect } from "react";
import { webrtcEngine } from "@/lib/WebRTCEngine";

export default function Home() {
  const { mode, connectionState, reset } = useTransferStore();

  // Pre-connect on mount and cleanup
  useEffect(() => {
    // Connect to signaling server immediately when app loads
    webrtcEngine.connect();

    if (mode === "idle") {
      // Don't disconnect here, keep socket alive for speed
      // webrtcEngine.disconnect(); 
      
      // Auto-join if opened via QR code link
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const pin = params.get("pin");
        const requestPin = params.get("request");
        
        if (pin && pin.length === 6) {
          useTransferStore.getState().setMode("receive");
          useTransferStore.getState().setRole("receiver");
          
          // Clean URL so it doesn't trigger again on refresh
          window.history.replaceState({}, document.title, window.location.pathname);
          
          setTimeout(() => {
            useTransferStore.getState().setConnectionState('connecting');
            webrtcEngine.connect();
            webrtcEngine.joinRoom(pin);
          }, 300);
        } else if (requestPin && requestPin.length === 6) {
          useTransferStore.getState().setMode("send");
          useTransferStore.getState().setRole("sender");
          useTransferStore.getState().setRoomId(requestPin); // set the room ID to the pin we need to join
          
          // Clean URL so it doesn't trigger again on refresh
          window.history.replaceState({}, document.title, window.location.pathname);
          
          setTimeout(() => {
            useTransferStore.getState().setConnectionState('connecting');
            webrtcEngine.connect();
            webrtcEngine.joinRoom(requestPin);
          }, 300);
        }
      }
    }
    return () => {
      // Don't disconnect on unmount if we're just hot-reloading in dev, 
      // but usually we want to disconnect if the user leaves the page.
    };
  }, [mode]);

  const springTransition = { type: "spring" as const, stiffness: 300, damping: 30 };
  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "JaldiBhejo",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    description: "Browser-based peer-to-peer file sharing with PIN and QR code connection flows.",
    url: "https://jaldibhejo.vercel.app",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "1284",
      bestRating: "5"
    }
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "JaldiBhejo",
    url: "https://jaldibhejo.vercel.app",
    description: "Fast WebRTC peer-to-peer file sharing and free offline browser tools like PDF editors and image compressors.",
    publisher: {
      "@type": "Organization",
      name: "JaldiBhejo",
      logo: {
        "@type": "ImageObject",
        url: "https://jaldibhejo.vercel.app/logo.png"
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative perspective-1000">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }} />
      <AnimatePresence mode="wait">
        {mode === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={springTransition}
            className="w-full flex justify-center"
          >
            <IdleView />
          </motion.div>
        )}

        {mode === "send" && connectionState === "disconnected" && (
          <motion.div
            key="send"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95, filter: "blur(10px)" }}
            transition={springTransition}
            className="w-full"
          >
            <SendView />
          </motion.div>
        )}

        {mode === "receive" && connectionState === "disconnected" && (
          <motion.div
            key="receive"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95, filter: "blur(10px)" }}
            transition={springTransition}
            className="w-full"
          >
            <ReceiveView />
          </motion.div>
        )}

        {connectionState !== "disconnected" && (
          <motion.div
            key="transfer"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20, filter: "blur(10px)" }}
            transition={springTransition}
            className="w-full"
          >
            <TransferView />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button */}
      <AnimatePresence>
        {mode !== "idle" && (connectionState === "disconnected" || connectionState === "error" || connectionState === "completed") && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={springTransition}
            className="absolute -top-16 left-4 lg:left-0 text-white/50 hover:text-white transition-colors flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md"
            onClick={reset}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
