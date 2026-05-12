import { useTransferStore } from "@/store/useTransferStore";
import { Upload, Download } from "lucide-react";

export function IdleView() {
  const { setMode, setRole } = useTransferStore();

  return (
    <div className="flex flex-col md:flex-row gap-8 justify-center items-center w-full mt-12">
      <button
        onClick={() => {
          setMode("send");
          setRole("sender");
        }}
        className="glass-panel w-full md:w-[320px] h-[320px] flex flex-col items-center justify-center gap-6 group hover:shadow-glow-primary hover:-translate-y-2 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500"></div>
        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 group-hover:border-primary/30 group-hover:shadow-glow-primary transition-all duration-500 relative z-10">
          <Upload size={40} strokeWidth={1.5} className="group-hover:-translate-y-1 transition-transform duration-500" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2 text-white group-hover:text-primary transition-colors duration-300">Send Files</h2>
          <p className="text-[15px] text-white/50 font-medium">Share via PIN or QR</p>
        </div>
      </button>

      <button
        onClick={() => {
          setMode("receive");
          setRole("receiver");
        }}
        className="glass-panel w-full md:w-[320px] h-[320px] flex flex-col items-center justify-center gap-6 group hover:shadow-glow-secondary hover:-translate-y-2 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/5 transition-colors duration-500"></div>
        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-secondary group-hover:scale-110 group-hover:bg-secondary/20 group-hover:border-secondary/30 group-hover:shadow-glow-secondary transition-all duration-500 relative z-10">
          <Download size={40} strokeWidth={1.5} className="group-hover:translate-y-1 transition-transform duration-500" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2 text-white group-hover:text-secondary transition-colors duration-300">Receive</h2>
          <p className="text-[15px] text-white/50 font-medium">Enter PIN to connect</p>
        </div>
      </button>
    </div>
  );
}
