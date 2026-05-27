"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { Download, ImageIcon, Loader2, SlidersHorizontal, UploadCloud, X } from "lucide-react";

type CompressionResult = {
  blob: Blob;
  width: number;
  height: number;
};

const MAX_DIMENSION = 1920;

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

function buildDownloadName(fileName: string) {
  const cleanName = fileName.replace(/\.[^/.]+$/, "");
  return `${cleanName || "image"}-compressed.jpg`;
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read this image. Please try another JPG or PNG file."));
    };
    image.src = url;
  });
}

async function compressImage(file: File, quality: number): Promise<CompressionResult> {
  const image = await loadImage(file);
  const ratio = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.round(image.naturalWidth * ratio);
  const height = Math.round(image.naturalHeight * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Image compression is not supported in this browser.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Compression failed. Please try a smaller image."));
          return;
        }

        resolve({ blob, width, height });
      },
      "image/jpeg",
      quality,
    );
  });
}

export function ImageCompressorTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.72);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);

  const savings = useMemo(() => {
    if (!file || !result) return null;
    const savedBytes = Math.max(file.size - result.blob.size, 0);
    const savedPercent = file.size > 0 ? Math.round((savedBytes / file.size) * 100) : 0;
    return { savedBytes, savedPercent };
  }, [file, result]);

  useEffect(() => {
    if (!file) {
      setOriginalUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!result) {
      setCompressedUrl(null);
      return;
    }

    const url = URL.createObjectURL(result.blob);
    setCompressedUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [result]);

  const handleFile = async (selectedFile: File | undefined) => {
    if (!selectedFile) return;

    if (!["image/jpeg", "image/png"].includes(selectedFile.type)) {
      setError("Please choose a JPG or PNG image.");
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setError(null);
    setIsCompressing(true);

    try {
      const compressed = await compressImage(selectedFile, quality);
      setResult(compressed);
    } catch (compressionError) {
      setError(compressionError instanceof Error ? compressionError.message : "Compression failed. Please try again.");
    } finally {
      setIsCompressing(false);
    }
  };

  const recompress = async () => {
    if (!file) return;

    setIsCompressing(true);
    setError(null);

    try {
      const compressed = await compressImage(file, quality);
      setResult(compressed);
    } catch (compressionError) {
      setError(compressionError instanceof Error ? compressionError.message : "Compression failed. Please try again.");
    } finally {
      setIsCompressing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    void handleFile(event.target.files?.[0]);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void handleFile(event.dataTransfer.files[0]);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="glass-panel p-5 md:p-7">
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition-colors ${
            isDragging ? "border-accent bg-accent/10" : "border-border bg-background/60"
          }`}
        >
          {originalUrl ? (
            <div className="w-full">
              <div className="relative mx-auto mb-5 aspect-video w-full max-w-xl overflow-hidden rounded-xl border border-border bg-surface">
                <img src={originalUrl} alt="Original image preview" className="h-full w-full object-contain" />
              </div>
              <p className="truncate text-sm font-semibold text-textMain">{file?.name}</p>
              <p className="mt-1 text-xs text-textMuted">{file ? formatBytes(file.size) : ""}</p>
            </div>
          ) : (
            <>
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface text-accent">
                <UploadCloud size={28} />
              </div>
              <h2 className="text-xl font-bold text-textMain">Drop an image here</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-textMuted">Choose a JPG or PNG image. It stays on this device and is compressed locally.</p>
            </>
          )}

          <input ref={inputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={onInputChange} />
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90"
            >
              <ImageIcon size={18} />
              Choose Image
            </button>
            {file && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-textMain transition-colors hover:bg-surfaceHover"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <aside className="glass-panel p-5 md:p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background text-primary">
            <SlidersHorizontal size={20} />
          </div>
          <div>
            <h2 className="font-bold text-textMain">Compression Settings</h2>
            <p className="text-xs text-textMuted">Output: optimized JPEG</p>
          </div>
        </div>

        <label className="mb-3 flex items-center justify-between text-sm font-medium text-textMain">
          <span>Quality</span>
          <span className="tabular-nums text-accent">{Math.round(quality * 100)}%</span>
        </label>
        <input
          type="range"
          min="0.3"
          max="0.95"
          step="0.05"
          value={quality}
          onChange={(event) => setQuality(Number(event.target.value))}
          className="w-full accent-primary"
        />
        <button
          type="button"
          onClick={recompress}
          disabled={!file || isCompressing}
          className="mt-5 w-full rounded-lg bg-surface px-4 py-3 text-sm font-semibold text-textMain transition-colors hover:bg-surfaceHover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCompressing ? "Compressing..." : "Apply Compression"}
        </button>

        {error && <p className="mt-5 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

        <div className="mt-6 rounded-xl border border-border bg-background/60 p-4">
          {isCompressing ? (
            <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 text-textMuted">
              <Loader2 className="animate-spin text-primary" size={28} />
              <p className="text-sm">Compressing in your browser...</p>
            </div>
          ) : result && file && compressedUrl ? (
            <div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-border bg-surface p-3">
                  <p className="text-xs text-textMuted">Original</p>
                  <p className="mt-1 font-bold text-textMain">{formatBytes(file.size)}</p>
                </div>
                <div className="rounded-lg border border-border bg-surface p-3">
                  <p className="text-xs text-textMuted">Compressed</p>
                  <p className="mt-1 font-bold text-accent">{formatBytes(result.blob.size)}</p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm text-accent">
                Saved {savings ? formatBytes(savings.savedBytes) : "0 B"} ({savings?.savedPercent ?? 0}%)
              </div>

              <p className="mt-3 text-xs text-textMuted">
                Dimensions: {result.width} x {result.height}px
              </p>

              <a
                href={compressedUrl}
                download={buildDownloadName(file.name)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-accent/90"
              >
                <Download size={18} />
                Download Compressed Image
              </a>
            </div>
          ) : (
            <div className="flex min-h-[160px] flex-col items-center justify-center text-center text-sm leading-6 text-textMuted">
              Upload an image to see size savings and download the compressed file.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
