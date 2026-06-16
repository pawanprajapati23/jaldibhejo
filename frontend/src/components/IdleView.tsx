import { useTransferStore } from "@/store/useTransferStore";
import Link from "next/link";
import { Upload, Download, ArrowRight, ArrowDownToLine, Smartphone, QrCode, ArrowUpRight } from "lucide-react";
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
    <div className="w-full flex flex-col items-center px-2">
      <section className="mb-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-3">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
          </span>
          Fast P2P Sharing
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-textMain tracking-tight mb-2">Send files instantly.</h1>
        <p className="mx-auto max-w-lg text-textMuted text-xs md:text-sm">
          No sign-ups. No size limits. Devices connect directly.
        </p>
      </section>

      <div className="grid lg:grid-cols-2 gap-4 w-full max-w-4xl mx-auto items-stretch">
        {/* Send Section */}
        <div 
          {...getRootProps()} 
          className={`relative overflow-hidden glass-panel flex flex-col items-center justify-center p-6 text-center transition-all duration-300 cursor-pointer border ${isDragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary/50'}`}
        >
          <input {...getInputProps()} />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-400" />
          
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${isDragActive ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
            <Upload size={24} strokeWidth={2.5} className={isDragActive ? 'animate-bounce' : ''} />
          </div>
          
          <h2 className="text-xl font-bold text-textMain mb-1">Send Files</h2>
          <p className="text-textMuted text-xs mb-5 px-4">Tap here or drag & drop files to generate a PIN.</p>
          
          <button className="px-6 py-2.5 text-sm bg-primary text-white font-bold rounded-lg shadow-sm hover:bg-primary/90 transition-all w-full max-w-[200px]">
            Select Files
          </button>

          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] font-bold text-textMuted uppercase tracking-widest w-full border-t border-border pt-4">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                webrtcEngine.connect();
                setMode("send");
                setRole("sender");
              }}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              Send Text / Screen <ArrowUpRight size={12} />
            </button>
          </div>
        </div>

        {/* Receive Section */}
        <div className="relative overflow-hidden glass-panel flex flex-col items-center justify-center p-6 text-center transition-all duration-300 border border-border hover:border-secondary/50">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-purple-400" />
          
          <div className="w-14 h-14 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-4">
            <Download size={24} strokeWidth={2.5} />
          </div>
          
          <h2 className="text-xl font-bold text-textMain mb-1">Receive</h2>
          <p className="text-textMuted text-xs mb-4">Enter the 6-digit PIN from the sender.</p>
          
          <form onSubmit={handleReceive} className="w-full max-w-[200px]">
            <input
              type="text"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="000000"
              className="w-full text-center text-3xl tracking-[0.25em] font-mono bg-background border border-border rounded-lg py-2.5 mb-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-all text-textMain placeholder-textMuted/30 h-[52px]"
            />
            <button
              type="submit"
              disabled={pin.length !== 6}
              className="w-full py-2.5 text-sm bg-secondary text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/90 shadow-sm transition-all"
            >
              Connect
            </button>
          </form>

          <div className="mt-4 flex items-center justify-center gap-4 text-[10px] font-bold text-textMuted uppercase tracking-widest w-full border-t border-border pt-4">
            <button 
              onClick={async (e) => {
                e.preventDefault();
                webrtcEngine.connect();
                setMode("receive");
                setRole("receiver");
                await webrtcEngine.createRoom();
              }}
              className="hover:text-secondary transition-colors flex items-center gap-1"
            >
              Request Files <ArrowDownToLine size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Info Section - Tighter Grid */}
      <section className="mt-8 grid gap-3 text-left md:grid-cols-3 max-w-4xl mx-auto w-full">
        <div className="rounded-xl border border-border bg-surface p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-md bg-background border border-border flex items-center justify-center text-textMain flex-shrink-0">
            <Smartphone size={16} />
          </div>
          <div>
            <h2 className="font-bold text-textMain text-sm">No app required</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-textMuted">Works instantly in any modern browser on all devices.</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-md bg-background border border-border flex items-center justify-center text-textMain flex-shrink-0">
            <QrCode size={16} />
          </div>
          <div>
            <h2 className="font-bold text-textMain text-sm">QR Code scanning</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-textMuted">Scan with your phone's camera to connect without typing.</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-md bg-background border border-border flex items-center justify-center text-textMain flex-shrink-0">
            <Upload size={16} />
          </div>
          <div>
            <h2 className="font-bold text-textMain text-sm">Free offline tools</h2>
            <Link href="/tools" className="mt-1 text-[11px] font-bold text-primary hover:underline flex items-center gap-1">
              Browse PDF & Image Tools <ArrowRight size={10} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
