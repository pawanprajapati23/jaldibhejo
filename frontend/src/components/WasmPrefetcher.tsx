"use client";

import { useEffect } from "react";

export function WasmPrefetcher() {
  useEffect(() => {
    // Silent pre-fetching of heavy WASM modules when browser is idle
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      (window as any).requestIdleCallback(() => {
        console.log("Pre-fetching heavy WASM modules...");
        
        // 1. Pre-fetch FFmpeg Core
        const ffmpegLink = document.createElement("link");
        ffmpegLink.rel = "prefetch";
        ffmpegLink.href = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm";
        document.head.appendChild(ffmpegLink);

        // 2. Pre-fetch PDF.js Worker
        const pdfWorkerLink = document.createElement("link");
        pdfWorkerLink.rel = "prefetch";
        pdfWorkerLink.href = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";
        document.head.appendChild(pdfWorkerLink);
      });
    }
  }, []);

  return null;
}
