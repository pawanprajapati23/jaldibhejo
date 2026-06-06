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
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      useTransferStore.getState().setLocalStream(stream);
      webrtcEngine.connect();
      webrtcEngine.createRoom();
      
      stream.getVideoTracks()[0].onended = () => {
        webrtcEngine.disconnect();
        useTransferStore.getState().reset();
      };
    } catch (err) {
      console.error("Error sharing screen:", err);
    }
  };

  return (
    <div className="glass-panel w-full p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[450px]">
      
      {/* Tabs */}
      <div className="flex bg-surface rounded-lg p-1 mb-8 border border-border">
        <button 
          onClick={() => setTab('file')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${tab === 'file' ? 'bg-primary text-white' : 'text-textMuted hover:text-white'}`}
        >
          <UploadCloud size={16} /> Files
        </button>
        <button 
          onClick={() => setTab('text')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${tab === 'text' ? 'bg-primary text-white' : 'text-textMuted hover:text-white'}`}
        >
          <MessageSquareText size={16} /> Text
        </button>
        <button 
          onClick={() => setTab('screen')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${tab === 'screen' ? 'bg-primary text-white' : 'text-textMuted hover:text-white'}`}
        >
          <MonitorUp size={16} /> Screen
        </button>
      </div>

      {tab === 'file' && (
        <div 
          {...getRootProps()} 
          className={`w-full h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors p-10 ${
            isDragActive 
              ? "border-primary bg-primary/10" 
              : "border-border hover:border-primary/50 hover:bg-surfaceHover"
          }`}
        >
          <input {...getInputProps()} />
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors ${isDragActive ? "bg-primary/20 text-primary" : "bg-surface border border-border text-textMuted"}`}>
            <UploadCloud size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-textMain">
            {isDragActive ? <span className="text-primary">Drop to send</span> : "Drag & drop files"}
          </h3>
          <p className="text-textMuted mb-8 text-sm">Multiple files will be zipped automatically</p>
          <button className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors">
            Select Files
          </button>
        </div>
      )}
      
      {tab === 'text' && (
        <div className="w-full h-full flex flex-col items-center">
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste a link, message, or code snippet..."
            className="w-full flex-1 min-h-[200px] bg-surface border border-border rounded-xl p-4 text-textMain placeholder-textMuted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none transition-colors"
          />
          <button 
            onClick={handleSendText}
            disabled={text.trim().length === 0}
            className="mt-6 w-full py-3 bg-primary text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-primary/90"
          >
            Send Text
          </button>
        </div>
      )}

      {tab === 'screen' && (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl">
          <div className="w-16 h-16 rounded-full bg-surface border border-border text-textMuted flex items-center justify-center mb-6">
            <MonitorUp size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-textMain">Share your screen</h3>
          <p className="text-textMuted mb-8 text-sm max-w-sm">Stream your entire screen, a specific window, or a browser tab directly to the receiver in real-time.</p>
          <button 
            onClick={handleShareScreen}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <MonitorUp size={20} />
            Start Sharing
          </button>
        </div>
      )}
    </div>
  );
}
