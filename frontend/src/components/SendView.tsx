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
      <div 
        {...getRootProps()} 
        className={`w-full h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 p-10 relative z-10 ${
          isDragActive 
            ? "border-primary bg-primary/5 shadow-glow-primary" 
            : "border-border hover:border-primary/50 hover:bg-surfaceHover"
        }`}
      >
        <input {...getInputProps()} />
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${isDragActive ? "bg-primary/20 text-primary" : "bg-surface border border-border text-textMuted"}`}>
          <UploadCloud size={40} className={isDragActive ? "animate-pulse-glow" : ""} />
        </div>
        <h3 className="text-2xl font-bold mb-2 tracking-tight text-textMain">
          {isDragActive ? <span className="text-primary">Drop to send</span> : "Drag & drop files"}
        </h3>
        <p className="text-textMuted mb-8 text-[15px] font-medium">Or click to browse your device</p>
        <button className="px-8 py-3 bg-surface border border-border hover:border-primary/50 hover:shadow-glow-primary text-textMain rounded-xl font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0">
          Select Files
        </button>
      </div>
    </div>
  );
}
