"use client";

import { useState } from "react";
import { Download, Wand2 } from "lucide-react";
import { WorkspaceShell, FileInput, ToolButton, SecondaryButton, downloadBlob, formatBytes, basename, imageFileToCanvas, canvasToBlob } from "./ToolShared";

export default function ImageFormatTool({ mode }: { mode: "jpg-to-png" | "png-to-jpg" | "webp-converter" }) {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(0.86);
  const [output, setOutput] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const config = {
    "jpg-to-png": {
      title: "JPG to PNG",
      description: "Convert a JPG image into a PNG file locally in your browser.",
      accept: "image/jpeg",
      type: "image/png",
      ext: "png",
      fill: "#ffffff",
    },
    "png-to-jpg": {
      title: "PNG to JPG",
      description: "Convert PNG images into smaller JPG files with a white background.",
      accept: "image/png",
      type: "image/jpeg",
      ext: "jpg",
      fill: "#ffffff",
    },
    "webp-converter": {
      title: "WebP Converter",
      description: "Convert JPG or PNG images into WebP for smaller web assets.",
      accept: "image/jpeg,image/png",
      type: "image/webp",
      ext: "webp",
      fill: "#ffffff",
    },
  }[mode];

  const convert = async () => {
    const file = files[0];
    if (!file) return;
    setBusy(true);
    setError("");
    setOutput(null);
    try {
      const { canvas } = await imageFileToCanvas(file, undefined, undefined, config.fill);
      setOutput(await canvasToBlob(canvas, config.type, quality));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <WorkspaceShell title={config.title} description={config.description}>
      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <FileInput accept={config.accept} label="Choose Image" files={files} onChange={(nextFiles) => setFiles(nextFiles.slice(0, 1))} />
        <div className="rounded-xl border border-border bg-background p-4">
          <label className="mb-3 flex items-center justify-between text-sm font-semibold text-textMain">
            <span>Output quality</span>
            <span className="text-accent">{Math.round(quality * 100)}%</span>
          </label>
          <input type="range" min="0.45" max="0.98" step="0.01" value={quality} onChange={(event) => setQuality(Number(event.target.value))} className="w-full accent-primary" />
          <div className="mt-5 flex flex-wrap gap-3">
            <ToolButton onClick={convert} disabled={!files[0] || busy}>
              <Wand2 size={17} />
              {busy ? "Converting" : "Convert"}
            </ToolButton>
            <SecondaryButton onClick={() => output && downloadBlob(`${basename(files[0]?.name ?? "image")}.${config.ext}`, output)} disabled={!output}>
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
