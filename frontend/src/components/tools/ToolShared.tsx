"use client";

import { ChangeEvent, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Check, Copy, Download, UploadCloud } from "lucide-react";
import { PDFDocument, StandardFonts } from "pdf-lib";

// --- Types ---

export type PdfJsRuntime = {
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  getDocument: (options: { data: Uint8Array }) => { promise: Promise<{ numPages: number; getPage: (pageNumber: number) => Promise<any> }> };
};

export type MammothRuntime = {
  extractRawText: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
};

declare global {
  interface Window {
    mammoth?: MammothRuntime;
  }
}

// --- Helpers ---

export function copyText(value: string, onCopied: () => void) {
  if (!value) return;
  void navigator.clipboard.writeText(value).then(() => {
    onCopied();
    window.setTimeout(onCopied, 1400);
  });
}

export function downloadText(filename: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

export function basename(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "") || "jaldibhejo-file";
}

export function readAsArrayBuffer(file: File) {
  return file.arrayBuffer();
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function pdfBytesToBlob(bytes: Uint8Array) {
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return new Blob([arrayBuffer], { type: "application/pdf" });
}

export function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read this image."));
    };
    image.src = url;
  });
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Unable to create output file."));
      },
      type,
      quality,
    );
  });
}

export async function imageFileToCanvas(file: File, width?: number, height?: number, fill = "#ffffff") {
  const image = await loadImageFromFile(file);
  const targetWidth = width ?? image.naturalWidth;
  const targetHeight = height ?? image.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not supported in this browser.");
  context.fillStyle = fill;
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.drawImage(image, 0, 0, targetWidth, targetHeight);
  return { canvas, image };
}

export function parsePageSelection(input: string, pageCount: number) {
  const clean = input.trim();
  if (!clean) return Array.from({ length: pageCount }, (_, index) => index);

  const pages = new Set<number>();
  for (const chunk of clean.split(",")) {
    const part = chunk.trim();
    if (!part) continue;
    const range = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (start < 1 || end < start || end > pageCount) throw new Error(`Invalid range: ${part}`);
      for (let page = start; page <= end; page += 1) pages.add(page - 1);
      continue;
    }
    const page = Number(part);
    if (!Number.isInteger(page) || page < 1 || page > pageCount) throw new Error(`Invalid page: ${part}`);
    pages.add(page - 1);
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export async function loadPdfJs() {
  const pdfjsUrl = "/vendor/pdfjs/pdf.min.mjs";
  const pdfjs = (await import(/* webpackIgnore: true */ pdfjsUrl)) as PdfJsRuntime;
  pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.mjs";
  return pdfjs;
}

export function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    document.body.appendChild(script);
  });
}

export async function loadMammoth() {
  await loadScript("/vendor/mammoth/mammoth.browser.min.js");
  if (!window.mammoth) throw new Error("Document parser did not load.");
  return window.mammoth;
}

export async function extractPdfText(file: File) {
  const pdfjs = await loadPdfJs();
  const documentTask = pdfjs.getDocument({ data: new Uint8Array(await readAsArrayBuffer(file)) });
  const pdf = await documentTask.promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const text = textContent.items
      .map((item: { str?: string }) => item.str ?? "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push(text);
  }

  return pages;
}

export function wrapText(text: string, maxLength = 88) {
  const lines: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (next.length > maxLength) {
        if (line) lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    lines.push(line);
  }
  return lines;
}

export async function textToPdfBlob(text: string) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const lines = wrapText(text);
  let page = pdf.addPage([595, 842]);
  let y = 800;

  for (const line of lines) {
    if (y < 48) {
      page = pdf.addPage([595, 842]);
      y = 800;
    }
    page.drawText(line || " ", { x: 40, y, size: 11, font });
    y -= 16;
  }

  return pdfBytesToBlob(await pdf.save());
}

// --- UI Components ---

export function WorkspaceShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="glass-panel p-5 md:p-7">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-textMain">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-textMuted">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function FileInput({
  accept,
  multiple,
  label,
  files,
  onChange,
}: {
  accept: string;
  multiple?: boolean;
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(Array.from(event.target.files ?? []));
  };

  return (
    <div className="rounded-xl border border-dashed border-border bg-background p-5 text-center">
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={handleChange} />
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface text-primary">
        <UploadCloud size={24} />
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90"
      >
        {label}
      </button>
      {files.length > 0 && (
        <div className="mt-5 space-y-2 text-left">
          {files.map((file) => (
            <div key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3 text-sm">
              <span className="min-w-0 truncate font-semibold text-textMain">{file.name}</span>
              <span className="shrink-0 text-xs text-textMuted">{formatBytes(file.size)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ToolButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, disabled, className = "" }: { children: ReactNode; onClick: () => void; disabled?: boolean; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold text-textMain transition-colors hover:bg-surfaceHover disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <SecondaryButton onClick={() => copyText(value, () => setCopied((prev) => !prev))} disabled={!value}>
      {copied ? <Check size={17} /> : <Copy size={17} />}
      {copied ? "Copied" : label}
    </SecondaryButton>
  );
}
