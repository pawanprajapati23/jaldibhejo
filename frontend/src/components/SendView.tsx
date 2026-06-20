import { useTransferStore } from "@/store/useTransferStore";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { webrtcEngine } from "@/lib/WebRTCEngine";
import { UploadCloud, MessageSquareText, MonitorUp } from "lucide-react";

export function SendView() {
  const { setFiles, setTextPayload } = useTransferStore();
  const [tab, setTab] = useState<'file' | 'text' | 'screen'>('file');
  const [text, setText] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles(acceptedFiles);
      webrtcEngine.connect();
      webrtcEngine.createRoom();
    }
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSendText = () => {
    if (text.trim().length > 0) {
      setTextPayload(text.trim());
      webrtcEngine.connect();
      webrtcEngine.createRoom();
    }
  };

  const handleShareScreen = async () => {
    try {
      // Add constraints to optimize for lower latency and smoother streaming over mobile networks/TURN relays
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 30 }
        },
        audio: true
      });

      let micStream: MediaStream | null = null;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (micErr) {
        console.warn("Microphone access denied or unavailable", micErr);
      }

      const combinedTracks = [...displayStream.getVideoTracks()];
      if (micStream) {
        combinedTracks.push(...micStream.getAudioTracks());
      }

      const combinedStream = new MediaStream(combinedTracks);
      useTransferStore.getState().setLocalStream(combinedStream);
      webrtcEngine.connect();
      webrtcEngine.createRoom();
      
      displayStream.getVideoTracks()[0].onended = () => {
        if (micStream) micStream.getTracks().forEach(t => t.stop());
        webrtcEngine.disconnect();
        useTransferStore.getState().reset();
      };
    } catch (err) {
      console.error("Error sharing screen:", err);
    }
  };
  return (
    <div className="glass-panel w-full p-8 md:p-10 text-center flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden transition-all duration-300">
      
      {/* Tabs */}
      <div className="flex bg-background/50 backdrop-blur-md rounded-xl p-1 mb-8 border border-border shadow-inner">
        <button 
          onClick={() => setTab('file')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
            tab === 'file' 
              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md' 
              : 'text-textMuted hover:text-textMain'
          }`}
        >
          <UploadCloud size={16} /> Files
        </button>
        <button 
          onClick={() => setTab('text')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
            tab === 'text' 
              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md' 
              : 'text-textMuted hover:text-textMain'
          }`}
        >
          <MessageSquareText size={16} /> Text
        </button>
        <button 
          onClick={() => setTab('screen')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
            tab === 'screen' 
              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md' 
              : 'text-textMuted hover:text-textMain'
          }`}
        >
          <MonitorUp size={16} /> Screen
        </button>
      </div>

      {tab === 'file' && (
        <div 
          {...getRootProps()} 
          className={`w-full h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 p-10 select-none ${
            isDragActive 
              ? "border-indigo-500 bg-indigo-500/5 scale-[1.01]" 
              : "border-border hover:border-indigo-500/50 hover:bg-surfaceHover/50"
          }`}
        >
          <input {...getInputProps()} />
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 shadow-md ${
            isDragActive ? "bg-indigo-500 text-white scale-110" : "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
          }`}>
            <UploadCloud size={30} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-textMain">
            {isDragActive ? <span className="text-primary">Drop files here</span> : "Drag & drop files"}
          </h3>
          <p className="text-textMuted mb-6 text-xs md:text-sm">Multiple files will be zipped automatically</p>
          <button className="px-6 py-2.5 text-sm btn-primary font-bold rounded-xl shadow-lg shadow-indigo-500/10">
            Select Files
          </button>
        </div>
      )}
      
      {tab === 'text' && (
        <div className="w-full h-full flex flex-col items-center animate-in fade-in duration-300">
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste a link, note, message, or code snippet..."
            className="w-full flex-1 min-h-[220px] bg-background/50 border border-border rounded-2xl p-4 text-textMain placeholder-textMuted/40 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all text-sm font-medium custom-scrollbar"
          />
          <button 
            onClick={handleSendText}
            disabled={text.trim().length === 0}
            className="mt-6 w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95 shadow-lg shadow-indigo-500/10 transition-all hover:scale-[1.01] active:scale-95 duration-200 text-sm"
          >
            Send Text
          </button>
        </div>
      )}

      {tab === 'screen' && (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center mb-6 shadow-sm">
            <MonitorUp size={30} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-textMain">Share Your Screen</h3>
          <p className="text-textMuted mb-6 text-xs md:text-sm max-w-sm leading-relaxed">
            Mirror your desktop screen, browser tabs, or specific application windows directly with the receiver in real-time.
          </p>
          <button 
            onClick={handleShareScreen}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/10 hover:opacity-95 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-sm duration-200"
          >
            <MonitorUp size={18} />
            Start Screen Share
          </button>
        </div>
      )}
    </div>
  );
}
