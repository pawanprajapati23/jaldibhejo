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
    <div className="glass-panel w-full p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden">
      <div className="w-20 h-20 rounded-2xl bg-surface border border-border flex items-center justify-center text-secondary mb-8 shadow-glow-secondary">
        <KeyRound size={40} strokeWidth={2} />
      </div>
      
      <h2 className="text-3xl font-bold mb-2 tracking-tight text-textMain">Enter PIN</h2>
      <p className="text-textMuted mb-10 text-[15px] font-medium">Ask the sender for the 6-digit connection PIN</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-sm relative z-10">
        <input
          type="text"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
          className="w-full text-center text-4xl tracking-[0.4em] font-mono bg-surface border border-border rounded-xl py-5 mb-6 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all shadow-inner text-textMain placeholder-textMuted/30"
          placeholder="000000"
          autoFocus
        />
        <button
          type="submit"
          disabled={pin.length !== 6}
          className="w-full py-4 bg-secondary text-white font-bold text-[17px] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-secondary/90 hover:shadow-glow-secondary active:scale-[0.98]"
        >
          Connect Device
        </button>
      </form>
    </div>
  );
}
