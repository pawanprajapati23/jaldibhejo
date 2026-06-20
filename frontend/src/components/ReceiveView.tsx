import { useTransferStore } from "@/store/useTransferStore";
import { useState } from "react";
import { webrtcEngine } from "@/lib/WebRTCEngine";
import { KeyRound } from "lucide-react";

export function ReceiveView() {
  const [pin, setPin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 6) {
      useTransferStore.getState().setConnectionState('connecting');
      webrtcEngine.connect();
      webrtcEngine.joinRoom(pin);
    }
  };

  return (
    <div className="glass-panel w-full p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 to-pink-500" />
      
      <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center mb-8 shadow-md">
        <KeyRound size={28} strokeWidth={2} />
      </div>
      
      <h2 className="text-3xl font-bold mb-2 text-textMain">Enter Connection PIN</h2>
      <p className="text-textMuted mb-8 text-xs md:text-sm max-w-xs leading-relaxed">
        Ask the sender for the 6-digit PIN to establish a secure peer-to-peer connection.
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-xs animate-in fade-in duration-300">
        <input
          type="text"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
          className="w-full text-center text-4xl tracking-[0.25em] font-mono bg-background/50 border border-border rounded-xl py-3.5 mb-6 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-textMain placeholder-textMuted/20 font-semibold shadow-inner h-[60px]"
          placeholder="000000"
          autoFocus
        />
        <button
          type="submit"
          disabled={pin.length !== 6}
          className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95 shadow-lg shadow-purple-500/10 transition-all hover:scale-[1.01] active:scale-95 duration-200 text-sm"
        >
          Connect Device
        </button>
      </form>
    </div>
  );
}
