import { useTransferStore } from "@/store/useTransferStore";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, CheckCircle2, AlertCircle, Smartphone, ShieldCheck, Download, Home, Plus, UploadCloud, MessageSquareText } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { webrtcEngine } from "@/lib/WebRTCEngine";
import { useDropzone } from "react-dropzone";

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
    downloadedFileUrl,
    setFiles,
    setTextPayload,
    prepareNextTransfer,
    reset
  } = useTransferStore();
  
  const [dots, setDots] = useState("");
  const [copied, setCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isFileReadyToSave, setIsFileReadyToSave] = useState(false);
  const [showSendText, setShowSendText] = useState(false);
  const [newText, setNewText] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      prepareNextTransfer();
      setFiles(acceptedFiles);
      webrtcEngine.startFileTransfer();
    }
  }, [setFiles, prepareNextTransfer]);

  const { getRootProps, getInputProps, open: openFileDialog } = useDropzone({ onDrop, noClick: true });

  const handleSendNewText = () => {
    if (newText.trim().length > 0) {
      prepareNextTransfer();
      setTextPayload(newText.trim());
      webrtcEngine.startFileTransfer();
      setShowSendText(false);
      setNewText("");
    }
  };

  const fileToDisplay = role === "sender" ? files[0] : incomingFile;
  const isTextMode = !!textPayload || !!incomingText;
  
  const displayImageUrl = role === "sender" 
    ? previewUrl 
    : (connectionState === "completed" && incomingFile?.type?.startsWith("image/") ? downloadedFileUrl : null);

  useEffect(() => {
    const isVerifyingReceivedFile = role === "receiver" && connectionState === "completed" && incomingFile && downloadedFileUrl && !isTextMode && !isFileReadyToSave;

    if (connectionState === "waiting" || connectionState === "connecting" || isVerifyingReceivedFile) {
      const i = setInterval(() => setDots(p => p.length >= 3 ? "" : p + "."), 500);
      return () => clearInterval(i);
    }
  }, [connectionState, downloadedFileUrl, incomingFile, isFileReadyToSave, isTextMode, role]);

  useEffect(() => {
    if (role === "sender" && files.length > 0 && files[0].type.startsWith("image/")) {
      const url = URL.createObjectURL(files[0]);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [files, role]);

  useEffect(() => {
    if (role === "receiver" && connectionState === "completed" && incomingFile && downloadedFileUrl && !isTextMode) {
      setIsFileReadyToSave(false);
      // Short delay for "Verifying" animation, then auto-download
      const timeout = setTimeout(() => {
        setIsFileReadyToSave(true);
        
        // Auto-download logic
        const a = document.createElement("a");
        a.href = downloadedFileUrl;
        a.download = incomingFile.name || "JaldiBhejo-download";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, 2000); 
      
      return () => clearTimeout(timeout);
    }

    setIsFileReadyToSave(false);
  }, [connectionState, downloadedFileUrl, incomingFile, isTextMode, role]);

  const handleCopy = () => {
    if (incomingText) {
      navigator.clipboard.writeText(incomingText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const [joinUrl, setJoinUrl] = useState("");

  useEffect(() => {
    if (roomId && typeof window !== 'undefined') {
      setJoinUrl(`${window.location.origin}?pin=${roomId}`);
    }
  }, [roomId]);

  return (
    <div {...getRootProps()} className="glass-panel w-full p-8 md:p-12 flex flex-col items-center justify-center min-h-[500px] outline-none">
      <input {...getInputProps()} />
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
          <p className="text-textMuted mb-8 text-sm">Share this PIN or scan the QR code to connect</p>
          
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
            <div className="flex flex-col items-center w-full">
              {displayImageUrl && (
                <div className="mb-6 rounded-xl overflow-hidden border border-border shadow-md w-40 h-40 flex-shrink-0 bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
                <div className="flex flex-col items-center">
                  {displayImageUrl && (
                    <div className="mb-6 rounded-xl overflow-hidden border border-border shadow-md w-48 h-48 flex-shrink-0 bg-surface mt-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={displayImageUrl} alt="Downloaded" className="object-cover w-full h-full" />
                    </div>
                  )}
                  {!isFileReadyToSave ? (
                    <div className="mt-2 w-full rounded-xl border border-primary/30 bg-primary/10 p-5">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-background text-primary">
                        <Loader2 className="animate-spin" size={24} />
                      </div>
                      <h3 className="font-bold text-textMain">Verifying transfer integrity{dots}</h3>
                      <p className="mt-2 text-sm leading-6 text-textMuted">
                        Checking the received file package...
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2 w-full rounded-xl border border-accent/30 bg-accent/10 p-5">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-background text-accent">
                        <ShieldCheck size={24} />
                      </div>
                      <h3 className="font-bold text-textMain">File Saved Automatically</h3>
                      <p className="mt-2 text-sm leading-6 text-textMuted">
                        Your file has been saved to your device downloads.
                      </p>
                    </div>
                  )}
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

          {/* Persistent Connection Actions */}
          <div className="w-full mt-8 pt-8 border-t border-border flex flex-col items-center">
            {showSendText ? (
              <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                <textarea 
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Type or paste a message..."
                  className="w-full min-h-[100px] bg-surface border border-border rounded-xl p-4 text-textMain placeholder-textMuted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none transition-colors text-sm mb-4"
                />
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => setShowSendText(false)}
                    className="flex-1 py-3 bg-surface hover:bg-surfaceHover border border-border text-textMain rounded-xl font-medium transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSendNewText}
                    disabled={newText.trim().length === 0}
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-primary/90 text-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-textMain mb-4">Send more on this connection</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button 
                    onClick={openFileDialog}
                    className="flex items-center gap-2 px-5 py-2.5 bg-surface border border-border hover:bg-surfaceHover hover:border-primary/50 text-textMain rounded-full transition-all text-sm font-medium"
                  >
                    <UploadCloud size={16} /> Send Files
                  </button>
                  <button 
                    onClick={() => setShowSendText(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-surface border border-border hover:bg-surfaceHover hover:border-primary/50 text-textMain rounded-full transition-all text-sm font-medium"
                  >
                    <MessageSquareText size={16} /> Send Text
                  </button>
                  <button 
                    onClick={() => {
                      webrtcEngine.disconnect();
                      reset();
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 rounded-full transition-all text-sm font-medium"
                  >
                    <Home size={16} /> End & Go Home
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
