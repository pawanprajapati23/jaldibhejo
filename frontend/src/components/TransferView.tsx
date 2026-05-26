import { useTransferStore } from "@/store/useTransferStore";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, CheckCircle2, AlertCircle, Smartphone } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export function TransferView() {
  const { 
    role, 
    connectionState, 
    roomId, 
    files, 
    incomingFile,
    textPayload,
    incomingText,
    progress, 
    transferSpeed, 
    error,
    localStream,
    remoteStream,
    isScreenSharing,
    downloadedFileUrl
  } = useTransferStore();
  
  const [dots, setDots] = useState("");
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (connectionState === "waiting" || connectionState === "connecting") {
      const i = setInterval(() => setDots(p => p.length >= 3 ? "" : p + "."), 500);
      return () => clearInterval(i);
    }
  }, [connectionState]);

  useEffect(() => {
    if (videoRef.current) {
      if (role === 'sender' && localStream) {
        videoRef.current.srcObject = localStream;
      } else if (role === 'receiver' && remoteStream) {
        videoRef.current.srcObject = remoteStream;
      }
    }
  }, [localStream, remoteStream, isScreenSharing, role, connectionState]);

  useEffect(() => {
    if (role === "sender" && files.length > 0 && files[0].type.startsWith("image/")) {
      const url = URL.createObjectURL(files[0]);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [files, role]);

  const handleCopy = () => {
    if (incomingText) {
      navigator.clipboard.writeText(incomingText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fileToDisplay = role === "sender" ? files[0] : incomingFile;
  const isTextMode = !!textPayload || !!incomingText;
  
  const displayImageUrl = role === "sender" 
    ? previewUrl 
    : (connectionState === "completed" && incomingFile?.type?.startsWith("image/") ? downloadedFileUrl : null);

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

      {connectionState === "waiting" && role === "sender" && !isScreenSharing && (
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

      {/* Screen Sharing View */}
      {isScreenSharing && connectionState !== "error" && connectionState !== "disconnected" && (
        <div className="w-full flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-6 text-textMain">
            {role === 'sender' 
              ? (connectionState === 'waiting' ? `Waiting for receiver${dots}` : "Sharing Screen")
              : (connectionState === 'transferring' || connectionState === 'connected' ? "Viewing Remote Screen" : `Connecting${dots}`)
            }
          </h2>

          {role === 'sender' && connectionState === 'waiting' && (
             <div className="mb-6 flex flex-col items-center">
               <div className="bg-white p-4 rounded-2xl mb-4 inline-block">
                 <QRCodeSVG value={joinUrl || roomId || ""} size={140} fgColor="#000000" bgColor="transparent" />
               </div>
               <div className="text-4xl tracking-[0.2em] font-mono font-bold text-primary mb-4">
                 {roomId}
               </div>
             </div>
          )}

          <div className="w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl bg-black border border-border flex items-center justify-center min-h-[300px]">
            {(!remoteStream && role === 'receiver') ? (
              <Loader2 size={32} className="animate-spin text-primary" />
            ) : (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted={role === 'sender'} 
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>
      )}

      {(connectionState === "connecting" || connectionState === "connected" || connectionState === "transferring") && !isScreenSharing && (
        <div className="text-center w-full max-w-md">
          <div className="w-16 h-16 rounded-full bg-surface border border-border text-primary flex items-center justify-center mx-auto mb-6">
            <Loader2 size={32} className="animate-spin" strokeWidth={2} />
          </div>
          
          <h2 className="text-2xl font-bold mb-6 text-textMain">
            {connectionState === "connecting" ? `Connecting${dots}` : "Transferring..."}
          </h2>
          
          {!isTextMode && fileToDisplay && (
            <div className="flex flex-col items-center w-full">
              {displayImageUrl && (
                <div className="mb-6 rounded-xl overflow-hidden border border-border shadow-md w-40 h-40 flex-shrink-0 bg-surface">
                  <img src={displayImageUrl} alt="Preview" className="object-cover w-full h-full" />
                </div>
              )}
              <div className="bg-surface border border-border rounded-xl p-4 mb-8 text-left flex items-center gap-4 w-full">
                {!displayImageUrl && (
                  <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-textMuted"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base truncate text-textMain">{fileToDisplay.name}</p>
                  <p className="text-xs text-textMuted mt-0.5">{(fileToDisplay.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
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

      {connectionState === "completed" && !isScreenSharing && (
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
                <div className="flex flex-col items-center">
                  {displayImageUrl && (
                    <div className="mb-6 rounded-xl overflow-hidden border border-border shadow-md w-48 h-48 flex-shrink-0 bg-surface mt-4">
                      <img src={displayImageUrl} alt="Downloaded" className="object-cover w-full h-full" />
                    </div>
                  )}
                  <p className="text-textMuted text-sm mb-8 mt-2">
                    Your files have been saved to your device.
                  </p>
                </div>
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
