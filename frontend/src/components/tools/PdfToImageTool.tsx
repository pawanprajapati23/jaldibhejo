"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { WorkspaceShell, FileInput, ToolButton, loadPdfJs, readAsArrayBuffer, canvasToBlob, downloadBlob, basename } from "./ToolShared";

export default function PdfToImageTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const exportImage = async () => {
    const file = files[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const pdfjs = await loadPdfJs();
      const pdf = await pdfjs.getDocument({ data: new Uint8Array(await readAsArrayBuffer(file)) }).promise;
      const safePage = Math.min(Math.max(1, pageNumber), pdf.numPages);
      const page = await pdf.getPage(safePage);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is not supported in this browser.");
      await page.render({ canvas, canvasContext: context, viewport }).promise;
      downloadBlob(`${basename(file.name)}-page-${safePage}.png`, await canvasToBlob(canvas, "image/png"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to render PDF page.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <WorkspaceShell title="PDF to Image" description="Render a selected PDF page as a PNG image in your browser.">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <FileInput accept="application/pdf" label="Choose PDF" files={files} onChange={(nextFiles) => setFiles(nextFiles.slice(0, 1))} />
        <div className="rounded-xl border border-border bg-background p-4">
          <label className="text-sm font-semibold text-textMain">
            Page number
            <input type="number" min="1" value={pageNumber} onChange={(event) => setPageNumber(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-border bg-surface p-3 outline-none focus:border-primary" />
          </label>
          <div className="mt-5">
            <ToolButton onClick={exportImage} disabled={!files[0] || busy}>
              <ImageIcon size={17} />
              {busy ? "Rendering" : "Export PNG"}
            </ToolButton>
          </div>
        </div>
      </div>
      {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
    </WorkspaceShell>
  );
}
