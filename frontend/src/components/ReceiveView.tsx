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
      <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-8 shadow-sm">
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
          className="w-full text-center text-4xl tracking-[0.4em] font-mono bg-white border border-black/10 rounded-2xl py-5 mb-6 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all shadow-sm text-textMain placeholder-black/20"
          placeholder="000000"
          autoFocus
        />
        <button
          type="submit"
          disabled={pin.length !== 6}
          className="w-full py-4 bg-primary text-white font-bold text-[17px] rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
        >
          Connect Device
        </button>
      </form>
    </div>
  );
}
