"use client";

import { useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { WorkspaceShell, FileInput, ToolButton, SecondaryButton, pdfBytesToBlob, readAsArrayBuffer, downloadBlob, formatBytes, basename } from "./ToolShared";

export default function PdfCompressTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; original: number } | null>(null);
  const [error, setError] = useState("");

  const compress = async () => {
    const file = files[0];
    if (!file) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const source = await PDFDocument.load(await readAsArrayBuffer(file));
      const optimized = await PDFDocument.create();
      const copiedPages = await optimized.copyPages(source, source.getPageIndices());
      copiedPages.forEach((page) => optimized.addPage(page));
      const bytes = await optimized.save({ useObjectStreams: true });
      setResult({ blob: pdfBytesToBlob(bytes), original: file.size });
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF compression failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <WorkspaceShell title="Compress PDF" description="Optimize PDF object streams and rebuild the document for a smaller downloadable file when possible.">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <FileInput accept="application/pdf" label="Choose PDF" files={files} onChange={(nextFiles) => setFiles(nextFiles.slice(0, 1))} />
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="flex flex-wrap gap-3">
            <ToolButton onClick={compress} disabled={!files[0] || busy}>
              <RefreshCw size={17} />
              {busy ? "Optimizing" : "Compress PDF"}
            </ToolButton>
            <SecondaryButton onClick={() => result && downloadBlob(`${basename(files[0]?.name ?? "document")}-compressed.pdf`, result.blob)} disabled={!result}>
              <Download size={17} />
              Download
            </SecondaryButton>
          </div>
          {result && (
            <p className="mt-4 text-sm text-textMuted">
              Original {formatBytes(result.original)}; optimized {formatBytes(result.blob.size)}.
            </p>
          )}
          {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        </div>
      </div>
    </WorkspaceShell>
  );
}
