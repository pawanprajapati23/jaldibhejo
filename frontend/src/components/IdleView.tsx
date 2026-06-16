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

      <div className="grid md:grid-cols-3 gap-6 justify-center items-center w-full">
        <button
          onClick={() => {
            webrtcEngine.connect();
            setMode("send");
            setRole("sender");
          }}
          className="glass-panel w-full h-56 md:h-64 flex flex-col items-center justify-center gap-5 group"
        >
          <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center text-primary transition-colors group-hover:bg-primary/10">
            <Upload size={28} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1 text-textMain group-hover:text-primary transition-colors">Send Files</h2>
            <p className="text-sm text-textMuted">Share via PIN or QR</p>
          </div>
        </button>

        <button
          onClick={() => {
            webrtcEngine.connect();
            setMode("receive");
            setRole("receiver");
          }}
          className="glass-panel w-full h-56 md:h-64 flex flex-col items-center justify-center gap-5 group"
        >
          <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center text-secondary transition-colors group-hover:bg-secondary/10">
            <Download size={28} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1 text-textMain group-hover:text-secondary transition-colors">Receive</h2>
            <p className="text-sm text-textMuted">Enter PIN to connect</p>
          </div>
        </button>

        <button
          onClick={async () => {
            webrtcEngine.connect();
            setMode("receive");
            setRole("receiver");
            await webrtcEngine.createRoom(); // Force create a room to act as the receiver waiting for someone to send
          }}
          className="glass-panel w-full h-56 md:h-64 flex flex-col items-center justify-center gap-5 group"
        >
          <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center text-accent transition-colors group-hover:bg-accent/10">
            <ArrowDownToLine size={28} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1 text-textMain group-hover:text-accent transition-colors">Request Files</h2>
            <p className="text-sm text-textMuted">Create an upload link</p>
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
