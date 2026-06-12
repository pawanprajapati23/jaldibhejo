"use client";

import { useState, useRef, useEffect } from "react";
import { Download, Film, Loader2 } from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { WorkspaceShell, FileInput, ToolButton, SecondaryButton, formatBytes, basename } from "./ToolShared";

export function VideoCompressorTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [output, setOutput] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    ffmpegRef.current = new FFmpeg();
    load();
  }, []);

  const load = async () => {
    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      const ffmpeg = ffmpegRef.current!;
      
      ffmpeg.on('progress', ({ progress }) => {
        setProgress(Math.round(progress * 100));
      });

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setIsLoaded(true);
    } catch (err) {
      console.error("FFmpeg load error", err);
      // Fallback or error state
    }
  };

  const compress = async () => {
    const file = files[0];
    if (!file || !isLoaded) return;
    setBusy(true);
    setError("");
    setProgress(0);
    setOutput(null);

    try {
      const ffmpeg = ffmpegRef.current!;
      await ffmpeg.writeFile(file.name, await fetchFile(file));
      
      // Compress command: convert to mp4, scale down to 720p max, use fast preset
      await ffmpeg.exec([
        '-i', file.name,
        '-vcodec', 'libx264',
        '-crf', '28', // Higher CRF = smaller file, lower quality
        '-preset', 'fast',
        '-vf', 'scale=-2:720', // Scale to 720p height, keep aspect ratio
        'output.mp4'
      ]);

      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([new Uint8Array(data as any)], { type: 'video/mp4' });
      setOutput(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video compression failed.");
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!output) return;
    const url = URL.createObjectURL(output);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${basename(files[0]?.name || 'video')}-compressed.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <WorkspaceShell title="Video Compressor" description="Compress video files locally in your browser. No files are uploaded.">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <FileInput accept="video/*" label="Choose Video" files={files} onChange={(nextFiles) => setFiles(nextFiles.slice(0, 1))} />
        
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-sm text-textMuted mb-4">
            This tool uses WebAssembly to compress videos directly on your device. Large files may take some time depending on your CPU.
          </p>
          
          {busy && (
            <div className="mb-4 bg-surface rounded-lg h-2 overflow-hidden border border-border">
              <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}
          
          <div className="flex flex-wrap gap-3">
            <ToolButton onClick={compress} disabled={!files[0] || busy || !isLoaded}>
              {busy ? <Loader2 size={17} className="animate-spin" /> : <Film size={17} />}
              {busy ? `Compressing ${progress}%` : (isLoaded ? "Compress Video" : "Loading Engine...")}
            </ToolButton>
            
            <SecondaryButton onClick={download} disabled={!output}>
              <Download size={17} />
              Download MP4
            </SecondaryButton>
          </div>

          {output && (
            <p className="mt-4 text-sm text-textMuted">
              Original: {formatBytes(files[0].size)} <br/> 
              Compressed: {formatBytes(output.size)}
            </p>
          )}

          {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        </div>
      </div>
    </WorkspaceShell>
  );
}
