"use client";

import { useState } from "react";
import { Download, Wand2 } from "lucide-react";
import { WorkspaceShell, FileInput, ToolButton, SecondaryButton, downloadBlob, formatBytes, basename, imageFileToCanvas, canvasToBlob } from "./ToolShared";

export default function BackgroundRemoverTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [tolerance, setTolerance] = useState(34);
  const [output, setOutput] = useState<Blob | null>(null);
  const [error, setError] = useState("");

  const removeBackground = async () => {
    const file = files[0];
    if (!file) return;
    setError("");
    try {
      const { canvas } = await imageFileToCanvas(file);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is not supported in this browser.");
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const samples = [
        [0, 0],
        [canvas.width - 1, 0],
        [0, canvas.height - 1],
        [canvas.width - 1, canvas.height - 1],
      ];
      const colors = samples.map(([x, y]) => {
        const index = (y * canvas.width + x) * 4;
        return [data[index], data[index + 1], data[index + 2]];
      });
      for (let index = 0; index < data.length; index += 4) {
        const isBackground = colors.some(([r, g, b]) => Math.abs(data[index] - r) + Math.abs(data[index + 1] - g) + Math.abs(data[index + 2] - b) <= tolerance * 3);
        if (isBackground) data[index + 3] = 0;
      }
      context.putImageData(imageData, 0, 0);
      setOutput(await canvasToBlob(canvas, "image/png"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Background removal failed.");
    }
  };

  return (
    <WorkspaceShell title="Background Remover" description="Remove a solid or near-solid background by sampling the image corners and exporting a transparent PNG.">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <FileInput accept="image/jpeg,image/png,image/webp" label="Choose Image" files={files} onChange={(nextFiles) => setFiles(nextFiles.slice(0, 1))} />
        <div className="rounded-xl border border-border bg-background p-4">
          <label className="mb-3 flex items-center justify-between text-sm font-semibold text-textMain">
            <span>Tolerance</span>
            <span className="text-accent">{tolerance}</span>
          </label>
          <input type="range" min="8" max="90" value={tolerance} onChange={(event) => setTolerance(Number(event.target.value))} className="w-full accent-primary" />
          <div className="mt-5 flex flex-wrap gap-3">
            <ToolButton onClick={removeBackground} disabled={!files[0]}>
              <Wand2 size={17} />
              Remove
            </ToolButton>
            <SecondaryButton onClick={() => output && downloadBlob(`${basename(files[0]?.name ?? "image")}-transparent.png`, output)} disabled={!output}>
              <Download size={17} />
              Download PNG
            </SecondaryButton>
          </div>
          {output && <p className="mt-4 text-sm text-textMuted">Transparent PNG ready: {formatBytes(output.size)}</p>}
          {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        </div>
      </div>
    </WorkspaceShell>
  );
}
