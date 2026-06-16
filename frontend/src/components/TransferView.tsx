import { useTransferStore } from "@/store/useTransferStore";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, CheckCircle2, AlertCircle, Smartphone, ShieldCheck, Download, Home, Plus, UploadCloud, MessageSquareText, MonitorUp, Maximize, Minimize, Mic, MicOff, Coffee, Link as LinkIcon, Copy } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { webrtcEngine } from "@/lib/WebRTCEngine";
import { useDropzone } from "react-dropzone";
import { startSoundBase64, successSoundBase64 } from "@/lib/sounds";
import { uploadToCloud } from "@/lib/cloudStorage";
import Link from "next/link";


function VideoPlayer({ stream, muted }: { stream: MediaStream; muted?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        const orientation = (screen.orientation as any);
        if (orientation && orientation.lock) {
          // Attempt to lock to landscape for mobile devices
          await orientation.lock('landscape').catch(() => {
            // Ignore error, API might not be supported or allowed
          });
        }
      } catch (err: any) {
        console.error("Error attempting to enable full-screen mode:", err.message);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        const orientation = (screen.orientation as any);
        if (orientation && orientation.unlock) {
          orientation.unlock();
        }
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative group w-full flex items-center justify-center bg-black overflow-hidden shadow-lg ${isFullscreen ? "h-screen w-screen rounded-none border-none" : "rounded-xl border border-border"}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`w-full object-contain ${isFullscreen ? "h-full max-h-screen" : "max-h-[70vh]"}`}
      />
      <button
        onClick={toggleFullscreen}
        className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
        title="Toggle Fullscreen"
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>
    </div>
  );
}

