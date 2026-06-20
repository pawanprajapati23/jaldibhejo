import { useTransferStore } from "@/store/useTransferStore";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, CheckCircle2, AlertCircle, Smartphone, ShieldCheck, Download, Home, Plus, UploadCloud, MessageSquareText, MonitorUp, Maximize, Minimize, Mic, MicOff, Coffee, Link as LinkIcon, Copy } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { webrtcEngine } from "@/lib/WebRTCEngine";
import { useDropzone } from "react-dropzone";
import { startSoundBase64, successSoundBase64 } from "@/lib/sounds";
import { uploadToCloud } from "@/lib/cloudStorage";
import Link from "next/link";
import { toast } from "sonner";


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
    speedHistory,
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
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (connectionState === "transferring" || connectionState === "connected" || files.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [connectionState, files.length]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (latency && latency > 500) {
      toast.warning("Weak Connection Detected. Optimizing chunks...", { id: "weak-conn" });
    } else if (latency && latency < 200) {
      toast.dismiss("weak-conn");
    }
  }, [latency]);

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
    <div {...getRootProps()} className="glass-panel w-full p-8 md:p-10 flex flex-col items-center justify-center min-h-[500px] outline-none relative overflow-hidden transition-all duration-300">
      <input {...getInputProps()} />
      
      {/* 1. Connection Error State */}
      {connectionState === "error" && (
        <div className="text-center w-full max-w-sm animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center mx-auto mb-6 shadow-md">
            <AlertCircle size={28} strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-textMain">Connection Failed</h2>
          <p className="text-red-400 text-xs md:text-sm mb-8 leading-relaxed">{error || "Something went wrong. Let's try again."}</p>
          <button
            onClick={() => {
              webrtcEngine.disconnect();
              reset();
            }}
            className="px-6 py-2.5 bg-surface hover:bg-surfaceHover text-textMain border border-border rounded-xl font-bold transition-all text-xs"
          >
            Return to Home
          </button>
        </div>
      )}

      {/* 2. Sender Waiting State */}
      {connectionState === "waiting" && role === "sender" && (
        <div className="text-center w-full max-w-md animate-in fade-in zoom-in duration-300">
          <h2 className="text-2xl font-bold mb-2 text-textMain">Ready to Share {isScreenMode ? "Screen" : isTextMode ? "Text" : "Files"}</h2>
          <p className="text-textMuted mb-6 text-xs md:text-sm">Scan the QR code or enter the PIN on the receiving device.</p>
          
          {/* QR Code Container */}
          <div className="bg-white p-4 rounded-2xl mb-6 inline-block shadow-lg border border-white/10 ring-4 ring-black/5 dark:ring-white/5">
            <QRCodeSVG value={joinUrl || roomId || ""} size={160} fgColor="#000000" bgColor="transparent" />
          </div>
          
          {/* Large Digital PIN Display */}
          <div className="text-5xl md:text-6xl tracking-[0.25em] font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 mb-6 pl-4 select-all select-none">
            {roomId}
          </div>

          {/* Shareable Link Component */}
          <div className="flex items-center bg-background/50 border border-border rounded-xl p-2 pl-4 mb-6 text-left overflow-hidden shadow-inner">
            <span className="flex-1 text-xs text-textMuted truncate mr-2 font-mono select-all">
              {joinUrl}
            </span>
            <div className="flex items-center gap-1">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Bhai, ye PIN daal kar files receive kar le: ${roomId}. Ya direct is link se connect ho ja: ${joinUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-surface hover:bg-[#25D366]/10 hover:text-[#25D366] rounded-lg transition-colors"
                title="Share on WhatsApp"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.136 1.36.117 1.871.04.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(joinUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-2.5 bg-surface hover:bg-surfaceHover rounded-lg transition-colors text-textMuted"
              >
                {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <div className="flex items-center gap-2 text-textMuted bg-surface/50 border border-border py-2 px-4 rounded-full w-max text-xs font-semibold">
              <Smartphone size={14} />
              <span>Waiting for receiver{dots}</span>
            </div>
            {latency !== null && (
              <div className="flex items-center gap-2 text-textMuted bg-surface/50 border border-border py-2 px-4 rounded-full w-max text-xs font-mono">
                <div className="flex gap-0.5 items-end h-3">
                  <div className={`w-1 h-1.5 rounded-full ${latency < 200 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <div className={`w-1 h-2.5 rounded-full ${latency < 100 ? 'bg-green-500' : latency < 500 ? 'bg-yellow-500' : 'bg-border'}`} />
                  <div className={`w-1 h-3.5 rounded-full ${latency < 50 ? 'bg-green-500' : latency < 300 ? 'bg-yellow-500' : 'bg-border'}`} />
                </div>
                <span>{latency}ms</span>
              </div>
            )}
          </div>

          {/* Cloud Storage Link Fallback Option */}
          {!isScreenMode && !isTextMode && files.length > 0 && files.reduce((acc, f) => acc + f.size, 0) <= 50 * 1024 * 1024 && !cloudLink && (
            <div className="mt-8 pt-6 border-t border-border/80">
              <h3 className="text-base font-bold text-textMain mb-1">Receiver Offline?</h3>
              <p className="text-xs text-textMuted mb-4">Upload and generate an expirable cloud link valid for 10 minutes (Max 50MB).</p>
              
              <button
                onClick={async () => {
                  setIsUploadingToCloud(true);
                  const res = await uploadToCloud(files, setCloudProgress);
                  if (res.link) setCloudLink(res.link);
                  setIsUploadingToCloud(false);
                }}
                disabled={isUploadingToCloud}
                className="w-full px-5 py-3 bg-surface hover:bg-surfaceHover text-textMain border border-border hover:border-indigo-500/50 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-xs"
              >
                {isUploadingToCloud ? <Loader2 size={16} className="animate-spin text-primary" /> : <UploadCloud size={16} className="text-indigo-500" />}
                {isUploadingToCloud ? `Uploading... ${cloudProgress}%` : "Generate Cloud Link"}
              </button>
            </div>
          )}

          {/* Generated Cloud Link Display */}
          {cloudLink && (
            <div className="mt-8 pt-6 border-t border-border/80 animate-in zoom-in duration-300 text-left">
              <h3 className="text-base font-bold text-textMain mb-1">Link Generated!</h3>
              <p className="text-xs text-textMuted mb-4">Anyone with this link can download the files for the next 10 minutes.</p>
              <div className="flex items-center bg-background border border-border rounded-xl p-2 pl-4">
                <span className="flex-1 text-xs text-textMain truncate mr-2 font-mono select-all">
                  {cloudLink}
                </span>
                <div className="flex items-center gap-1">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Bhai, ye link khol kar files download kar le (10 min me expire ho jayega): ${cloudLink}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-surface hover:bg-[#25D366]/10 hover:text-[#25D366] rounded-lg transition-colors"
                    title="Share on WhatsApp"
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.136 1.36.117 1.871.04.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(cloudLink);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-2.5 bg-surface hover:bg-surfaceHover rounded-lg transition-colors text-textMuted"
                  >
                    {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Receiver Waiting State */}
      {connectionState === "waiting" && role === "receiver" && (
        <div className="text-center w-full max-w-sm animate-in fade-in zoom-in duration-300">
          <h2 className="text-2xl font-bold mb-2 text-textMain">Requesting Upload</h2>
          <p className="text-textMuted mb-6 text-xs md:text-sm">Send this link to the uploader so they can push files directly to you.</p>
          
          <div className="bg-white p-4 rounded-2xl mb-6 inline-block shadow-lg border border-white/10 ring-4 ring-black/5 dark:ring-white/5">
            <QRCodeSVG value={requestUrl || roomId || ""} size={160} fgColor="#000000" bgColor="transparent" />
          </div>
          
          <div className="flex items-center bg-background/50 border border-border rounded-xl p-2 pl-4 mb-6 text-left overflow-hidden shadow-inner">
            <span className="flex-1 text-xs text-textMuted truncate mr-2 font-mono select-all">
              {requestUrl}
            </span>
            <div className="flex items-center gap-1">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Bhai, ye link khol kar mujhe files bhej de: ${requestUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-surface hover:bg-[#25D366]/10 hover:text-[#25D366] rounded-lg transition-colors"
                title="Share on WhatsApp"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.136 1.36.117 1.871.04.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(requestUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-2.5 bg-surface hover:bg-surfaceHover rounded-lg transition-colors text-textMuted"
              >
                {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 text-textMuted bg-surface/50 border border-border py-2 px-4 rounded-full w-max text-xs font-semibold">
              <Smartphone size={14} />
              <span>Waiting for sender to connect{dots}</span>
            </div>
            {latency !== null && (
              <div className="flex items-center gap-2 text-textMuted bg-surface/50 border border-border py-2 px-4 rounded-full w-max text-xs font-mono">
                <div className="flex gap-0.5 items-end h-3">
                  <div className={`w-1 h-1.5 rounded-full ${latency < 200 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <div className={`w-1 h-2.5 rounded-full ${latency < 100 ? 'bg-green-500' : latency < 500 ? 'bg-yellow-500' : 'bg-border'}`} />
                  <div className={`w-1 h-3.5 rounded-full ${latency < 50 ? 'bg-green-500' : latency < 300 ? 'bg-yellow-500' : 'bg-border'}`} />
                </div>
                <span>{latency}ms</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Active Connection States (Connecting, Connected, Transferring) */}
      {(connectionState === "connecting" || connectionState === "connected" || connectionState === "transferring") && (
        <div className="text-center w-full max-w-4xl relative animate-in fade-in duration-300">
          
          {/* Reconnecting Overlay */}
          {error && connectionState === "transferring" && (
            <div className="absolute inset-0 z-50 bg-background/70 backdrop-blur-md flex flex-col items-center justify-center rounded-3xl animate-in fade-in duration-350">
               <div className="w-12 h-12 rounded-2xl border-4 border-indigo-500 border-t-transparent animate-spin mb-4" />
               <p className="font-bold text-textMain">Connection Interrupted</p>
               <p className="text-xs text-textMuted mt-1">Attempting to automatically restore signal...</p>
            </div>
          )}

          {/* Pairing Phase */}
          {connectionState === "connecting" && (
            <div className="flex flex-col items-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6 shadow-md">
                <Loader2 size={28} className="animate-spin text-indigo-500" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-bold text-textMain">Establishing Signal{dots}</h2>
              <p className="text-xs text-textMuted mt-2">Performing WebRTC signaling handshake...</p>
            </div>
          )}

          {/* Connected (Ready to pick files) - Sender */}
          {connectionState === "connected" && role === "sender" && files.length === 0 && !textPayload && (
            <div className="flex flex-col items-center py-6 animate-in fade-in zoom-in duration-300 w-full max-w-md mx-auto">
              <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center mb-6 shadow-md">
                <UploadCloud size={36} />
              </div>
              <h2 className="text-2xl font-bold text-textMain mb-2">Securely Connected</h2>
              <p className="text-textMuted text-xs md:text-sm mb-8 px-4 text-center leading-relaxed">
                Uploader and downloader paired successfully. Select files or paste text below to start transferring.
              </p>
              <button 
                onClick={openFileDialog}
                className="px-8 py-3.5 btn-primary font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all text-sm w-full max-w-[240px]"
              >
                Choose Files to Send
              </button>
            </div>
          )}

          {/* Connected (Ready to pick files) - Receiver */}
          {connectionState === "connected" && role === "receiver" && !incomingFile && !incomingText && (
            <div className="flex flex-col items-center py-8 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 shadow-md">
                <ShieldCheck size={28} />
              </div>
              <h2 className="text-2xl font-bold text-textMain mb-2">Securely Connected</h2>
              <p className="text-textMuted text-xs md:text-sm">Paired with sender. Waiting for files to be picked{dots}</p>
            </div>
          )}

          {/* 5. Screen Streaming Section */}
          {isScreenMode ? (
            <div className="flex flex-col items-center w-full mt-4 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-2 mb-4 bg-background/50 border border-border px-4 py-2 rounded-full shadow-inner select-none">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="font-bold text-textMain text-xs uppercase tracking-wider">Live Screen Share</span>
              </div>
              
              <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border shadow-2xl bg-black">
                {localStream && (
                  <div>
                    <VideoPlayer stream={localStream} muted={true} />
                    <p className="text-textMuted my-4 text-xs">You are streaming your display feeds.</p>
                  </div>
                )}
                {remoteStream && (
                  <div>
                    <VideoPlayer stream={remoteStream} />
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {role === 'sender' && (
                  <button 
                    onClick={toggleMute}
                    className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 border ${
                      isMuted 
                        ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white' 
                        : 'bg-surface text-textMain border-border hover:bg-surfaceHover'
                    }`}
                  >
                    {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                    {isMuted ? 'Unmute Mic' : 'Mute Mic'}
                  </button>
                )}
                
                <button 
                  onClick={() => {
                     webrtcEngine.disconnect();
                     reset();
                  }}
                  className="px-6 py-2.5 text-xs bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-500 hover:text-white font-bold rounded-xl transition-all flex items-center gap-2"
                >
                  <MonitorUp size={16} />
                  Disconnect stream
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 6. Active Transfer progress views */}
              {connectionState === "transferring" && (
                <div className="mb-6 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                    <Loader2 size={24} className="animate-spin text-indigo-500" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-xl font-bold text-textMain">Transferring Packet Stream</h2>
                </div>
              )}
              
              {/* File Info Card */}
              {!isTextMode && (fileToDisplay || incomingThumbnail) && connectionState !== "connecting" && connectionState !== "connected" && (
                <div className="flex flex-col items-center w-full mb-6">
                  {(displayImageUrl || incomingThumbnail) && (
                    <div className="mb-5 rounded-2xl overflow-hidden border border-border shadow-md w-36 h-36 flex-shrink-0 bg-background/50 p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={displayImageUrl || incomingThumbnail || ""} alt="Transfer Preview" className="object-cover w-full h-full rounded-xl" />
                    </div>
                  )}
                  <div className="bg-surface/50 border border-border rounded-xl p-4 flex items-center gap-4 w-full max-w-sm mx-auto text-left shadow-sm">
                    {!(displayImageUrl || incomingThumbnail) && (
                      <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center flex-shrink-0 text-textMuted">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate text-textMain">{fileToDisplay?.name || "Incoming Transfer Package..."}</p>
                      <p className="text-[11px] text-textMuted mt-0.5">{fileToDisplay ? (fileToDisplay.size / (1024 * 1024)).toFixed(2) + " MB" : "Calculating size..."}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Text note payload preview during transfer */}
              {isTextMode && connectionState === "transferring" && (
                <div className="bg-surface/50 border border-border rounded-2xl p-5 mb-6 w-full max-w-sm mx-auto text-left shadow-sm animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 mb-3 text-textMuted border-b border-border/80 pb-2.5">
                    <MessageSquareText size={15} />
                    <span className="font-bold text-xs">Text Stream Content</span>
                  </div>
                  <p className="text-textMain whitespace-pre-wrap break-words line-clamp-2 opacity-70 italic font-mono text-[11px]">
                    {textPayload || incomingText}
                  </p>
                </div>
              )}

              {/* Performance Indicator Grid (Speed, Remaining Time, Latency) */}
              {connectionState === "transferring" && (
                <div className="w-full max-w-sm mx-auto mb-6 bg-surface/50 backdrop-blur-md border border-border p-5 rounded-2xl shadow-md text-left">
                   <div className="grid grid-cols-2 gap-4 mb-5 border-b border-border/65 pb-4">
                      <div>
                        <p className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">Transfer Speed</p>
                        <p className="text-lg font-mono font-bold text-indigo-500">{transferSpeed}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">Time Remaining</p>
                        <p className="text-lg font-mono font-bold text-textMain">{timeRemaining || "Calculating..."}</p>
                      </div>
                   </div>
                   
                   {/* Sparkline Graph */}
                   {speedHistory.length > 1 && (
                     <div className="h-8 w-full mb-4 flex items-end justify-between gap-[3px] opacity-80 select-none pointer-events-none">
                       {speedHistory.map((speed, i) => {
                         const maxSpeed = Math.max(...speedHistory, 1);
                         const heightPercent = Math.max((speed / maxSpeed) * 100, 8);
                         return (
                           <div key={i} className="bg-indigo-500/40 w-full rounded-t-sm transition-all duration-300" style={{ height: `${heightPercent}%` }} />
                         );
                       })}
                     </div>
                   )}
                   
                   {/* Neon Progress Bar */}
                   <div className="w-full bg-background border border-border rounded-full h-2.5 mb-3 overflow-hidden shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(99,102,241,0.6)]"
                        style={{ width: `${progress}%` }}
                      />
                   </div>

                   <div className="flex justify-between items-center text-[10px] font-bold text-textMuted">
                      <span>{progress}% Completed</span>
                      {latency !== null && (
                        <span className="flex items-center gap-1.5 font-mono">
                          <div className={`w-1.5 h-1.5 rounded-full ${latency < 100 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          Ping: {latency}ms
                        </span>
                      )}
                   </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 7. Transfer Completed State */}
      {connectionState === "completed" && !isScreenMode && (
        <div className="text-center w-full max-w-md animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 shadow-md animate-bounce">
            <CheckCircle2 size={30} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-bold mb-3 text-textMain tracking-tight">Transfer Completed</h2>

          {/* Support Developer Panel */}
          <div className="mt-8 mb-8 p-5 bg-gradient-to-br from-amber-500/5 to-yellow-500/10 border border-yellow-500/20 rounded-2xl text-left shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center text-black flex-shrink-0 shadow-md">
                <Coffee size={20} fill="currentColor" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-textMain text-sm">Keep JaldiBhejo Free</h4>
                <p className="text-[11px] text-textMuted mt-1 leading-relaxed">If our direct sharing saved you time today, consider donating ₹10 or $1 to keep our signaling infrastructure alive!</p>
              </div>
            </div>
            <Link 
              href="/support" 
              className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold rounded-xl hover:opacity-90 transition-all text-xs shadow-md"
            >
              Support the Project
            </Link>
          </div>

          {role === "sender" ? (
             <p className="text-textMuted text-xs md:text-sm mb-8 leading-relaxed">
               Your {isTextMode ? "text payloads" : "files package"} were successfully transmitted to the peer device.
             </p>
          ) : (
            <>
              {/* File Recipient Details */}
              {!isTextMode && (
                <div className="flex flex-col items-center">
                  {displayImageUrl && (
                    <div className="mb-6 rounded-2xl overflow-hidden border border-border shadow-md w-44 h-44 flex-shrink-0 bg-background/50 p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={displayImageUrl} alt="Downloaded Preview" className="object-cover w-full h-full rounded-xl" />
                    </div>
                  )}
                  {!isFileReadyToSave ? (
                    <div className="mt-2 w-full max-w-sm rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 border-dashed">
                      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-indigo-500/20 text-indigo-500 shadow-sm">
                        <Loader2 className="animate-spin" size={20} />
                      </div>
                      <h3 className="font-bold text-textMain text-sm">Verifying transfer packet integrity{dots}</h3>
                      <p className="mt-1.5 text-xs text-textMuted">
                        Reassembling files and performing MD5 verification checks...
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2 w-full max-w-sm rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-sm">
                      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-background border border-emerald-500/20 text-emerald-500 shadow-sm">
                        <ShieldCheck size={22} />
                      </div>
                      <h3 className="font-bold text-textMain text-sm">File Package Verified</h3>
                      <p className="mt-1.5 text-xs text-textMuted mb-5 leading-relaxed">
                        The downloaded package matches sender checksums. Please check your default browser downloads folder.
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
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-2.5 px-6 rounded-xl hover:opacity-95 shadow-md text-xs transition-all hover:scale-105 active:scale-95 duration-200"
                      >
                        <Download size={15} /> Download Package Again
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Text note recipient display */}
              {isTextMode && (
                <div className="w-full max-w-md mx-auto bg-surface/50 border border-border rounded-2xl p-5 text-left shadow-md relative group mt-4 animate-in zoom-in duration-300">
                  <div className="absolute top-4 right-4">
                    <button 
                      onClick={handleCopy}
                      className="p-2.5 bg-background border border-border rounded-xl text-textMuted hover:text-indigo-500 hover:border-indigo-500/50 transition-colors focus:outline-none shadow-sm"
                      title="Copy text content"
                    >
                      {copied ? <CheckCircle2 size={15} className="text-green-500" /> : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-3 text-textMuted border-b border-border/80 pb-3">
                    <MessageSquareText size={16} />
                    <span className="font-bold text-xs">Received Clipboard Content</span>
                  </div>
                  <div className="bg-background/80 border border-border rounded-xl p-4 mt-3 max-h-[220px] overflow-y-auto custom-scrollbar shadow-inner">
                    <p className="text-textMain whitespace-pre-wrap break-words font-mono text-xs leading-relaxed select-text">
                      {incomingText}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action buttons at completion */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                webrtcEngine.disconnect();
                reset();
              }}
              className="px-6 py-3 border border-border bg-surface text-textMain rounded-xl font-bold hover:bg-surfaceHover transition-all text-xs flex items-center gap-2"
            >
              <Home size={15} /> Return Home
            </button>
            
            <a
              href={`https://wa.me/?text=${encodeURIComponent("Bhai, maine JaldiBhejo use karke tujhe files bheji hain. Fast hai aur bina signup ke kaam karta hai. Try kar: https://jaldibhejo.sizesnap.in")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#25D366] text-white rounded-xl font-bold hover:opacity-95 shadow-md shadow-[#25D366]/10 transition-all text-xs flex items-center gap-2"
            >
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.136 1.36.117 1.871.04.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              Tell Friend
            </a>

            {role === "sender" && (
              <button
                onClick={() => setShowSendText(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-bold hover:opacity-95 shadow-md transition-all text-xs flex items-center gap-2"
              >
                <Plus size={15} /> Send More Text
              </button>
            )}
            {role === "sender" && (
               <button
                 onClick={openFileDialog}
                 className="px-6 py-3 btn-primary text-white rounded-xl font-bold shadow-md transition-all text-xs flex items-center gap-2"
               >
                 <UploadCloud size={15} /> Send More Files
               </button>
            )}
          </div>
        </div>
      )}

      {/* 8. Text Input Popup Overlay */}
      {showSendText && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-textMain mb-3">Send Text Note</h3>
            <textarea 
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Type or paste text content to send..."
              className="w-full min-h-[140px] bg-surface border border-border rounded-xl p-4 text-textMain placeholder-textMuted/45 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all text-sm font-medium custom-scrollbar"
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => {
                  setShowSendText(false);
                  setNewText("");
                }}
                className="px-4 py-2 rounded-xl font-semibold text-textMuted hover:text-textMain hover:bg-surface transition-colors text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendNewText}
                disabled={newText.trim().length === 0}
                className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl disabled:opacity-50 hover:opacity-95 transition-all text-xs flex items-center gap-2"
              >
                <MessageSquareText size={15} /> Send Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
