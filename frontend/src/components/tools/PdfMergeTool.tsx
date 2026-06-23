"use client";
import { useState } from "react";
import { FileText, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { WorkspaceShell, FileInput, ToolButton, pdfBytesToBlob, readAsArrayBuffer, downloadBlob } from "./ToolShared";

export default function PdfMergeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const nextFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < files.length) {
      const temp = nextFiles[index];
      nextFiles[index] = nextFiles[targetIndex];
      nextFiles[targetIndex] = temp;
      setFiles(nextFiles);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

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
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <FileInput accept="application/pdf" multiple label="Choose PDFs" files={files} onChange={setFiles} />
          
          <div className="mt-5 flex flex-wrap gap-3">
            <ToolButton onClick={merge} disabled={files.length < 2 || busy}>
              <FileText size={17} />
              {busy ? "Merging" : "Merge PDFs"}
            </ToolButton>
          </div>
          {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        </div>

        {/* Files Queue */}
        <div>
          {files.length > 0 ? (
            <div className="rounded-xl border border-border bg-background p-5">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/80">
                <h4 className="text-sm font-bold text-textMain flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  Files Queue ({files.length})
                </h4>
                <button 
                  onClick={() => setFiles([])}
                  className="text-xs text-red-500 hover:text-red-600 transition-colors font-bold"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-surface/50 border border-border rounded-lg p-3 hover:border-indigo-500/30 transition-all duration-200">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-indigo-500/10 text-indigo-500 text-xs font-black font-mono">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="block text-xs font-semibold text-textMain truncate max-w-[160px] sm:max-w-[200px]" title={file.name}>
                          {file.name}
                        </span>
                        <span className="block text-[10px] text-textMuted font-mono">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={() => moveFile(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 hover:bg-surface border border-transparent hover:border-border rounded disabled:opacity-30 transition-colors text-textMuted hover:text-textMain"
                        title="Move Up"
                      >
                        <ChevronUp size={15} />
                      </button>
                      <button
                        onClick={() => moveFile(idx, 'down')}
                        disabled={idx === files.length - 1}
                        className="p-1.5 hover:bg-surface border border-transparent hover:border-border rounded disabled:opacity-30 transition-colors text-textMuted hover:text-textMain"
                        title="Move Down"
                      >
                        <ChevronDown size={15} />
                      </button>
                      <button
                        onClick={() => removeFile(idx)}
                        className="p-1.5 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-textMuted hover:text-red-500 rounded transition-colors"
                        title="Remove File"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[160px] rounded-xl border border-dashed border-border/80 flex flex-col items-center justify-center p-6 text-center text-textMuted bg-surface/10">
              <FileText size={32} className="text-border mb-2 opacity-50" />
              <p className="text-xs">No files selected yet</p>
              <p className="text-[10px] mt-1 max-w-[180px]">Select at least 2 PDFs to start merging them</p>
            </div>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}
