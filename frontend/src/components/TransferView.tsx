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
    textPayload,
    incomingText,
    mediaStreamUrl,
    progress, 
    transferSpeed, 
    error 
  } = useTransferStore();
  
  const [dots, setDots] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (connectionState === "waiting" || connectionState === "connecting") {
      const i = setInterval(() => setDots(p => p.length >= 3 ? "" : p + "."), 500);
      return () => clearInterval(i);
    }
  }, [connectionState]);

  const handleCopy = () => {
    if (incomingText) {
      navigator.clipboard.writeText(incomingText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fileToDisplay = role === "sender" ? files[0] : incomingFile;
  const isTextMode = !!textPayload || !!incomingText;
  const isVideo = fileToDisplay?.type?.startsWith("video/");
  const isAudio = fileToDisplay?.type?.startsWith("audio/");

  const [joinUrl, setJoinUrl] = useState("");

  useEffect(() => {
    if (roomId && typeof window !== 'undefined') {
      setJoinUrl(`${window.location.origin}?pin=${roomId}`);
    }
  }, [roomId]);

  return (
    <div className="glass-panel w-full p-8 md:p-12 flex flex-col items-center justify-center min-h-[500px]">
      {connectionState === "error" && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-surface border border-border text-red-500 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-textMain">Connection Error</h2>
          <p className="text-red-400 text-sm">{error || "Something went wrong"}</p>
        </div>
      )}

      {connectionState === "waiting" && role === "sender" && (
        <div className="text-center w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-2 text-textMain">Ready to Send {isTextMode ? "Text" : "Files"}</h2>
          <p className="text-textMuted mb-8 text-sm">Share this PIN or scan the QR code to auto-download</p>
          
          <div className="bg-white p-4 rounded-2xl mb-8 inline-block">
            <QRCodeSVG value={joinUrl || roomId || ""} size={180} fgColor="#000000" bgColor="transparent" />
          </div>
          
          <div className="text-5xl tracking-[0.2em] font-mono font-bold text-primary mb-8">
            {roomId}
          </div>

          <div className="flex items-center justify-center gap-2 text-textMuted bg-surface border border-border py-2 px-4 rounded-full w-max mx-auto">
            <Smartphone size={16} />
            <span className="text-sm">Waiting for receiver{dots}</span>
          </div>
        </div>
      )}

      {(connectionState === "connecting" || connectionState === "connected" || connectionState === "transferring") && (
        <div className="text-center w-full max-w-md">
          <div className="w-16 h-16 rounded-full bg-surface border border-border text-primary flex items-center justify-center mx-auto mb-6">
            <Loader2 size={32} className="animate-spin" strokeWidth={2} />
          </div>
          
          <h2 className="text-2xl font-bold mb-6 text-textMain">
            {connectionState === "connecting" ? `Connecting${dots}` : "Transferring..."}
          </h2>
          
          {!isTextMode && fileToDisplay && (
            <div className="bg-surface border border-border rounded-xl p-4 mb-8 text-left flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-textMuted"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base truncate text-textMain">{fileToDisplay.name}</p>
                <p className="text-xs text-textMuted mt-0.5">{(fileToDisplay.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
          )}

          {/* Live Media Streaming Player */}
          {role === "receiver" && mediaStreamUrl && (isVideo || isAudio) && (
             <div className="w-full mb-8 overflow-hidden rounded-xl border border-border bg-black">
               {isVideo ? (
                 <video src={mediaStreamUrl} controls autoPlay className="w-full h-auto max-h-[300px] object-contain bg-black" />
               ) : (
                 <audio src={mediaStreamUrl} controls autoPlay className="w-full" />
               )}
               <p className="text-xs text-primary mt-2 mb-2">Live Streaming Active</p>
             </div>
          )}

          {isTextMode && (
             <div className="bg-surface border border-border rounded-xl p-4 mb-8">
               <p className="text-textMuted text-sm">Sending Text Payload...</p>
             </div>
          )}

          {connectionState === "transferring" && !isTextMode && (
            <div className="w-full">
              <div className="flex justify-between text-xs mb-2 text-textMuted">
                <span>{progress}%</span>
                <span className="tabular-nums">{transferSpeed}</span>
              </div>
              <div className="h-2 bg-surface rounded-full overflow-hidden border border-border">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {connectionState === "completed" && (
        <div className="text-center w-full max-w-md">
          <div className="w-16 h-16 rounded-full bg-surface border border-border text-green-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-bold mb-3 text-textMain">Transfer Complete</h2>
          
          {role === "sender" ? (
             <p className="text-textMuted text-sm mb-8">
               Your {isTextMode ? "text" : "files"} were successfully sent.
             </p>
          ) : (
            <>
              {!isTextMode && (
                <p className="text-textMuted text-sm mb-8">
                  Your files have been saved to your device.
                </p>
              )}
              {isTextMode && incomingText && (
                <div className="w-full text-left mt-6">
                  <p className="text-xs text-textMuted mb-2 ml-2">Received Text:</p>
                  <div className="bg-background border border-border rounded-xl p-4 mb-4 max-h-[200px] overflow-y-auto text-textMain whitespace-pre-wrap break-words text-sm">
                    {incomingText}
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="w-full py-3 bg-surface hover:bg-surfaceHover border border-border text-textMain rounded-lg transition-colors text-sm font-medium"
                  >
                    {copied ? "Copied!" : "Copy Text"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
