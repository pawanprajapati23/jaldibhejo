"use client";

import { useState } from "react";
import { Download, ImageIcon, Settings2, Image as ImageIconSVG } from "lucide-react";
import { WorkspaceShell, FileInput, ToolButton, SecondaryButton, downloadBlob, formatBytes, basename, loadImageFromFile, imageFileToCanvas, canvasToBlob } from "./ToolShared";

export function ImageResizerTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [lockRatio, setLockRatio] = useState(true);
  const [output, setOutput] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const [quality, setQuality] = useState(90);

  const loadDimensions = async (nextFiles: File[]) => {
    setFiles(nextFiles.slice(0, 1));
    setOutput(null);
    setError("");
    const file = nextFiles[0];
    if (!file) return;
    try {
      const image = await loadImageFromFile(file);
      setWidth(image.naturalWidth);
      setHeight(image.naturalHeight);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to read image.");
    }
  };

  const updateWidth = (nextWidth: number) => {
    if (!Number.isFinite(nextWidth) || nextWidth < 1) return;
    if (lockRatio && files[0]) {
      void loadImageFromFile(files[0]).then((image) => setHeight(Math.round((nextWidth * image.naturalHeight) / image.naturalWidth)));
    }
    setWidth(nextWidth);
  };
  
  const updateHeight = (nextHeight: number) => {
    if (!Number.isFinite(nextHeight) || nextHeight < 1) return;
    if (lockRatio && files[0]) {
      void loadImageFromFile(files[0]).then((image) => setWidth(Math.round((nextHeight * image.naturalWidth) / image.naturalHeight)));
    }
    setHeight(nextHeight);
  };

  const resize = async () => {
    const file = files[0];
    if (!file) return;
    setError("");
    try {
      const { canvas } = await imageFileToCanvas(file, width, height, file.type === "image/png" ? "transparent" : "#ffffff");
      setOutput(await canvasToBlob(canvas, file.type === "image/png" ? "image/png" : "image/jpeg", quality / 100));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resize failed.");
    }
  };

  return (
    <WorkspaceShell title="Image Resizer" description="Resize an image to exact pixel dimensions with high-quality local browser processing.">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <FileInput accept="image/jpeg,image/png,image/webp" label="Choose Image" files={files} onChange={(nextFiles) => void loadDimensions(nextFiles)} />
          
          {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}
          
          {output && (
            <div className="rounded-xl border border-border bg-surface p-6 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                <ImageIconSVG size={32} />
              </div>
              <h3 className="text-xl font-bold text-textMain mb-2">Image Resized Successfully</h3>
              <div className="flex gap-4 text-sm text-textMuted mb-6 bg-background border border-border px-4 py-2 rounded-lg">
                <span>Original: <strong className="text-textMain">{formatBytes(files[0]?.size || 0)}</strong></span>
                <span>New: <strong className="text-primary">{formatBytes(output.size)}</strong></span>
              </div>
              
              <SecondaryButton onClick={() => output && downloadBlob(`${basename(files[0]?.name ?? "image")}-resized.${files[0]?.type === "image/png" ? "png" : "jpg"}`, output)} disabled={!output} className="w-full justify-center">
                <Download size={18} />
                Download Resized Image
              </SecondaryButton>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="text-sm font-bold text-textMain flex items-center gap-2 mb-5">
              <Settings2 size={16} /> Dimensions
            </h3>
            
            <div className="grid gap-4">
              <div>
                <label className="text-xs font-semibold text-textMuted uppercase tracking-wider block mb-2">
                  Width (px)
                </label>
                <input type="number" min="1" value={width} onChange={(event) => updateWidth(Number(event.target.value))} className="w-full rounded-lg border border-border bg-background p-3 text-textMain outline-none focus:border-primary font-mono text-lg transition-colors" />
              </div>
              
              <div className="flex justify-center -my-2 relative z-10">
                <button 
                  onClick={() => setLockRatio(!lockRatio)}
                  className={`p-2 rounded-full border transition-colors ${lockRatio ? 'bg-primary/20 text-primary border-primary/50' : 'bg-background text-textMuted border-border hover:bg-surfaceHover'}`}
                  title={lockRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </button>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-textMuted uppercase tracking-wider block mb-2">
                  Height (px)
                </label>
                <input type="number" min="1" value={height} onChange={(event) => updateHeight(Number(event.target.value))} className="w-full rounded-lg border border-border bg-background p-3 text-textMain outline-none focus:border-primary font-mono text-lg transition-colors" />
              </div>
            </div>
            
            {files[0]?.type !== "image/png" && (
              <div className="mt-6 pt-6 border-t border-border">
                <label className="mb-3 flex items-center justify-between text-xs font-semibold text-textMuted uppercase tracking-wider">
                  <span>Quality</span>
                  <span className="text-textMain font-mono bg-background px-2 py-1 rounded">{quality}%</span>
                </label>
                <input type="range" min="10" max="100" value={quality} onChange={(event) => setQuality(Number(event.target.value))} className="w-full accent-primary" />
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-border">
              <ToolButton onClick={resize} disabled={!files[0]} className="w-full justify-center">
                <ImageIcon size={17} />
                Resize Image
              </ToolButton>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
