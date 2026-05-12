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
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-glow opacity-50"></div>

      {connectionState === "error" && (
        <div className="text-center animate-in fade-in zoom-in duration-300">
          <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <AlertCircle size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-bold mb-3 tracking-tight">Connection Error</h2>
          <p className="text-red-400/80 text-lg">{error || "Something went wrong"}</p>
        </div>
      )}

      {connectionState === "waiting" && role === "sender" && (
        <div className="text-center w-full max-w-sm animate-in fade-in zoom-in duration-300">
          <h2 className="text-3xl font-bold mb-3 tracking-tight">Ready to Send</h2>
          <p className="text-white/40 mb-10 text-lg font-light">Share this PIN or scan the QR code to connect</p>
          
          <div className="bg-white/90 p-8 rounded-3xl mb-10 inline-block shadow-[0_0_40px_rgba(168,85,247,0.3)] ring-4 ring-white/10 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-3xl pointer-events-none"></div>
            <QRCodeSVG value={roomId || ""} size={220} fgColor="#030305" bgColor="transparent" />
          </div>
          
          <div className="text-6xl tracking-[0.2em] font-mono font-bold text-gradient-animated mb-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            {roomId}
          </div>

          <div className="flex items-center justify-center gap-3 text-white/60 bg-white/5 py-3 px-6 rounded-full w-max mx-auto border border-white/10 backdrop-blur-md">
            <Smartphone size={20} className="animate-pulse" />
            <span className="font-medium">Waiting for receiver{dots}</span>
          </div>
        </div>
      )}

      {(connectionState === "connecting" || connectionState === "connected" || connectionState === "transferring") && (
        <div className="text-center w-full max-w-md animate-in fade-in zoom-in duration-300">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <Loader2 size={48} className="animate-spin" strokeWidth={1.5} />
          </div>
          
          <h2 className="text-3xl font-bold mb-3 tracking-tight">
            {connectionState === "connecting" ? `Connecting${dots}` : "Transferring..."}
          </h2>
          
          {fileToDisplay && (
            <div className="bg-black/30 border border-white/10 rounded-2xl p-5 mb-10 text-left flex items-center gap-4 shadow-inner">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-lg truncate text-white/90">{fileToDisplay.name}</p>
                <p className="text-sm text-white/40 mt-1">{(fileToDisplay.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
          )}

          {connectionState === "transferring" && (
            <div className="w-full">
              <div className="flex justify-between text-sm mb-3 font-medium text-white/80">
                <span>{progress}%</span>
                <span className="tabular-nums">{transferSpeed}</span>
              </div>
              <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div 
                  className="h-full bg-gradient-glow transition-all duration-300 relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[move_1s_linear_infinite]"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {connectionState === "completed" && (
        <div className="text-center animate-in fade-in zoom-in duration-300">
          <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <CheckCircle2 size={56} strokeWidth={1.5} />
          </div>
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Transfer Complete!</h2>
          <p className="text-white/50 text-lg font-light mb-8 max-w-xs mx-auto">
            {role === "sender" ? "Your file was securely sent." : "Your file has been saved to your device."}
          </p>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes move {
          0% { background-position: 0 0; }
          100% { background-position: 20px 20px; }
        }
      `}} />
    </div>
  );
}
