"use client";

import { useState } from "react";
import { Download, ImageIcon } from "lucide-react";
import { WorkspaceShell, FileInput, ToolButton, SecondaryButton, downloadBlob, formatBytes, basename, loadImageFromFile, imageFileToCanvas, canvasToBlob } from "./ToolShared";

export default function ImageResizerTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [lockRatio, setLockRatio] = useState(true);
  const [output, setOutput] = useState<Blob | null>(null);
  const [error, setError] = useState("");

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

  const resize = async () => {
    const file = files[0];
    if (!file) return;
    setError("");
    try {
      const { canvas } = await imageFileToCanvas(file, width, height, file.type === "image/png" ? "transparent" : "#ffffff");
      setOutput(await canvasToBlob(canvas, file.type === "image/png" ? "image/png" : "image/jpeg", 0.9));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resize failed.");
    }
  };

  return (
    <WorkspaceShell title="Image Resizer" description="Resize an image to exact pixel dimensions and download the result.">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <FileInput accept="image/jpeg,image/png,image/webp" label="Choose Image" files={files} onChange={(nextFiles) => void loadDimensions(nextFiles)} />
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-textMain">
              Width
              <input type="number" min="1" value={width} onChange={(event) => updateWidth(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-border bg-surface p-3 outline-none focus:border-primary" />
            </label>
            <label className="text-sm font-semibold text-textMain">
              Height
              <input type="number" min="1" value={height} onChange={(event) => setHeight(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-border bg-surface p-3 outline-none focus:border-primary" />
            </label>
          </div>
          <label className="mt-4 flex items-center gap-3 text-sm text-textMuted">
            <input type="checkbox" checked={lockRatio} onChange={(event) => setLockRatio(event.target.checked)} className="h-4 w-4 accent-primary" />
            Keep aspect ratio when changing width
          </label>
          <div className="mt-5 flex flex-wrap gap-3">
            <ToolButton onClick={resize} disabled={!files[0]}>
              <ImageIcon size={17} />
              Resize
            </ToolButton>
            <SecondaryButton onClick={() => output && downloadBlob(`${basename(files[0]?.name ?? "image")}-resized.${files[0]?.type === "image/png" ? "png" : "jpg"}`, output)} disabled={!output}>
              <Download size={17} />
              Download
            </SecondaryButton>
          </div>
          {output && <p className="mt-4 text-sm text-textMuted">Output ready: {formatBytes(output.size)}</p>}
          {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        </div>
      </div>
    </WorkspaceShell>
  );
}
