"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { WorkspaceShell, FileInput, ToolButton, pdfBytesToBlob, readAsArrayBuffer, downloadBlob, parsePageSelection, basename } from "./ToolShared";

export default function PdfSplitTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [selection, setSelection] = useState("1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const split = async () => {
    const file = files[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const source = await PDFDocument.load(await readAsArrayBuffer(file));
      const pages = parsePageSelection(selection, source.getPageCount());
      const zip = new JSZip();
      for (const pageIndex of pages) {
        const output = await PDFDocument.create();
        const [page] = await output.copyPages(source, [pageIndex]);
        output.addPage(page);
        zip.file(`${basename(file.name)}-page-${pageIndex + 1}.pdf`, await output.save());
      }
      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(`${basename(file.name)}-split-pages.zip`, blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF split failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <WorkspaceShell title="Split PDF" description="Extract selected PDF pages and download them as a ZIP of single-page PDFs.">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <FileInput accept="application/pdf" label="Choose PDF" files={files} onChange={(nextFiles) => setFiles(nextFiles.slice(0, 1))} />
        <div className="rounded-xl border border-border bg-background p-4">
          <label className="text-sm font-semibold text-textMain">
            Pages
            <input value={selection} onChange={(event) => setSelection(event.target.value)} placeholder="1, 3-5" className="mt-2 w-full rounded-lg border border-border bg-surface p-3 outline-none focus:border-primary" />
          </label>
          <p className="mt-2 text-xs text-textMuted">Use page numbers or ranges, for example: 1, 3-5, 8.</p>
          <div className="mt-5">
            <ToolButton onClick={split} disabled={!files[0] || busy}>
              <FileText size={17} />
              {busy ? "Splitting" : "Split PDF"}
            </ToolButton>
          </div>
          {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        </div>
      </div>
    </WorkspaceShell>
  );
}
