import { useTransferStore } from "@/store/useTransferStore";
import { Upload, Download } from "lucide-react";

export function IdleView() {
  const { setMode, setRole } = useTransferStore();

  return (
    <div className="flex flex-col md:flex-row gap-8 justify-center items-center w-full mt-10">
      <button
        onClick={() => {
          setMode("send");
          setRole("sender");
        }}
        className="glass-panel relative overflow-hidden w-full md:w-72 h-72 flex flex-col items-center justify-center gap-6 transition-all hover:-translate-y-2 group"
      >
        <div className="absolute inset-0 bg-gradient-glow opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300">
          <Upload size={36} strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-2 text-white group-hover:text-primary transition-colors">Send Files</h2>
          <p className="text-sm text-white/50 group-hover:text-white/70">Share via PIN or QR</p>
        </div>
      </button>

      <button
        onClick={() => {
          setMode("receive");
          setRole("receiver");
        }}
        className="glass-panel relative overflow-hidden w-full md:w-72 h-72 flex flex-col items-center justify-center gap-6 transition-all hover:-translate-y-2 group"
      >
        <div className="absolute inset-0 bg-gradient-glow opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
        <div className="w-20 h-20 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary group-hover:scale-110 group-hover:bg-secondary/20 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all duration-300">
          <Download size={36} strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-2 text-white group-hover:text-secondary transition-colors">Receive</h2>
          <p className="text-sm text-white/50 group-hover:text-white/70">Enter PIN to connect</p>
        </div>
      </button>
    </div>
  );
}
