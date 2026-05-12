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

  // Cleanup on unmount or when returning to idle
  useEffect(() => {
    if (mode === "idle") {
      webrtcEngine.disconnect();
    }
    return () => {
      // Don't disconnect on unmount if we're just hot-reloading in dev, 
      // but usually we want to disconnect if the user leaves the page.
    };
  }, [mode]);

  const springTransition = { type: "spring", stiffness: 300, damping: 30 };

  return (
    <div className="w-full max-w-3xl mx-auto relative perspective-1000">
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
