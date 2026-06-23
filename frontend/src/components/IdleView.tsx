import { useTransferStore } from "@/store/useTransferStore";
import Link from "next/link";
import { Upload, Download, ArrowRight, ArrowDownToLine, Smartphone, QrCode, ArrowUpRight, ShieldCheck, Zap } from "lucide-react";
import { webrtcEngine } from "@/lib/WebRTCEngine";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export function IdleView() {
  const { setMode, setRole, setFiles } = useTransferStore();
  const [pin, setPin] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles(acceptedFiles);
      setMode("send");
      setRole("sender");
      webrtcEngine.connect();
      webrtcEngine.createRoom();
    }
  }, [setFiles, setMode, setRole]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleReceive = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 6) {
      setMode("receive");
      setRole("receiver");
      useTransferStore.getState().setConnectionState('connecting');
      webrtcEngine.connect();
      webrtcEngine.joinRoom(pin);
    }
  };

  return (
    <div className="w-full flex flex-col items-center px-4 md:px-0">
      {/* Intro Header */}
      <section className="mb-10 text-center select-none relative w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold uppercase tracking-wider mb-4 border border-indigo-500/20 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Fast Peer-to-Peer Sharing
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-textMain tracking-tight mb-4 leading-[1.1] bg-gradient-to-r from-textMain via-indigo-600 to-purple-600 dark:from-white dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
          Send Anything Instantly.
        </h1>
        <p className="mx-auto max-w-lg text-textMuted text-sm md:text-base leading-relaxed">
          P2P file transfer powered by WebRTC. Directly connecting your devices without uploading files to server storage.
        </p>
      </section>

      {/* Main Action Panels */}
      <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto items-stretch mb-12">
        {/* Sender Dropzone Panel */}
        <div 
          {...getRootProps()} 
          className={`relative overflow-hidden glass-panel group flex flex-col items-center justify-center p-8 text-center cursor-pointer min-h-[320px] transition-all duration-300 ${
            isDragActive 
              ? 'border-primary bg-primary/10 scale-[1.01] ring-4 ring-primary/10' 
              : 'hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
          
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 shadow-md group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white ${
            isDragActive ? 'bg-primary text-white scale-110' : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
          }`}>
            <Upload size={28} strokeWidth={2} className={isDragActive ? 'animate-bounce' : ''} />
          </div>
          
          <h2 className="text-2xl font-bold text-textMain mb-2">Send Files</h2>
          <p className="text-textMuted text-xs md:text-sm mb-6 max-w-xs leading-relaxed">
            Drag & drop files anywhere, or click to choose from your device.
          </p>
          
          <button className="px-8 py-3 text-sm btn-primary font-bold rounded-xl shadow-lg shadow-indigo-500/10 transition-all w-full max-w-[220px]">
            Select Files
          </button>

          <div className="mt-6 flex items-center justify-center gap-4 text-[10px] font-bold text-textMuted uppercase tracking-widest w-full border-t border-border pt-5">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                webrtcEngine.connect();
                setMode("send");
                setRole("sender");
              }}
              className="hover:text-primary transition-colors flex items-center gap-1 hover:scale-105 active:scale-95 duration-200"
            >
              Send Text / Screen <ArrowUpRight size={12} />
            </button>
          </div>
        </div>

        {/* Receiver Pin Panel */}
        <div className="relative overflow-hidden glass-panel group flex flex-col items-center justify-center p-8 text-center min-h-[320px] transition-all duration-300 hover:border-purple-500/50">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 to-pink-500" />
          
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6 border border-purple-500/20 shadow-md group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
            <Download size={28} strokeWidth={2} />
          </div>
          
          <h2 className="text-2xl font-bold text-textMain mb-2">Receive Files</h2>
          <p className="text-textMuted text-xs md:text-sm mb-5 max-w-xs leading-relaxed">
            Enter the 6-digit connection PIN shared by the sender.
          </p>
          
          <form onSubmit={handleReceive} className="w-full max-w-[220px] flex flex-col items-center">
            <input
              type="text"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="000 000"
              className="w-full text-center text-3xl tracking-[0.2em] font-mono bg-background/50 border border-border rounded-xl py-3 mb-4 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-textMain placeholder-textMuted/20 h-[56px] shadow-inner font-semibold"
            />
            <button
              type="submit"
              disabled={pin.length !== 6}
              className="w-full py-3 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95 shadow-lg shadow-purple-500/10 transition-all hover:scale-105 active:scale-95 duration-200"
            >
              Connect
            </button>
          </form>

          <div className="mt-5 flex items-center justify-center gap-4 text-[10px] font-bold text-textMuted uppercase tracking-widest w-full border-t border-border pt-5">
            <button 
              onClick={async (e) => {
                e.preventDefault();
                webrtcEngine.connect();
                setMode("receive");
                setRole("receiver");
                await webrtcEngine.createRoom();
              }}
              className="hover:text-secondary transition-colors flex items-center gap-1 hover:scale-105 active:scale-95 duration-200"
            >
              Request Files <ArrowDownToLine size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Info Badges / Features Section */}
      <section className="grid gap-4 text-left sm:grid-cols-3 max-w-4xl mx-auto w-full">
        <div className="rounded-2xl border border-border bg-surface/50 backdrop-blur-md p-5 flex items-start gap-4 hover:border-indigo-500/30 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
            <Smartphone size={20} />
          </div>
          <div>
            <h3 className="font-bold text-textMain text-sm md:text-base">No App Required</h3>
            <p className="mt-1 text-xs text-textMuted leading-relaxed">Runs directly inside any browser on mobile, desktop, or tablet device.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface/50 backdrop-blur-md p-5 flex items-start gap-4 hover:border-purple-500/30 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0 border border-purple-500/20">
            <QrCode size={20} />
          </div>
          <div>
            <h3 className="font-bold text-textMain text-sm md:text-base">QR Code Connect</h3>
            <p className="mt-1 text-xs text-textMuted leading-relaxed">Instantly pair devices by scanning the QR code with your phone camera.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface/50 backdrop-blur-md p-5 flex items-start gap-4 hover:border-emerald-500/30 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="font-bold text-textMain text-sm md:text-base">Fully Secure & Private</h3>
            <p className="mt-1 text-xs text-textMuted leading-relaxed">Direct WebRTC transfers ensure your files never touch remote server storage.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
