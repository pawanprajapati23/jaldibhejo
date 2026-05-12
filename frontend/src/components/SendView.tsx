import { useTransferStore } from "@/store/useTransferStore";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { webrtcEngine } from "@/lib/WebRTCEngine";
import { UploadCloud, MessageSquareText } from "lucide-react";

export function SendView() {
  const { setFiles, setTextPayload } = useTransferStore();
  const [tab, setTab] = useState<'file' | 'text'>('file');
  const [text, setText] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles(acceptedFiles);
      webrtcEngine.connect();
      webrtcEngine.createRoom();
    }
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSendText = () => {
    if (text.trim().length > 0) {
      setTextPayload(text.trim());
      webrtcEngine.connect();
      webrtcEngine.createRoom();
    }
  };

  return (
    <div className="glass-panel w-full p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden">
      
      {/* Tabs */}
      <div className="flex bg-black/40 rounded-full p-1 mb-8 border border-white/10 z-10 relative shadow-inner">
        <button 
          onClick={() => setTab('file')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${tab === 'file' ? 'bg-primary text-black shadow-glow-primary' : 'text-textMuted hover:text-white'}`}
        >
          <UploadCloud size={16} /> Files
        </button>
        <button 
          onClick={() => setTab('text')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${tab === 'text' ? 'bg-primary text-black shadow-glow-primary' : 'text-textMuted hover:text-white'}`}
        >
          <MessageSquareText size={16} /> Text
        </button>
      </div>

      {tab === 'file' ? (
        <div 
          {...getRootProps()} 
          className={`w-full h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 p-10 relative z-10 ${
            isDragActive 
              ? "border-primary bg-primary/10 shadow-glow-primary backdrop-blur-md" 
              : "border-white/20 hover:border-primary/50 hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${isDragActive ? "bg-primary/20 text-primary shadow-glow-primary" : "bg-white/5 border border-white/10 text-white/50"}`}>
            <UploadCloud size={40} className={isDragActive ? "animate-pulse-glow" : ""} />
          </div>
          <h3 className="text-2xl font-bold mb-2 tracking-tight text-white">
            {isDragActive ? <span className="text-primary drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]">Drop to send</span> : "Drag & drop files"}
          </h3>
          <p className="text-white/50 mb-8 text-[15px] font-medium">Or click to browse your device (Multiple files supported)</p>
          <button className="px-8 py-3 bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/10 hover:shadow-glow-primary text-white rounded-xl font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0">
            Select Files
          </button>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center relative z-10">
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste a link, message, or code snippet..."
            className="w-full flex-1 min-h-[200px] bg-black/40 border border-white/10 rounded-2xl p-6 text-white placeholder-white/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner resize-none transition-all"
          />
          <button 
            onClick={handleSendText}
            disabled={text.trim().length === 0}
            className="mt-6 w-full py-4 bg-primary text-black rounded-xl font-bold text-[17px] disabled:opacity-30 disabled:grayscale transition-all hover:bg-primary/90 hover:shadow-glow-primary active:scale-[0.98]"
          >
            Send Text
          </button>
        </div>
      )}
    </div>
  );
}
