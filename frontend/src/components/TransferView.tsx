import { useTransferStore } from "@/store/useTransferStore";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, CheckCircle2, AlertCircle, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

export function TransferView() {
  const { 
    role, 
    connectionState, 
    roomId, 
    files, 
    incomingFile, 
    progress, 
    transferSpeed, 
    error 
  } = useTransferStore();
  
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (connectionState === "waiting" || connectionState === "connecting") {
      const i = setInterval(() => setDots(p => p.length >= 3 ? "" : p + "."), 500);
      return () => clearInterval(i);
    }
  }, [connectionState]);

  const fileToDisplay = role === "sender" ? files[0] : incomingFile;

  return (
    <div className="glass-panel w-full p-8 md:p-12 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
      {connectionState === "error" && (
        <div className="text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 rounded-2xl bg-surface border border-border text-accent flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]">
            <AlertCircle size={40} strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-bold mb-2 tracking-tight text-textMain">Connection Error</h2>
          <p className="text-accent/80 text-[15px] font-medium">{error || "Something went wrong"}</p>
        </div>
      )}

      {connectionState === "waiting" && role === "sender" && (
        <div className="text-center w-full max-w-sm animate-in fade-in zoom-in duration-300">
          <h2 className="text-2xl font-bold mb-2 tracking-tight text-textMain">Ready to Send</h2>
          <p className="text-textMuted mb-8 text-[15px] font-medium">Share this PIN or scan the QR code</p>
          
          <div className="bg-white p-6 rounded-3xl mb-8 inline-block shadow-glow-primary border border-white/10">
            <QRCodeSVG value={roomId || ""} size={180} fgColor="#000000" bgColor="transparent" />
          </div>
          
          <div className="text-5xl tracking-[0.3em] font-mono font-bold text-gradient mb-8 drop-shadow-md">
            {roomId}
          </div>

          <div className="flex items-center justify-center gap-2 text-textMuted bg-surface border border-border py-2.5 px-5 rounded-full w-max mx-auto">
            <Smartphone size={18} className="animate-pulse" />
            <span className="font-medium text-[15px]">Waiting for receiver{dots}</span>
          </div>
        </div>
      )}

      {(connectionState === "connecting" || connectionState === "connected" || connectionState === "transferring") && (
        <div className="text-center w-full max-w-md animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 rounded-2xl bg-surface border border-border text-primary flex items-center justify-center mx-auto mb-6 shadow-glow-primary">
            <Loader2 size={40} className="animate-spin" strokeWidth={2} />
          </div>
          
          <h2 className="text-2xl font-bold mb-6 tracking-tight text-textMain">
            {connectionState === "connecting" ? `Connecting${dots}` : "Transferring..."}
          </h2>
          
          {fileToDisplay && (
            <div className="bg-surfaceHover border border-border rounded-2xl p-4 mb-8 text-left flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-textMuted"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[17px] truncate text-textMain">{fileToDisplay.name}</p>
                <p className="text-[13px] text-textMuted mt-0.5 font-medium">{(fileToDisplay.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
          )}

          {connectionState === "transferring" && (
            <div className="w-full">
              <div className="flex justify-between text-[13px] mb-2 font-semibold text-textMuted">
                <span>{progress}%</span>
                <span className="tabular-nums">{transferSpeed}</span>
              </div>
              <div className="h-3 bg-surface rounded-full overflow-hidden border border-border shadow-inner">
                <div 
                  className="h-full bg-gradient-glow transition-all duration-300 shadow-glow-primary relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:12px_12px] animate-[move_1s_linear_infinite]"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {connectionState === "completed" && (
        <div className="text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 rounded-2xl bg-surface border border-border text-accent flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]">
            <CheckCircle2 size={48} strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-bold mb-3 tracking-tight text-textMain">Transfer Complete</h2>
          <p className="text-textMuted text-[15px] font-medium mb-8 max-w-xs mx-auto">
            {role === "sender" ? "Your file was securely sent." : "Your file has been saved to your device."}
          </p>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes move {
          0% { background-position: 0 0; }
          100% { background-position: 12px 12px; }
        }
      `}} />
    </div>
  );
}
