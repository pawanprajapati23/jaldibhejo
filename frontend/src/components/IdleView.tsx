import { useTransferStore } from "@/store/useTransferStore";
import Link from "next/link";
import { Upload, Download, ArrowRight, ArrowDownToLine } from "lucide-react";
import { webrtcEngine } from "@/lib/WebRTCEngine";

export function IdleView() {
  const { setMode, setRole } = useTransferStore();

  return (
    <div className="w-full">
      <section className="mb-8 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Peer-to-peer browser sharing</p>
        <h1 className="text-3xl font-bold text-textMain md:text-5xl">Send files instantly with a PIN or QR code</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-textMuted md:text-base">
          JaldiBhejo helps you move files and text between devices without accounts, app installs, or permanent public links.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/file-sharing" className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-textMain transition-colors hover:bg-surfaceHover">
            How P2P sharing works
            <ArrowRight size={16} />
          </Link>
          <Link href="/tools" className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-textMain transition-colors hover:bg-surfaceHover">
            Explore free tools
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4 max-w-5xl mx-auto">
        <button
          onClick={() => {
            webrtcEngine.connect();
            setMode("send");
            setRole("sender");
          }}
          className="group relative overflow-hidden glass-panel h-64 flex flex-col items-center justify-center gap-6 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 active:scale-[0.98]"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:rotate-6 shadow-sm">
            <Upload size={32} strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black tracking-tight text-textMain">Send Files</h2>
            <p className="text-sm font-medium text-textMuted mt-1">Instant P2P Transfer</p>
          </div>
        </button>

        <button
          onClick={() => {
            webrtcEngine.connect();
            setMode("receive");
            setRole("receiver");
          }}
          className="group relative overflow-hidden glass-panel h-64 flex flex-col items-center justify-center gap-6 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-1 active:scale-[0.98]"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-20 h-20 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center transition-all duration-500 group-hover:bg-secondary group-hover:text-white group-hover:-rotate-6 shadow-sm">
            <Download size={32} strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black tracking-tight text-textMain">Receive</h2>
            <p className="text-sm font-medium text-textMuted mt-1">Enter PIN to Connect</p>
          </div>
        </button>

        <button
          onClick={async () => {
            webrtcEngine.connect();
            setMode("receive");
            setRole("receiver");
            await webrtcEngine.createRoom();
          }}
          className="group relative overflow-hidden glass-panel h-64 flex flex-col items-center justify-center gap-6 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-1 active:scale-[0.98]"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-20 h-20 rounded-2xl bg-accent/10 text-accent flex items-center justify-center transition-all duration-500 group-hover:bg-accent group-hover:text-white group-hover:scale-110 shadow-sm">
            <ArrowDownToLine size={32} strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black tracking-tight text-textMain">Request</h2>
            <p className="text-sm font-medium text-textMuted mt-1">Create Upload Link</p>
          </div>
        </button>
      </div>

      <section className="mt-10 grid gap-4 text-left md:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="font-bold text-textMain">No account required</h2>
          <p className="mt-2 text-sm leading-6 text-textMuted">Create a short transfer session and share the code with the receiver.</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="font-bold text-textMain">Browser-based</h2>
          <p className="mt-2 text-sm leading-6 text-textMuted">Use JaldiBhejo from modern browsers on mobile, laptop, or desktop.</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="font-bold text-textMain">Useful tools</h2>
          <p className="mt-2 text-sm leading-6 text-textMuted">Compress images locally before sending to reduce file size and transfer time.</p>
        </div>
      </section>
    </div>
  );
}
