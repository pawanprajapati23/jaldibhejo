"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { WorkspaceShell, FileInput, ToolButton, extractPdfText, downloadBlob, basename } from "./ToolShared";

export default function PdfToWordTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const createDoc = async () => {
    const file = files[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const pages = await extractPdfText(file);
      const body = pages
        .map((pageText, index) => `<h2>Page ${index + 1}</h2><p>${pageText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") || " "}</p>`)
        .join("");
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>${file.name}</title></head><body>${body}</body></html>`;
      downloadBlob(`${basename(file.name)}.doc`, new Blob([html], { type: "application/msword" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to extract PDF text.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <WorkspaceShell title="PDF to Word" description="Extract readable PDF text and download it as a Word-compatible document.">
      <FileInput accept="application/pdf" label="Choose PDF" files={files} onChange={(nextFiles) => setFiles(nextFiles.slice(0, 1))} />
      <div className="mt-4 flex flex-wrap gap-3">
        <ToolButton onClick={createDoc} disabled={!files[0] || busy}>
          <FileText size={17} />
          {busy ? "Extracting" : "Create Word File"}
        </ToolButton>
      </div>
      {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
    </WorkspaceShell>
  );
}
