import { useTransferStore } from "@/store/useTransferStore";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { webrtcEngine } from "@/lib/WebRTCEngine";
import { UploadCloud } from "lucide-react";

export function SendView() {
  const { setFiles } = useTransferStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles(acceptedFiles);
      webrtcEngine.connect();
      webrtcEngine.createRoom();
    }
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="glass-panel w-full p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-glow opacity-50"></div>
      <div 
        {...getRootProps()} 
        className={`w-full h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 p-10 relative z-10 ${
          isDragActive 
            ? "border-primary bg-primary/5 shadow-[0_0_50px_rgba(168,85,247,0.15)]" 
            : "border-white/10 hover:border-primary/40 hover:bg-white/[0.02]"
        }`}
      >
        <input {...getInputProps()} />
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 transition-colors duration-300 ${isDragActive ? "bg-primary/20 text-primary" : "bg-white/5 text-white/50"}`}>
          <UploadCloud size={48} className={isDragActive ? "animate-pulse" : ""} />
        </div>
        <h3 className="text-3xl font-bold mb-3 tracking-tight">
          {isDragActive ? <span className="text-primary">Drop to send</span> : "Drag & drop files"}
        </h3>
        <p className="text-white/40 mb-8 text-lg font-light">Or click to browse your device</p>
        <button className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-full font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg">
          Select Files
        </button>
      </div>
    </div>
  );
}
