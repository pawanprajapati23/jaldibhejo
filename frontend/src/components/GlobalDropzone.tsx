"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useTransferStore } from "@/store/useTransferStore";
import { webrtcEngine } from "@/lib/WebRTCEngine";
import { UploadCloud } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export function GlobalDropzone({ children }: { children: React.ReactNode }) {
  const { setFiles, setMode, setRole } = useTransferStore();
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsDragging(false);
      if (acceptedFiles.length > 0) {
        setFiles(acceptedFiles);
        setMode("send");
        setRole("sender");
        webrtcEngine.connect();
        webrtcEngine.createRoom();
        if (pathname !== "/") {
          router.push("/");
        }
      }
    },
    [setFiles, setMode, setRole, pathname, router]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  useEffect(() => {
    setIsDragging(isDragActive);
  }, [isDragActive]);

  // Global drag listener to trigger the overlay even if not dragging exactly over the dropzone root
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes("Files")) {
        setIsDragging(true);
      }
    };
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.clientX === 0 && e.clientY === 0) {
        setIsDragging(false);
      }
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  return (
    <div {...getRootProps()} className="relative w-full min-h-screen flex flex-col">
      <input {...getInputProps()} />
      {children}
      
      {isDragging && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm border-4 border-dashed border-primary m-4 rounded-2xl pointer-events-none">
          <div className="flex flex-col items-center justify-center p-12 bg-surface rounded-2xl shadow-2xl text-center">
            <div className="w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-6 animate-bounce">
              <UploadCloud size={48} />
            </div>
            <h2 className="text-3xl font-bold text-textMain mb-2">Drop files anywhere</h2>
            <p className="text-textMuted">We&apos;ll prepare them for instant sharing</p>
          </div>
        </div>
      )}
    </div>
  );
}
