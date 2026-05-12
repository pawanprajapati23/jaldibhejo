import { useTransferStore } from "@/store/useTransferStore";
import { Upload, Download } from "lucide-react";

export function IdleView() {
  const { setMode, setRole } = useTransferStore();

  return (
    <div className="flex flex-col md:flex-row gap-6 justify-center items-center w-full mt-8">
      <button
        onClick={() => {
          setMode("send");
          setRole("sender");
        }}
        className="glass-panel w-full md:w-64 h-64 flex flex-col items-center justify-center gap-5 group hover:shadow-glow-primary hover:-translate-y-1"
      >
        <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
          <Upload size={28} strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-1 text-textMain group-hover:text-primary transition-colors">Send Files</h2>
          <p className="text-sm text-textMuted font-medium">Share via PIN or QR</p>
        </div>
      </button>

      <button
        onClick={() => {
          setMode("receive");
          setRole("receiver");
        }}
        className="glass-panel w-full md:w-64 h-64 flex flex-col items-center justify-center gap-5 group hover:shadow-glow-secondary hover:-translate-y-1"
      >
        <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center text-secondary group-hover:scale-110 group-hover:bg-secondary/10 transition-all duration-300">
          <Download size={28} strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-1 text-textMain group-hover:text-secondary transition-colors">Receive</h2>
          <p className="text-sm text-textMuted font-medium">Enter PIN to connect</p>
        </div>
      </button>
    </div>
  );
}
