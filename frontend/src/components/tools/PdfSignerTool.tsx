"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Download, FileSignature, Undo2, X, Check, Search, Loader2 } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { PDFDocument } from "pdf-lib";
import { WorkspaceShell, FileInput, ToolButton, SecondaryButton, formatBytes, basename } from "./ToolShared";

export function PdfSignerTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [output, setOutput] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  
  const [showSignModal, setShowSignModal] = useState(false);
  const sigCanvas = useRef<any>(null);
  
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState(0);

  const generatePreviews = useCallback(async (file: File) => {
    try {
      setBusy(true);
      
      const pdfjsLib = await import("pdfjs-dist");
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      setNumPages(pdf.numPages);
      
      const images = [];
      const page = await pdf.getPage(currentPage + 1);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({ canvasContext: context!, viewport } as any).promise;
      images[currentPage] = canvas.toDataURL("image/png");
      
      setPreviewImages(images);
    } catch (err) {
      console.error(err);
      setError("Failed to generate PDF preview.");
    } finally {
      setBusy(false);
    }
  }, [currentPage]);

  useEffect(() => {
    if (files.length > 0) {
      generatePreviews(files[0]);
    } else {
      setPreviewImages([]);
      setCurrentPage(0);
      setNumPages(0);
      setOutput(null);
    }
  }, [files, generatePreviews]);

  const handleApplySignature = async () => {
    if (sigCanvas.current?.isEmpty()) {
      setError("Please draw a signature first.");
      return;
    }
    
    setBusy(true);
    setError("");
    
    try {
      const sigDataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
      const sigBytes = await fetch(sigDataUrl).then(res => res.arrayBuffer());
      
      const arrayBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const signatureImage = await pdfDoc.embedPng(sigBytes);
      
      const pages = pdfDoc.getPages();
      const targetPage = pages[currentPage];
      
      // Simple logic: Place signature at bottom center of the current page.
      // In a full implementation, you'd add drag-and-drop. For this tool, auto-placement at bottom is a good start.
      const { width, height } = targetPage.getSize();
      const sigDims = signatureImage.scale(0.5); // scale down
      
      targetPage.drawImage(signatureImage, {
        x: width / 2 - sigDims.width / 2,
        y: 50, // 50 units from bottom
        width: sigDims.width,
        height: sigDims.height,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes as any)], { type: "application/pdf" });
      setOutput(blob);
      setShowSignModal(false);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign PDF.");
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!output) return;
    const url = URL.createObjectURL(output);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${basename(files[0]?.name || "document")}-signed.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <WorkspaceShell title="Sign PDF Offline" description="Draw your signature and append it to your PDF. 100% private, processed entirely in your browser.">
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-4">
          <FileInput accept="application/pdf" label="Choose PDF" files={files} onChange={(f) => setFiles(f.slice(0, 1))} />
          
          {files.length > 0 && !output && (
             <div className="rounded-xl border border-border bg-surface p-6 text-center">
               <h3 className="font-bold text-textMain mb-4">Ready to sign</h3>
               <ToolButton onClick={() => setShowSignModal(true)}>
                 <FileSignature size={18} /> Add Signature
               </ToolButton>
             </div>
          )}

          {output && (
            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="font-bold text-green-500 mb-4 flex items-center justify-center gap-2">
                <Check size={20} /> PDF Successfully Signed
              </h3>
              <SecondaryButton onClick={download} className="w-full justify-center">
                <Download size={18} /> Download Signed PDF
              </SecondaryButton>
            </div>
          )}
          
          {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">{error}</div>}
        </div>

        {/* PDF Preview Area */}
        <div className="rounded-xl border border-border bg-surface overflow-hidden flex flex-col relative min-h-[500px]">
          <div className="p-3 border-b border-border flex items-center justify-between bg-background">
            <span className="text-sm font-bold text-textMuted flex items-center gap-2">
              <Search size={16} /> Document Preview
            </span>
            {numPages > 0 && (
              <span className="text-xs text-textMuted bg-surface px-2 py-1 rounded">Page {currentPage + 1} of {numPages}</span>
            )}
          </div>
          
          <div className="flex-1 bg-neutral-900 flex items-center justify-center p-4 overflow-auto relative custom-scrollbar">
            {busy && !showSignModal && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            )}
            
            {previewImages[currentPage] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewImages[currentPage]} alt={`Page ${currentPage + 1}`} className="max-w-full shadow-2xl" />
            ) : (
              <p className="text-textMuted text-sm">Upload a PDF to see preview</p>
            )}
          </div>
        </div>
      </div>

      {showSignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-textMain">Draw Signature</h3>
              <button onClick={() => setShowSignModal(false)} className="text-textMuted hover:text-red-400 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 overflow-hidden mb-4">
              <SignatureCanvas 
                ref={sigCanvas}
                penColor="black"
                canvasProps={{className: "w-full h-48 cursor-crosshair"}} 
              />
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <button 
                onClick={() => sigCanvas.current?.clear()}
                className="text-textMuted hover:text-textMain flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <Undo2 size={16} /> Clear Canvas
              </button>
              
              <button 
                onClick={handleApplySignature}
                disabled={busy}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                {busy ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                Apply Signature
              </button>
            </div>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}
