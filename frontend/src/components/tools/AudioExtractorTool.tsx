"use client";

import { useState, useRef, useEffect } from "react";
import { Download, Music, Loader2 } from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { WorkspaceShell, FileInput, ToolButton, SecondaryButton, formatBytes, basename } from "./ToolShared";

export function AudioExtractorTool() {
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
    }
  };

  const extract = async () => {
    const file = files[0];
    if (!file || !isLoaded) return;
    setBusy(true);
    setError("");
    setProgress(0);
    setOutput(null);

    try {
      const ffmpeg = ffmpegRef.current!;
      await ffmpeg.writeFile(file.name, await fetchFile(file));
      
      // Extract audio to MP3, 192kbps
      await ffmpeg.exec([
        '-i', file.name,
        '-q:a', '0',
        '-map', 'a',
        'output.mp3'
      ]);

      const data = await ffmpeg.readFile('output.mp3');
      const blob = new Blob([new Uint8Array(data as any)], { type: 'audio/mpeg' });
      setOutput(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audio extraction failed.");
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!output) return;
    const url = URL.createObjectURL(output);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${basename(files[0]?.name || 'video')}-audio.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <WorkspaceShell title="Audio Extractor" description="Extract MP3 audio from any video file locally in your browser.">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <FileInput accept="video/*" label="Choose Video" files={files} onChange={(nextFiles) => setFiles(nextFiles.slice(0, 1))} />
        
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-sm text-textMuted mb-4">
            This tool uses WebAssembly to extract audio directly on your device. High quality MP3 format is generated.
          </p>
          
          {busy && (
            <div className="mb-4 bg-surface rounded-lg h-2 overflow-hidden border border-border">
              <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}
          
          <div className="flex flex-wrap gap-3">
            <ToolButton onClick={extract} disabled={!files[0] || busy || !isLoaded}>
              {busy ? <Loader2 size={17} className="animate-spin" /> : <Music size={17} />}
              {busy ? `Extracting ${progress}%` : (isLoaded ? "Extract Audio" : "Loading Engine...")}
            </ToolButton>
            
            <SecondaryButton onClick={download} disabled={!output}>
              <Download size={17} />
              Download MP3
            </SecondaryButton>
          </div>

          {output && (
            <p className="mt-4 text-sm text-textMuted">
              Generated MP3 Size: {formatBytes(output.size)}
            </p>
          )}

          {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        </div>
      </div>
    </WorkspaceShell>
  );
}
