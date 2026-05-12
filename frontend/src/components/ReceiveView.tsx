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
      <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-secondary mb-8 shadow-glow-secondary relative z-10">
        <KeyRound size={48} strokeWidth={1.5} />
      </div>
      
      <h2 className="text-4xl font-bold mb-3 tracking-tight text-white relative z-10">Enter PIN</h2>
      <p className="text-white/50 mb-10 text-[16px] font-medium relative z-10">Ask the sender for the 6-digit connection PIN</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-sm relative z-10">
        <input
          type="text"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
          className="w-full text-center text-5xl tracking-[0.4em] font-mono bg-black/20 border border-white/10 rounded-2xl py-6 mb-8 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-all shadow-inner text-white placeholder-white/10 backdrop-blur-md"
          placeholder="000000"
          autoFocus
        />
        <button
          type="submit"
          disabled={pin.length !== 6}
          className="w-full py-5 bg-gradient-to-r from-secondary to-indigo-500 text-white font-bold text-[18px] rounded-2xl disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed transition-all hover:shadow-glow-secondary active:scale-[0.98] border border-white/10"
        >
          Connect Device
        </button>
      </form>
    </div>
  );
}
