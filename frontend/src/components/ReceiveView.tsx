import { useTransferStore } from "@/store/useTransferStore";
import { useState } from "react";
import { webrtcEngine } from "@/lib/WebRTCEngine";
import { KeyRound } from "lucide-react";

export function ReceiveView() {
  const [pin, setPin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 6) {
      webrtcEngine.connect();
      webrtcEngine.joinRoom(pin);
    }
  };

  return (
    <div className="glass-panel w-full p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[450px]">
      <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center text-secondary mb-8">
        <KeyRound size={32} strokeWidth={2} />
      </div>
      
      <h2 className="text-2xl font-bold mb-2 text-textMain">Enter PIN</h2>
      <p className="text-textMuted mb-10 text-sm">Ask the sender for the 6-digit connection PIN</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-xs">
        <input
          type="text"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
          className="w-full text-center text-4xl tracking-[0.4em] font-mono bg-surface border border-border rounded-xl py-4 mb-6 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors text-textMain placeholder-textMuted/30"
          placeholder="000000"
          autoFocus
        />
        <button
          type="submit"
          disabled={pin.length !== 6}
          className="w-full py-3 bg-secondary text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-secondary/90"
        >
          Connect Device
        </button>
      </form>
    </div>
  );
}
