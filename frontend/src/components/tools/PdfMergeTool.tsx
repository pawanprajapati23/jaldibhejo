"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { WorkspaceShell, FileInput, ToolButton, pdfBytesToBlob, readAsArrayBuffer, downloadBlob } from "./ToolShared";

export default function PdfMergeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const merge = async () => {
    setBusy(true);
    setError("");
    try {
      const merged = await PDFDocument.create();
      for (const file of files) {
        const source = await PDFDocument.load(await readAsArrayBuffer(file));
        const copiedPages = await merged.copyPages(source, source.getPageIndices());
        copiedPages.forEach((page) => merged.addPage(page));
      }
      const bytes = await merged.save();
      downloadBlob("jaldibhejo-merged.pdf", pdfBytesToBlob(bytes));
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF merge failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <WorkspaceShell title="Merge PDF" description="Combine multiple PDF files into one PDF locally in your browser.">
      <FileInput accept="application/pdf" multiple label="Choose PDFs" files={files} onChange={setFiles} />
      <div className="mt-4 flex flex-wrap gap-3">
        <ToolButton onClick={merge} disabled={files.length < 2 || busy}>
          <FileText size={17} />
          {busy ? "Merging" : "Merge PDFs"}
        </ToolButton>
      </div>
      {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
    </WorkspaceShell>
  );
}