export function TransferView() {
  const { 
    role, 
    connectionState, 
    roomId, 
    files, 
    incomingFile,
    incomingThumbnail,
    textPayload,
    incomingText,
    localStream,
    remoteStream,
    progress, 
    transferSpeed, 
    timeRemaining,
    latency,
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
  const [isMuted, setIsMuted] = useState(false);
  
  const [isUploadingToCloud, setIsUploadingToCloud] = useState(false);
  const [cloudProgress, setCloudProgress] = useState(0);
  const [cloudLink, setCloudLink] = useState<string | null>(null);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted; // If it's currently muted (true), we enable it (set to true)
      });
      setIsMuted(!isMuted);
    }
  };

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
  const isScreenMode = !!localStream || !!remoteStream;
  
  const displayImageUrl = role === "sender" 
    ? previewUrl 
    : (connectionState === "completed" && incomingFile?.type?.startsWith("image/") ? downloadedFileUrl : null);

  useEffect(() => {
    const isVerifyingReceivedFile = role === "receiver" && connectionState === "completed" && incomingFile && downloadedFileUrl && !isTextMode && !isScreenMode && !isFileReadyToSave;

    if (connectionState === "waiting" || connectionState === "connecting" || isVerifyingReceivedFile) {
      const i = setInterval(() => setDots(p => p.length >= 3 ? "" : p + "."), 500);
      return () => clearInterval(i);
    }
  }, [connectionState, downloadedFileUrl, incomingFile, isFileReadyToSave, isTextMode, isScreenMode, role]);

  useEffect(() => {
    if (role === "sender" && files.length > 0 && files[0].type.startsWith("image/")) {
      const url = URL.createObjectURL(files[0]);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [files, role]);

  const prevConnectionState = useRef<string>("disconnected");

  useEffect(() => {
    if (prevConnectionState.current !== "transferring" && connectionState === "transferring") {
      const audio = new Audio(startSoundBase64);
      audio.play().catch(() => {});
      if ("vibrate" in navigator) navigator.vibrate([50]);
    }
    if (prevConnectionState.current !== "completed" && connectionState === "completed") {
      const audio = new Audio(successSoundBase64);
      audio.play().catch(() => {});
      if ("vibrate" in navigator) navigator.vibrate([100, 30, 100]);
    }
    prevConnectionState.current = connectionState;
  }, [connectionState]);

  useEffect(() => {
    if (role === "receiver" && connectionState === "completed" && incomingFile && downloadedFileUrl && !isTextMode && !isScreenMode) {
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
  }, [connectionState, downloadedFileUrl, incomingFile, isTextMode, isScreenMode, role]);

  const handleCopy = () => {
    if (incomingText) {
      navigator.clipboard.writeText(incomingText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const [joinUrl, setJoinUrl] = useState("");
  const [requestUrl, setRequestUrl] = useState("");

  useEffect(() => {
    if (roomId && typeof window !== 'undefined') {
      setJoinUrl(`${window.location.origin}?pin=${roomId}`);
      setRequestUrl(`${window.location.origin}?request=${roomId}`);
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
          <h2 className="text-2xl font-bold mb-2 text-textMain">Ready to Share {isScreenMode ? "Screen" : isTextMode ? "Text" : "Files"}</h2>
          <p className="text-textMuted mb-8 text-sm">Share this PIN or scan the QR code to connect</p>
          
          <div className="bg-white p-4 rounded-2xl mb-8 inline-block">
            <QRCodeSVG value={joinUrl || roomId || ""} size={180} fgColor="#000000" bgColor="transparent" />
          </div>
          
          <div className="text-5xl tracking-[0.2em] font-mono font-bold text-primary mb-8">
            {roomId}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-2 text-textMuted bg-surface border border-border py-2 px-4 rounded-full w-max">
              <Smartphone size={16} />
              <span className="text-sm">Waiting for receiver{dots}</span>
            </div>
            {latency !== null && (
              <div className="flex items-center gap-2 text-textMuted bg-surface border border-border py-2 px-4 rounded-full w-max animate-in fade-in duration-500">
                <div className="flex gap-0.5 items-end h-3">
                  <div className={`w-1 h-1.5 rounded-full ${latency < 200 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <div className={`w-1 h-2.5 rounded-full ${latency < 100 ? 'bg-green-500' : latency < 500 ? 'bg-yellow-500' : 'bg-border'}`} />
                  <div className={`w-1 h-3.5 rounded-full ${latency < 50 ? 'bg-green-500' : latency < 300 ? 'bg-yellow-500' : 'bg-border'}`} />
                </div>
                <span className="text-xs font-mono">{latency}ms</span>
              </div>
            )}
          </div>

          {!isScreenMode && !isTextMode && files.length > 0 && files.reduce((acc, f) => acc + f.size, 0) <= 50 * 1024 * 1024 && !cloudLink && (
            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="text-lg font-bold text-textMain mb-2">Receiver Offline?</h3>
              <p className="text-sm text-textMuted mb-4">Generate an expirable cloud link valid for 10 minutes. Max 50MB.</p>
              
              <button
                onClick={async () => {
                  setIsUploadingToCloud(true);
                  const res = await uploadToCloud(files, setCloudProgress);
                  if (res.link) setCloudLink(res.link);
                  setIsUploadingToCloud(false);
                }}
                disabled={isUploadingToCloud}
                className="w-full px-5 py-3 bg-surface border border-border hover:border-primary hover:bg-surfaceHover text-textMain rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                {isUploadingToCloud ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                {isUploadingToCloud ? `Uploading... ${cloudProgress}%` : "Generate Cloud Link"}
              </button>
            </div>
          )}

          {cloudLink && (
            <div className="mt-8 pt-8 border-t border-border animate-in zoom-in duration-300">
              <h3 className="text-lg font-bold text-textMain mb-2">Link Generated!</h3>
              <p className="text-sm text-textMuted mb-4">Anyone with this link can download the files for the next 10 minutes.</p>
              <div className="flex items-center bg-background border border-border rounded-xl p-2 pl-4">
                <span className="flex-1 text-sm text-textMain truncate mr-2 font-mono select-all">
                  {cloudLink}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(cloudLink);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="p-2 bg-surface hover:bg-surfaceHover rounded-lg transition-colors"
                >
                  {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} className="text-textMuted" />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {connectionState === "waiting" && role === "receiver" && (
        <div className="text-center w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-2 text-textMain">Request Files</h2>
          <p className="text-textMuted mb-8 text-sm">Send this link to someone so they can upload files directly to your device.</p>
          
          <div className="bg-white p-4 rounded-2xl mb-8 inline-block">
            <QRCodeSVG value={requestUrl || roomId || ""} size={180} fgColor="#000000" bgColor="transparent" />
          </div>
          
          <div className="flex items-center bg-background border border-border rounded-xl p-2 pl-4 mb-8">
            <span className="flex-1 text-sm text-textMain truncate mr-2 font-mono select-all">
              {requestUrl}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(requestUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="p-2 bg-surface hover:bg-surfaceHover rounded-lg transition-colors"
            >
              {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} className="text-textMuted" />}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 text-textMuted bg-surface border border-border py-2 px-4 rounded-full w-max">
              <Smartphone size={16} />
              <span className="text-sm">Waiting for someone to open link{dots}</span>
            </div>
            {latency !== null && (
              <div className="flex items-center gap-2 text-textMuted bg-surface border border-border py-2 px-4 rounded-full w-max animate-in fade-in duration-500">
                <div className="flex gap-0.5 items-end h-3">
                  <div className={`w-1 h-1.5 rounded-full ${latency < 200 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <div className={`w-1 h-2.5 rounded-full ${latency < 100 ? 'bg-green-500' : latency < 500 ? 'bg-yellow-500' : 'bg-border'}`} />
                  <div className={`w-1 h-3.5 rounded-full ${latency < 50 ? 'bg-green-500' : latency < 300 ? 'bg-yellow-500' : 'bg-border'}`} />
                </div>
                <span className="text-xs font-mono">{latency}ms</span>
              </div>
            )}
          </div>
        </div>
      )}

      {(connectionState === "connecting" || connectionState === "connected" || connectionState === "transferring") && (
        <div className="text-center w-full max-w-4xl relative">
          {/* Reconnecting Overlay */}
          {error && connectionState === "transferring" && (
            <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-md flex flex-col items-center justify-center rounded-2xl animate-in fade-in duration-300">
               <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
               <p className="font-bold text-textMain">Network Interrupted</p>
               <p className="text-sm text-textMuted mt-1">Attempting to auto-reconnect...</p>
            </div>
          )}

          {connectionState === "connecting" && (
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-full bg-surface border border-border text-primary flex items-center justify-center mx-auto mb-6">
                <Loader2 size={32} className="animate-spin" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-textMain">
                Connecting{dots}
              </h2>
            </div>
          )}

          {connectionState === "connected" && role === "sender" && files.length === 0 && !textPayload && (
            <div className="flex flex-col items-center mb-8 animate-in fade-in zoom-in duration-300 w-full max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                <UploadCloud size={40} />
              </div>
              <h2 className="text-2xl font-bold text-textMain mb-2">Ready to Send</h2>
              <p className="text-textMuted text-sm mb-8 px-4 text-center">You are connected to the requester. Tap the button below or drop files anywhere to start sharing.</p>
              <button 
                onClick={openFileDialog}
                className="px-10 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
              >
                Select Files to Send
              </button>
            </div>
          )}

          {connectionState === "connected" && role === "receiver" && !incomingFile && !incomingText && (
            <div className="flex flex-col items-center mb-8 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-surface border border-border text-green-500 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-2xl font-bold text-textMain mb-2">Securely Connected</h2>
              <p className="text-textMuted text-sm">Successfully paired with the sender. Waiting for them to pick files{dots}</p>
            </div>
          )}

          {isScreenMode ? (
            <div className="flex flex-col items-center w-full mt-4 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-2 mb-4 bg-surface border border-border px-4 py-2 rounded-full shadow-sm">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="font-bold text-textMain text-sm uppercase tracking-widest">Live Screen Share</span>
              </div>
              
              {localStream && (
                <div className="w-full">
                  <VideoPlayer stream={localStream} muted={true} />
                  <p className="text-textMuted mt-4 text-sm">You are sharing your screen.</p>
                </div>
              )}
              {remoteStream && (
                <div className="w-full">
                  <VideoPlayer stream={remoteStream} />
                </div>
              )}
              
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {role === 'sender' && (
                  <button 
                    onClick={toggleMute}
                    className={`px-6 py-2.5 font-bold rounded-xl transition-colors flex items-center gap-2 border ${isMuted ? 'bg-red-500/10 text-red-500 border-red-500/50 hover:bg-red-500 hover:text-white' : 'bg-surface text-textMain border-border hover:bg-surfaceHover'}`}
                  >
                    {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                    {isMuted ? 'Unmute' : 'Mute'}
                  </button>
                )}
                
                <button 
                  onClick={() => {
                     webrtcEngine.disconnect();
                     reset();
                  }}
                  className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500 border border-red-500/50 hover:border-red-500 text-red-500 hover:text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                  <MonitorUp size={18} />
                  Stop & Disconnect
                </button>
              </div>
            </div>
          ) : (
            <>
              {connectionState === "transferring" && (
                <>
                  <div className="w-16 h-16 rounded-full bg-surface border border-border text-primary flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Loader2 size={32} className="animate-spin" strokeWidth={2} />
                  </div>
                  <h2 className="text-2xl font-bold mb-6 text-textMain">
                    Transferring...
                  </h2>
                </>
              )}
              
              {!isTextMode && (fileToDisplay || incomingThumbnail) && connectionState !== "connecting" && connectionState !== "connected" && (
                <div className="flex flex-col items-center w-full">
                  {(displayImageUrl || incomingThumbnail) && (
                    <div className="mb-6 rounded-xl overflow-hidden border border-border shadow-md w-40 h-40 flex-shrink-0 bg-surface">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={displayImageUrl || incomingThumbnail || ""} alt="Preview" className="object-cover w-full h-full" />
                    </div>
                  )}
                  <div className="bg-surface border border-border rounded-xl p-4 mb-8 text-left flex items-center gap-4 w-full max-w-md mx-auto">
                    {!(displayImageUrl || incomingThumbnail) && (
                      <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-textMuted"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base truncate text-textMain">{fileToDisplay?.name || "Incoming File..."}</p>
                      <p className="text-xs text-textMuted mt-0.5">{fileToDisplay ? (fileToDisplay.size / (1024 * 1024)).toFixed(2) + " MB" : "Calculating..."}</p>
                    </div>
                  </div>
                </div>
              )}

              {isTextMode && connectionState === "transferring" && (
                <div className="bg-surface border border-border rounded-xl p-6 mb-8 w-full max-w-md mx-auto text-left shadow-sm">
                  <div className="flex items-center gap-2 mb-3 text-textMuted border-b border-border pb-3">
                    <MessageSquareText size={18} />
                    <span className="font-semibold text-sm">Sending Text</span>
                  </div>
                  <p className="text-textMain whitespace-pre-wrap break-words line-clamp-3 opacity-70 italic font-mono text-sm">
                    {textPayload || incomingText}
                  </p>
                </div>
              )}

              {connectionState === "transferring" && (
                <div className="w-full max-w-md mx-auto mb-8 bg-surface border border-border p-4 rounded-2xl shadow-sm">
                   <div className="flex justify-between items-end mb-4">
                      <div className="text-left">
                        <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-1">Transfer Speed</p>
                        <p className="text-xl font-mono font-bold text-primary">{transferSpeed}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-1">Time Remaining</p>
                        <p className="text-xl font-mono font-bold text-textMain">{timeRemaining || "--"}</p>
                      </div>
                   </div>
                   
                   <div className="w-full bg-background border border-border rounded-full h-3 mb-3 overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        style={{ width: `${progress}%` }}
                      />
                   </div>

                   <div className="flex justify-between text-xs font-bold text-textMuted">
                      <span>{progress}% Completed</span>
                      {latency !== null && <span className="flex items-center gap-1.5"><div className={`w-1.5 h-1.5 rounded-full ${latency < 100 ? 'bg-green-500' : 'bg-yellow-500'}`} /> Ping: {latency}ms</span>}
                   </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {connectionState === "completed" && !isScreenMode && (
        <div className="text-center w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-16 h-16 rounded-full bg-surface border border-border text-green-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-bold mb-3 text-textMain">Transfer Complete</h2>

          <div className="mt-8 mb-8 p-6 bg-surface border border-border rounded-2xl max-w-md mx-auto animate-in fade-in zoom-in delay-300 duration-700">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-full bg-[#FFDD00] flex items-center justify-center text-black flex-shrink-0">
                <Coffee size={24} fill="currentColor" />
              </div>
              <div>
                <h4 className="font-bold text-textMain">Enjoying JaldiBhejo?</h4>
                <p className="text-xs text-textMuted mt-1">If this tool saved you time, consider supporting the developer with a small coffee!</p>
              </div>
            </div>
            <Link 
              href="/support" 
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-[#FFDD00] text-black font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              Support the Project
            </Link>
          </div>

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
                    <div className="mt-2 w-full max-w-sm rounded-xl border border-primary/30 bg-primary/10 p-5">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-background text-primary">
                        <Loader2 className="animate-spin" size={24} />
                      </div>
                      <h3 className="font-bold text-textMain">Verifying transfer integrity{dots}</h3>
                      <p className="mt-2 text-sm leading-6 text-textMuted">
                        Checking the received file package...
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2 w-full max-w-sm rounded-xl border border-accent/30 bg-accent/10 p-5">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-background text-accent">
                        <ShieldCheck size={28} />
                      </div>
                      <h3 className="font-bold text-textMain">Transfer Verified</h3>
                      <p className="mt-2 text-sm leading-6 text-textMuted mb-5">
                        Your file was securely downloaded and verified. Check your downloads folder.
                      </p>
                      <button 
                        onClick={() => {
                          const a = document.createElement("a");
                          if (downloadedFileUrl) a.href = downloadedFileUrl;
                          a.download = incomingFile?.name || "JaldiBhejo-download";
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        }}
                        className="inline-flex items-center gap-2 bg-accent text-white font-bold py-2 px-5 rounded-lg hover:bg-accent/90 transition-colors"
                      >
                        <Download size={18} /> Download Again
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {isTextMode && (
                <div className="w-full max-w-lg mx-auto bg-surface border border-border rounded-xl p-6 text-left shadow-sm relative group mt-4">
                  <div className="absolute top-4 right-4">
                    <button 
                      onClick={handleCopy}
                      className="p-2 bg-background border border-border rounded-md text-textMuted hover:text-primary hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                      title="Copy text"
                    >
                      {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-3 text-textMuted border-b border-border pb-3">
                    <MessageSquareText size={18} />
                    <span className="font-semibold text-sm">Received Text</span>
                  </div>
                  <div className="bg-background border border-border rounded-lg p-4 mt-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                    <p className="text-textMain whitespace-pre-wrap break-words font-mono text-sm leading-relaxed select-text">
                      {incomingText}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                webrtcEngine.disconnect();
                reset();
              }}
              className="px-6 py-3 border border-border bg-surface text-textMain rounded-xl font-bold hover:bg-surfaceHover transition-colors flex items-center gap-2"
            >
              <Home size={18} /> Return Home
            </button>
            
            <a
              href={`https://wa.me/?text=${encodeURIComponent("Bhai, maine JaldiBhejo use karke tujhe files bheji hain. Fast hai aur bina signup ke kaam karta hai. Try kar: https://jaldibhejo.vercel.app")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#25D366] text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-[#25D366]/20"
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.136 1.36.117 1.871.04.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              Tell Friend
            </a>

            {role === "sender" && (
              <button
                onClick={() => setShowSendText(true)}
                className="px-6 py-3 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/90 transition-colors flex items-center gap-2"
              >
                <Plus size={18} /> Send More Text
              </button>
            )}
            {role === "sender" && (
               <button
                 onClick={openFileDialog}
                 className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
               >
                 <UploadCloud size={18} /> Send More Files
               </button>
            )}
          </div>
        </div>
      )}

      {showSendText && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-textMain mb-4">Send Text</h3>
            <textarea 
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Type or paste text to send..."
              className="w-full min-h-[150px] bg-surface border border-border rounded-xl p-4 text-textMain placeholder-textMuted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none transition-colors"
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => {
                  setShowSendText(false);
                  setNewText("");
                }}
                className="px-5 py-2.5 rounded-xl font-semibold text-textMuted hover:text-textMain hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendNewText}
                disabled={newText.trim().length === 0}
                className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <MessageSquareText size={18} /> Send Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
