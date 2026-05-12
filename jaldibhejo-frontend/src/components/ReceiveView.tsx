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
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-glow opacity-50"></div>
      
      <div className="w-24 h-24 rounded-3xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary mb-10 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
        <KeyRound size={48} strokeWidth={1.5} />
      </div>
      
      <h2 className="text-4xl font-bold mb-3 tracking-tight">Enter PIN</h2>
      <p className="text-white/40 mb-10 text-lg font-light">Ask the sender for the 6-digit connection PIN</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-sm relative z-10">
        <input
          type="text"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
          className="w-full text-center text-5xl tracking-[0.4em] font-mono bg-black/40 border-2 border-white/10 rounded-2xl py-6 mb-8 focus:outline-none focus:border-secondary focus:bg-black/60 focus:ring-4 focus:ring-secondary/20 transition-all shadow-inner text-white placeholder-white/10"
          placeholder="000000"
          autoFocus
        />
        <button
          type="submit"
          disabled={pin.length !== 6}
          className="w-full py-5 bg-gradient-to-r from-secondary to-cyan-400 text-black font-bold text-lg rounded-2xl disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:scale-[1.02] active:scale-[0.98]"
        >
          Connect Device
        </button>
      </form>
    </div>
  );
}
