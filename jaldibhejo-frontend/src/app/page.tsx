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

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      <AnimatePresence mode="wait">
        {mode === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <IdleView />
          </motion.div>
        )}

        {mode === "send" && connectionState === "disconnected" && (
          <motion.div
            key="send"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <SendView />
          </motion.div>
        )}

        {mode === "receive" && connectionState === "disconnected" && (
          <motion.div
            key="receive"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <ReceiveView />
          </motion.div>
        )}

        {connectionState !== "disconnected" && (
          <motion.div
            key="transfer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TransferView />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button when not idle and not actively transferring (unless error/complete) */}
      <AnimatePresence>
        {mode !== "idle" && (connectionState === "disconnected" || connectionState === "error" || connectionState === "completed") && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -top-16 left-0 text-white/60 hover:text-white transition-colors flex items-center gap-2"
            onClick={reset}
          >
            ← Back
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
