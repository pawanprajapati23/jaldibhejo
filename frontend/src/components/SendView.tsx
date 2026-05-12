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
            ? "border-primary bg-primary/5" 
            : "border-black/10 hover:border-black/20 hover:bg-black/[0.02]"
        }`}
      >
        <input {...getInputProps()} />
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-colors duration-300 ${isDragActive ? "bg-primary/10 text-primary" : "bg-black/5 text-textMuted"}`}>
          <UploadCloud size={44} className={isDragActive ? "animate-pulse-soft" : ""} />
        </div>
        <h3 className="text-2xl font-bold mb-2 tracking-tight text-textMain">
          {isDragActive ? <span className="text-primary">Drop to send</span> : "Drag & drop files"}
        </h3>
        <p className="text-textMuted mb-8 text-[15px] font-medium">Or click to browse your device</p>
        <button className="px-8 py-3.5 bg-primary text-white hover:bg-primary/90 rounded-full font-semibold transition-all hover:scale-105 active:scale-95 shadow-md">
          Select Files
        </button>
      </div>
    </div>
  );
}
