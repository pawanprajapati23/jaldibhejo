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
        className="glass-panel w-full md:w-64 h-64 flex flex-col items-center justify-center gap-5 group"
      >
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary/15 transition-all duration-300">
          <Upload size={32} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-1 text-textMain">Send Files</h2>
          <p className="text-sm text-textMuted font-medium">Share via PIN or QR</p>
        </div>
      </button>

      <button
        onClick={() => {
          setMode("receive");
          setRole("receiver");
        }}
        className="glass-panel w-full md:w-64 h-64 flex flex-col items-center justify-center gap-5 group"
      >
        <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-105 group-hover:bg-secondary/15 transition-all duration-300">
          <Download size={32} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-1 text-textMain">Receive</h2>
          <p className="text-sm text-textMuted font-medium">Enter PIN to connect</p>
        </div>
      </button>
    </div>
  );
}
