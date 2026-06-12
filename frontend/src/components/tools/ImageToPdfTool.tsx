"use client";

import { useState } from "react";
import { FileText, X } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { WorkspaceShell, FileInput, ToolButton, SecondaryButton, downloadBlob, pdfBytesToBlob, readAsArrayBuffer } from "./ToolShared";

export default function ImageToPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const createPdf = async () => {
    if (files.length === 0) return;
    setBusy(true);
    setError("");
    try {
      const pdf = await PDFDocument.create();
      for (const file of files) {
        const bytes = await readAsArrayBuffer(file);
        const embedded = file.type === "image/png" ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
        const page = pdf.addPage([embedded.width, embedded.height]);
        page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
      }
      const output = await pdf.save();
      downloadBlob("jaldibhejo-images.pdf", pdfBytesToBlob(output));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <WorkspaceShell title="Image to PDF" description="Combine JPG and PNG images into a PDF document in your browser.">
      <FileInput accept="image/jpeg,image/png" multiple label="Choose Images" files={files} onChange={setFiles} />
      <div className="mt-4 flex flex-wrap gap-3">
        <ToolButton onClick={createPdf} disabled={files.length === 0 || busy}>
          <FileText size={17} />
          {busy ? "Creating" : "Create PDF"}
        </ToolButton>
        {files.length > 0 && (
          <SecondaryButton onClick={() => setFiles([])}>
            <X size={17} />
            Clear
          </SecondaryButton>
        )}
      </div>
      {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
    </WorkspaceShell>
  );
}
