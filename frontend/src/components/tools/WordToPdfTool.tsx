"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { WorkspaceShell, FileInput, ToolButton, loadMammoth, readAsArrayBuffer, textToPdfBlob, downloadBlob, basename } from "./ToolShared";

export default function WordToPdfTool() {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileName, setFileName] = useState("document");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadFile = async (nextFiles: File[]) => {
    const file = nextFiles[0];
    if (!file) return;
    setFiles(nextFiles.slice(0, 1));
    setFileName(basename(file.name));
    setError("");
    try {
      if (file.name.toLowerCase().endsWith(".docx")) {
        const mammoth = await loadMammoth();
        const result = await mammoth.extractRawText({ arrayBuffer: await readAsArrayBuffer(file) });
        setText(result.value);
      } else {
        setText(await file.text());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to read this document. DOCX and text files are supported.");
    }
  };

  const createPdf = async () => {
    setBusy(true);
    setError("");
    try {
      downloadBlob(`${fileName || "document"}.pdf`, await textToPdfBlob(text));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <WorkspaceShell title="Word to PDF" description="Load a DOCX or text document, review the extracted text, and export it as a PDF.">
      <FileInput accept=".txt,.docx,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document" label="Choose Document" files={files} onChange={(nextFiles) => void loadFile(nextFiles)} />
      <textarea value={text} onChange={(event) => setText(event.target.value)} className="mt-4 min-h-[260px] w-full rounded-xl border border-border bg-background p-4 text-sm leading-6 text-textMain outline-none focus:border-primary" placeholder="Paste document text here..." />
      <div className="mt-4 flex flex-wrap gap-3">
        <ToolButton onClick={createPdf} disabled={!text.trim() || busy}>
          <FileText size={17} />
          {busy ? "Creating" : "Create PDF"}
        </ToolButton>
      </div>
      {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
    </WorkspaceShell>
  );
}
