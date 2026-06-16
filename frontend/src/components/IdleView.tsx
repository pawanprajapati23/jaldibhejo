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
    <div className="w-full flex flex-col items-center">
      <section className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Fast P2P Sharing
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-textMain tracking-tight mb-4">Send files instantly.</h1>
        <p className="mx-auto max-w-xl text-textMuted md:text-lg">
          No sign-ups. No size limits. Devices connect directly.
        </p>
      </section>

      <div className="grid lg:grid-cols-2 gap-8 w-full max-w-5xl mx-auto items-stretch">
        {/* Send Section */}
        <div 
          {...getRootProps()} 
          className={`relative overflow-hidden glass-panel flex flex-col items-center justify-center p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer border-2 ${isDragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10'}`}
        >
          <input {...getInputProps()} />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-400" />
          
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-colors duration-300 ${isDragActive ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
            <Upload size={40} strokeWidth={2.5} className={isDragActive ? 'animate-bounce' : ''} />
          </div>
          
          <h2 className="text-2xl font-bold text-textMain mb-2">Send Files</h2>
          <p className="text-textMuted text-sm mb-8">Tap here or drag & drop files to generate a PIN.</p>
          
          <button className="px-8 py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 transition-all w-full sm:w-auto">
            Select Files to Send
          </button>

          <div className="mt-6 flex items-center gap-4 text-xs font-bold text-textMuted uppercase tracking-widest">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                webrtcEngine.connect();
                setMode("send");
                setRole("sender");
              }}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              Send Text / Screen <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Receive Section */}
        <div className="relative overflow-hidden glass-panel flex flex-col items-center justify-center p-8 sm:p-12 text-center transition-all duration-300 border-2 border-border hover:border-secondary/50 hover:shadow-xl hover:shadow-secondary/10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-purple-400" />
          
          <div className="w-24 h-24 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-6">
            <Download size={40} strokeWidth={2.5} />
          </div>
          
          <h2 className="text-2xl font-bold text-textMain mb-2">Receive</h2>
          <p className="text-textMuted text-sm mb-6">Enter the 6-digit PIN from the sender.</p>
          
          <form onSubmit={handleReceive} className="w-full max-w-[280px]">
            <input
              type="text"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="000000"
              className="w-full text-center text-4xl tracking-[0.3em] font-mono bg-background border-2 border-border rounded-xl py-4 mb-4 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-textMain placeholder-textMuted/30"
            />
            <button
              type="submit"
              disabled={pin.length !== 6}
              className="w-full py-3.5 bg-secondary text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/90 shadow-lg shadow-secondary/25 hover:-translate-y-0.5 transition-all"
            >
              Connect Device
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4 text-xs font-bold text-textMuted uppercase tracking-widest">
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
              Or Request Files <ArrowDownToLine size={14} />
            </button>
          </div>
        </div>
      </div>

      <section className="mt-16 grid gap-6 text-left md:grid-cols-3 max-w-5xl mx-auto w-full">
        <div className="rounded-2xl border border-border bg-surface p-6 hover:border-textMuted/30 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-textMain mb-4">
            <Smartphone size={20} />
          </div>
          <h2 className="font-bold text-textMain text-lg">No app required</h2>
          <p className="mt-2 text-sm leading-relaxed text-textMuted">Works instantly in any modern browser on Android, iOS, Windows, or Mac.</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 hover:border-textMuted/30 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-textMain mb-4">
            <QrCode size={20} />
          </div>
          <h2 className="font-bold text-textMain text-lg">QR Code scanning</h2>
          <p className="mt-2 text-sm leading-relaxed text-textMuted">Scan the QR code with your phone's camera to connect devices instantly without typing.</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 hover:border-textMuted/30 transition-colors flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-textMain text-lg">Free offline tools</h2>
            <p className="mt-2 text-sm leading-relaxed text-textMuted mb-4">Need to compress an image or edit a PDF before sending? We have built-in secure tools.</p>
          </div>
          <Link href="/tools" className="text-primary text-sm font-bold flex items-center gap-1 hover:underline w-max">
            Browse Tools <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
