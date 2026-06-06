"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import JSZip from "jszip";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { Check, Copy, Download, FileText, ImageIcon, RefreshCw, UploadCloud, Wand2, X } from "lucide-react";
import { ToolInfo } from "@/lib/tools";

type ToolWorkspaceProps = {
  tool: ToolInfo;
};

type PdfJsRuntime = {
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  getDocument: (options: { data: Uint8Array }) => { promise: Promise<{ numPages: number; getPage: (pageNumber: number) => Promise<any> }> };
};

type MammothRuntime = {
  extractRawText: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
};

declare global {
  interface Window {
    mammoth?: MammothRuntime;
  }
}

const QRCodeSVG = dynamic(() => import("qrcode.react").then((mod) => mod.QRCodeSVG), {
  ssr: false,
  loading: () => <div className="h-[220px] w-[220px] rounded-xl bg-slate-100" />,
});

function copyText(value: string, onCopied: () => void) {
  if (!value) return;
  void navigator.clipboard.writeText(value).then(() => {
    onCopied();
    window.setTimeout(onCopied, 1400);
  });
}

function downloadText(filename: string, content: string, type = "text/plain") {
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

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

function basename(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "") || "jaldibhejo-file";
}

function readAsArrayBuffer(file: File) {
  return file.arrayBuffer();
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function pdfBytesToBlob(bytes: Uint8Array) {
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return new Blob([arrayBuffer], { type: "application/pdf" });
}

function loadImageFromFile(file: File) {
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

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
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

async function imageFileToCanvas(file: File, width?: number, height?: number, fill = "#ffffff") {
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

function parsePageSelection(input: string, pageCount: number) {
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

async function loadPdfJs() {
  const pdfjsUrl = "/vendor/pdfjs/pdf.min.mjs";
  const pdfjs = (await import(/* webpackIgnore: true */ pdfjsUrl)) as PdfJsRuntime;
  pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.mjs";
  return pdfjs;
}

function loadScript(src: string) {
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

async function loadMammoth() {
  await loadScript("/vendor/mammoth/mammoth.browser.min.js");
  if (!window.mammoth) throw new Error("Document parser did not load.");
  return window.mammoth;
}

async function extractPdfText(file: File) {
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

function wrapText(text: string, maxLength = 88) {
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

async function textToPdfBlob(text: string) {
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

function WorkspaceShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
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

function FileInput({
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

function ToolButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
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

function SecondaryButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold text-textMain transition-colors hover:bg-surfaceHover disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function QrCodeTool() {
  const [value, setValue] = useState("https://jaldibhejo.vercel.app");
  const [copied, setCopied] = useState(false);

  const downloadSvg = () => {
    const svg = document.querySelector("#jaldi-qr-code svg");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    downloadText("jaldibhejo-qr-code.svg", data, "image/svg+xml");
  };

  return (
    <WorkspaceShell title="Generate QR Code" description="Create a QR code for links, text, contact details, or file sharing instructions.">
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <label className="mb-2 block text-sm font-semibold text-textMain">Text or URL</label>
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="min-h-[180px] w-full rounded-xl border border-border bg-background p-4 text-sm leading-6 text-textMain outline-none transition-colors placeholder:text-textMuted focus:border-primary"
            placeholder="Enter URL or text"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <ToolButton onClick={downloadSvg} disabled={!value.trim()}>
              <Download size={17} />
              Download SVG
            </ToolButton>
            <SecondaryButton onClick={() => copyText(value, () => setCopied((state) => !state))} disabled={!value.trim()}>
              {copied ? <Check size={17} /> : <Copy size={17} />}
              {copied ? "Copied" : "Copy Text"}
            </SecondaryButton>
          </div>
        </div>
        <div id="jaldi-qr-code" className="flex min-h-[280px] items-center justify-center rounded-xl border border-border bg-white p-5">
          {value.trim() ? <QRCodeSVG value={value} size={220} fgColor="#111827" bgColor="#ffffff" /> : <p className="text-center text-sm text-slate-500">Enter text to generate QR.</p>}
        </div>
      </div>
    </WorkspaceShell>
  );
}

function PasswordTool() {
  const [length, setLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()-_=+[]{};:,.?";
    let pool = lowercase;
    if (useUppercase) pool += uppercase;
    if (useNumbers) pool += numbers;
    if (useSymbols) pool += symbols;

    const bytes = new Uint32Array(length);
    crypto.getRandomValues(bytes);
    setPassword(Array.from(bytes, (byte) => pool[byte % pool.length]).join(""));
  };

  return (
    <WorkspaceShell title="Generate Strong Password" description="Create a random password locally in your browser using the Web Crypto API.">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-border bg-background p-4">
          <label className="mb-3 flex items-center justify-between text-sm font-semibold text-textMain">
            <span>Password length</span>
            <span className="text-accent">{length}</span>
          </label>
          <input type="range" min="8" max="48" value={length} onChange={(event) => setLength(Number(event.target.value))} className="w-full accent-primary" />
          <div className="mt-5 space-y-3 text-sm text-textMuted">
            {[
              ["Uppercase letters", useUppercase, setUseUppercase],
              ["Numbers", useNumbers, setUseNumbers],
              ["Symbols", useSymbols, setUseSymbols],
            ].map(([label, checked, setter]) => (
              <label key={label as string} className="flex items-center gap-3">
                <input type="checkbox" checked={checked as boolean} onChange={(event) => (setter as (value: boolean) => void)(event.target.checked)} className="h-4 w-4 accent-primary" />
                {label as string}
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="min-h-[120px] rounded-xl border border-border bg-background p-4 font-mono text-sm leading-6 text-textMain break-all">
            {password || "Click generate to create a password."}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <ToolButton onClick={generate}>
              <RefreshCw size={17} />
              Generate
            </ToolButton>
            <SecondaryButton onClick={() => copyText(password, () => setCopied((state) => !state))} disabled={!password}>
              {copied ? <Check size={17} /> : <Copy size={17} />}
              {copied ? "Copied" : "Copy"}
            </SecondaryButton>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}

function JsonFormatterTool() {
  const [input, setInput] = useState('{"name":"JaldiBhejo","type":"P2P file sharing"}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const format = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
      setOutput("");
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
      setOutput("");
    }
  };

  return (
    <WorkspaceShell title="Format and Validate JSON" description="Paste JSON to beautify, minify, validate, and copy clean output.">
      <div className="grid gap-4 lg:grid-cols-2">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} className="min-h-[320px] rounded-xl border border-border bg-background p-4 font-mono text-sm leading-6 text-textMain outline-none focus:border-primary" />
        <div>
          <textarea readOnly value={output} placeholder="Formatted JSON output" className="min-h-[320px] w-full rounded-xl border border-border bg-background p-4 font-mono text-sm leading-6 text-textMain outline-none" />
          {error && <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <ToolButton onClick={format}>
          <Wand2 size={17} />
          Format
        </ToolButton>
        <SecondaryButton onClick={minify}>Minify</SecondaryButton>
        <SecondaryButton onClick={() => copyText(output, () => setCopied((state) => !state))} disabled={!output}>
          {copied ? <Check size={17} /> : <Copy size={17} />}
          {copied ? "Copied" : "Copy Output"}
        </SecondaryButton>
      </div>
    </WorkspaceShell>
  );
}

function WordCounterTool() {
  const [text, setText] = useState("");
  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const sentences = text.trim() ? text.split(/[.!?]+/).filter((item) => item.trim()).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 220));
    return { words, characters, charactersNoSpaces, sentences, minutes };
  }, [text]);

  return (
    <WorkspaceShell title="Count Words and Characters" description="Paste text to instantly count words, characters, sentences, and estimated reading time.">
      <textarea value={text} onChange={(event) => setText(event.target.value)} className="min-h-[260px] w-full rounded-xl border border-border bg-background p-4 text-sm leading-6 text-textMain outline-none focus:border-primary" placeholder="Paste or type text here..." />
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Words", stats.words],
          ["Characters", stats.characters],
          ["No spaces", stats.charactersNoSpaces],
          ["Sentences", stats.sentences],
          ["Read time", `${stats.minutes} min`],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-xl border border-border bg-background p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-textMuted">{label as string}</p>
            <p className="mt-2 text-2xl font-bold text-textMain">{value}</p>
          </div>
        ))}
      </div>
    </WorkspaceShell>
  );
}

function toTitleCase(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function TextCaseTool() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const transform = (mode: "upper" | "lower" | "title" | "sentence") => {
    if (mode === "upper") setText(text.toUpperCase());
    if (mode === "lower") setText(text.toLowerCase());
    if (mode === "title") setText(toTitleCase(text));
    if (mode === "sentence") {
      const sentence = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (match) => match.toUpperCase());
      setText(sentence);
    }
  };

  return (
    <WorkspaceShell title="Convert Text Case" description="Convert text into uppercase, lowercase, title case, or sentence case.">
      <textarea value={text} onChange={(event) => setText(event.target.value)} className="min-h-[260px] w-full rounded-xl border border-border bg-background p-4 text-sm leading-6 text-textMain outline-none focus:border-primary" placeholder="Paste text here..." />
      <div className="mt-4 flex flex-wrap gap-3">
        <ToolButton onClick={() => transform("upper")}>UPPERCASE</ToolButton>
        <SecondaryButton onClick={() => transform("lower")}>lowercase</SecondaryButton>
        <SecondaryButton onClick={() => transform("title")}>Title Case</SecondaryButton>
        <SecondaryButton onClick={() => transform("sentence")}>Sentence case</SecondaryButton>
        <SecondaryButton onClick={() => copyText(text, () => setCopied((state) => !state))} disabled={!text}>
          {copied ? <Check size={17} /> : <Copy size={17} />}
          {copied ? "Copied" : "Copy"}
        </SecondaryButton>
      </div>
    </WorkspaceShell>
  );
}

function TextTransformTool({ mode }: { mode: "base64-encoder" | "base64-decoder" | "url-encoder" | "url-decoder" }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const labels = {
    "base64-encoder": ["Base64 Encode", "Encode text into Base64."],
    "base64-decoder": ["Base64 Decode", "Decode Base64 into readable text."],
    "url-encoder": ["URL Encode", "Encode text for safe URL usage."],
    "url-decoder": ["URL Decode", "Decode URL-encoded text."],
  } as const;

  const run = () => {
    try {
      setError("");
      if (mode === "base64-encoder") setOutput(btoa(unescape(encodeURIComponent(input))));
      if (mode === "base64-decoder") setOutput(decodeURIComponent(escape(atob(input))));
      if (mode === "url-encoder") setOutput(encodeURIComponent(input));
      if (mode === "url-decoder") setOutput(decodeURIComponent(input));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to process input.");
      setOutput("");
    }
  };

  return (
    <WorkspaceShell title={labels[mode][0]} description={labels[mode][1]}>
      <div className="grid gap-4 lg:grid-cols-2">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} className="min-h-[240px] rounded-xl border border-border bg-background p-4 font-mono text-sm leading-6 text-textMain outline-none focus:border-primary" placeholder="Input" />
        <textarea readOnly value={output} className="min-h-[240px] rounded-xl border border-border bg-background p-4 font-mono text-sm leading-6 text-textMain outline-none" placeholder="Output" />
      </div>
      {error && <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        <ToolButton onClick={run}>
          <Wand2 size={17} />
          Convert
        </ToolButton>
        <SecondaryButton onClick={() => copyText(output, () => setCopied((state) => !state))} disabled={!output}>
          {copied ? <Check size={17} /> : <Copy size={17} />}
          {copied ? "Copied" : "Copy Output"}
        </SecondaryButton>
      </div>
    </WorkspaceShell>
  );
}

function SimpleFormatterTool({ label }: { label: string }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const format = () => {
    const normalized = input
      .replace(/>\s+</g, ">\n<")
      .replace(/\{\s*/g, "{\n  ")
      .replace(/;\s*/g, ";\n")
      .replace(/\}\s*/g, "\n}\n")
      .trim();
    setOutput(normalized);
  };

  return (
    <WorkspaceShell title={`${label} Formatter`} description={`Clean up ${label} spacing for quick reading and copying. For production code, use your project formatter.`}>
      <div className="grid gap-4 lg:grid-cols-2">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} className="min-h-[300px] rounded-xl border border-border bg-background p-4 font-mono text-sm leading-6 text-textMain outline-none focus:border-primary" placeholder={`Paste ${label} here`} />
        <textarea readOnly value={output} className="min-h-[300px] rounded-xl border border-border bg-background p-4 font-mono text-sm leading-6 text-textMain outline-none" placeholder="Formatted output" />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <ToolButton onClick={format}>
          <Wand2 size={17} />
          Format
        </ToolButton>
        <SecondaryButton onClick={() => copyText(output, () => setCopied((state) => !state))} disabled={!output}>
          {copied ? <Check size={17} /> : <Copy size={17} />}
          {copied ? "Copied" : "Copy Output"}
        </SecondaryButton>
      </div>
    </WorkspaceShell>
  );
}

function ImageFormatTool({ mode }: { mode: "jpg-to-png" | "png-to-jpg" | "webp-converter" }) {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(0.86);
  const [output, setOutput] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const config = {
    "jpg-to-png": {
      title: "JPG to PNG",
      description: "Convert a JPG image into a PNG file locally in your browser.",
      accept: "image/jpeg",
      type: "image/png",
      ext: "png",
      fill: "#ffffff",
    },
    "png-to-jpg": {
      title: "PNG to JPG",
      description: "Convert PNG images into smaller JPG files with a white background.",
      accept: "image/png",
      type: "image/jpeg",
      ext: "jpg",
      fill: "#ffffff",
    },
    "webp-converter": {
      title: "WebP Converter",
      description: "Convert JPG or PNG images into WebP for smaller web assets.",
      accept: "image/jpeg,image/png",
      type: "image/webp",
      ext: "webp",
      fill: "#ffffff",
    },
  }[mode];

  const convert = async () => {
    const file = files[0];
    if (!file) return;
    setBusy(true);
    setError("");
    setOutput(null);
    try {
      const { canvas } = await imageFileToCanvas(file, undefined, undefined, config.fill);
      setOutput(await canvasToBlob(canvas, config.type, quality));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <WorkspaceShell title={config.title} description={config.description}>
      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <FileInput accept={config.accept} label="Choose Image" files={files} onChange={(nextFiles) => setFiles(nextFiles.slice(0, 1))} />
        <div className="rounded-xl border border-border bg-background p-4">
          <label className="mb-3 flex items-center justify-between text-sm font-semibold text-textMain">
            <span>Output quality</span>
            <span className="text-accent">{Math.round(quality * 100)}%</span>
          </label>
          <input type="range" min="0.45" max="0.98" step="0.01" value={quality} onChange={(event) => setQuality(Number(event.target.value))} className="w-full accent-primary" />
          <div className="mt-5 flex flex-wrap gap-3">
            <ToolButton onClick={convert} disabled={!files[0] || busy}>
              <Wand2 size={17} />
              {busy ? "Converting" : "Convert"}
            </ToolButton>
            <SecondaryButton onClick={() => output && downloadBlob(`${basename(files[0]?.name ?? "image")}.${config.ext}`, output)} disabled={!output}>
              <Download size={17} />
              Download
            </SecondaryButton>
          </div>
          {output && <p className="mt-4 text-sm text-textMuted">Output ready: {formatBytes(output.size)}</p>}
          {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        </div>
      </div>
    </WorkspaceShell>
  );
}

function ImageResizerTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [lockRatio, setLockRatio] = useState(true);
  const [output, setOutput] = useState<Blob | null>(null);
  const [error, setError] = useState("");

  const loadDimensions = async (nextFiles: File[]) => {
    setFiles(nextFiles.slice(0, 1));
    setOutput(null);
    setError("");
    const file = nextFiles[0];
    if (!file) return;
    try {
      const image = await loadImageFromFile(file);
      setWidth(image.naturalWidth);
      setHeight(image.naturalHeight);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to read image.");
    }
  };

  const updateWidth = (nextWidth: number) => {
    if (!Number.isFinite(nextWidth) || nextWidth < 1) return;
    if (lockRatio && files[0]) {
      void loadImageFromFile(files[0]).then((image) => setHeight(Math.round((nextWidth * image.naturalHeight) / image.naturalWidth)));
    }
    setWidth(nextWidth);
  };

  const resize = async () => {
    const file = files[0];
    if (!file) return;
    setError("");
    try {
      const { canvas } = await imageFileToCanvas(file, width, height, file.type === "image/png" ? "transparent" : "#ffffff");
      setOutput(await canvasToBlob(canvas, file.type === "image/png" ? "image/png" : "image/jpeg", 0.9));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resize failed.");
    }
  };

  return (
    <WorkspaceShell title="Image Resizer" description="Resize an image to exact pixel dimensions and download the result.">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <FileInput accept="image/jpeg,image/png,image/webp" label="Choose Image" files={files} onChange={(nextFiles) => void loadDimensions(nextFiles)} />
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-textMain">
              Width
              <input type="number" min="1" value={width} onChange={(event) => updateWidth(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-border bg-surface p-3 outline-none focus:border-primary" />
            </label>
            <label className="text-sm font-semibold text-textMain">
              Height
              <input type="number" min="1" value={height} onChange={(event) => setHeight(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-border bg-surface p-3 outline-none focus:border-primary" />
            </label>
          </div>
          <label className="mt-4 flex items-center gap-3 text-sm text-textMuted">
            <input type="checkbox" checked={lockRatio} onChange={(event) => setLockRatio(event.target.checked)} className="h-4 w-4 accent-primary" />
            Keep aspect ratio when changing width
          </label>
          <div className="mt-5 flex flex-wrap gap-3">
            <ToolButton onClick={resize} disabled={!files[0]}>
              <ImageIcon size={17} />
              Resize
            </ToolButton>
            <SecondaryButton onClick={() => output && downloadBlob(`${basename(files[0]?.name ?? "image")}-resized.${files[0]?.type === "image/png" ? "png" : "jpg"}`, output)} disabled={!output}>
              <Download size={17} />
              Download
            </SecondaryButton>
          </div>
          {output && <p className="mt-4 text-sm text-textMuted">Output ready: {formatBytes(output.size)}</p>}
          {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        </div>
      </div>
    </WorkspaceShell>
  );
}

function BackgroundRemoverTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [tolerance, setTolerance] = useState(34);
  const [output, setOutput] = useState<Blob | null>(null);
  const [error, setError] = useState("");

  const removeBackground = async () => {
    const file = files[0];
    if (!file) return;
    setError("");
    try {
      const { canvas } = await imageFileToCanvas(file);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is not supported in this browser.");
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const samples = [
        [0, 0],
        [canvas.width - 1, 0],
        [0, canvas.height - 1],
        [canvas.width - 1, canvas.height - 1],
      ];
      const colors = samples.map(([x, y]) => {
        const index = (y * canvas.width + x) * 4;
        return [data[index], data[index + 1], data[index + 2]];
      });
      for (let index = 0; index < data.length; index += 4) {
        const isBackground = colors.some(([r, g, b]) => Math.abs(data[index] - r) + Math.abs(data[index + 1] - g) + Math.abs(data[index + 2] - b) <= tolerance * 3);
        if (isBackground) data[index + 3] = 0;
      }
      context.putImageData(imageData, 0, 0);
      setOutput(await canvasToBlob(canvas, "image/png"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Background removal failed.");
    }
  };

  return (
    <WorkspaceShell title="Background Remover" description="Remove a solid or near-solid background by sampling the image corners and exporting a transparent PNG.">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <FileInput accept="image/jpeg,image/png,image/webp" label="Choose Image" files={files} onChange={(nextFiles) => setFiles(nextFiles.slice(0, 1))} />
        <div className="rounded-xl border border-border bg-background p-4">
          <label className="mb-3 flex items-center justify-between text-sm font-semibold text-textMain">
            <span>Tolerance</span>
            <span className="text-accent">{tolerance}</span>
          </label>
          <input type="range" min="8" max="90" value={tolerance} onChange={(event) => setTolerance(Number(event.target.value))} className="w-full accent-primary" />
          <div className="mt-5 flex flex-wrap gap-3">
            <ToolButton onClick={removeBackground} disabled={!files[0]}>
              <Wand2 size={17} />
              Remove
            </ToolButton>
            <SecondaryButton onClick={() => output && downloadBlob(`${basename(files[0]?.name ?? "image")}-transparent.png`, output)} disabled={!output}>
              <Download size={17} />
              Download PNG
            </SecondaryButton>
          </div>
          {output && <p className="mt-4 text-sm text-textMuted">Transparent PNG ready: {formatBytes(output.size)}</p>}
          {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        </div>
      </div>
    </WorkspaceShell>
  );
}

function ImageToPdfTool() {
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

function PdfMergeTool() {
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

function PdfSplitTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [selection, setSelection] = useState("1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const split = async () => {
    const file = files[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const source = await PDFDocument.load(await readAsArrayBuffer(file));
      const pages = parsePageSelection(selection, source.getPageCount());
      const zip = new JSZip();
      for (const pageIndex of pages) {
        const output = await PDFDocument.create();
        const [page] = await output.copyPages(source, [pageIndex]);
        output.addPage(page);
        zip.file(`${basename(file.name)}-page-${pageIndex + 1}.pdf`, await output.save());
      }
      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(`${basename(file.name)}-split-pages.zip`, blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF split failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <WorkspaceShell title="Split PDF" description="Extract selected PDF pages and download them as a ZIP of single-page PDFs.">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <FileInput accept="application/pdf" label="Choose PDF" files={files} onChange={(nextFiles) => setFiles(nextFiles.slice(0, 1))} />
        <div className="rounded-xl border border-border bg-background p-4">
          <label className="text-sm font-semibold text-textMain">
            Pages
            <input value={selection} onChange={(event) => setSelection(event.target.value)} placeholder="1, 3-5" className="mt-2 w-full rounded-lg border border-border bg-surface p-3 outline-none focus:border-primary" />
          </label>
          <p className="mt-2 text-xs text-textMuted">Use page numbers or ranges, for example: 1, 3-5, 8.</p>
          <div className="mt-5">
            <ToolButton onClick={split} disabled={!files[0] || busy}>
              <FileText size={17} />
              {busy ? "Splitting" : "Split PDF"}
            </ToolButton>
          </div>
          {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        </div>
      </div>
    </WorkspaceShell>
  );
}

function PdfCompressTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; original: number } | null>(null);
  const [error, setError] = useState("");

  const compress = async () => {
    const file = files[0];
    if (!file) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const source = await PDFDocument.load(await readAsArrayBuffer(file));
      const optimized = await PDFDocument.create();
      const copiedPages = await optimized.copyPages(source, source.getPageIndices());
      copiedPages.forEach((page) => optimized.addPage(page));
      const bytes = await optimized.save({ useObjectStreams: true });
      setResult({ blob: pdfBytesToBlob(bytes), original: file.size });
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF compression failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <WorkspaceShell title="Compress PDF" description="Optimize PDF object streams and rebuild the document for a smaller downloadable file when possible.">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <FileInput accept="application/pdf" label="Choose PDF" files={files} onChange={(nextFiles) => setFiles(nextFiles.slice(0, 1))} />
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="flex flex-wrap gap-3">
            <ToolButton onClick={compress} disabled={!files[0] || busy}>
              <RefreshCw size={17} />
              {busy ? "Optimizing" : "Compress PDF"}
            </ToolButton>
            <SecondaryButton onClick={() => result && downloadBlob(`${basename(files[0]?.name ?? "document")}-compressed.pdf`, result.blob)} disabled={!result}>
              <Download size={17} />
              Download
            </SecondaryButton>
          </div>
          {result && (
            <p className="mt-4 text-sm text-textMuted">
              Original {formatBytes(result.original)}; optimized {formatBytes(result.blob.size)}.
            </p>
          )}
          {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        </div>
      </div>
    </WorkspaceShell>
  );
}

function PdfToWordTool() {
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

function WordToPdfTool() {
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

function PdfToImageTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const exportImage = async () => {
    const file = files[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const pdfjs = await loadPdfJs();
      const pdf = await pdfjs.getDocument({ data: new Uint8Array(await readAsArrayBuffer(file)) }).promise;
      const safePage = Math.min(Math.max(1, pageNumber), pdf.numPages);
      const page = await pdf.getPage(safePage);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is not supported in this browser.");
      await page.render({ canvas, canvasContext: context, viewport }).promise;
      downloadBlob(`${basename(file.name)}-page-${safePage}.png`, await canvasToBlob(canvas, "image/png"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to render PDF page.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <WorkspaceShell title="PDF to Image" description="Render a selected PDF page as a PNG image in your browser.">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <FileInput accept="application/pdf" label="Choose PDF" files={files} onChange={(nextFiles) => setFiles(nextFiles.slice(0, 1))} />
        <div className="rounded-xl border border-border bg-background p-4">
          <label className="text-sm font-semibold text-textMain">
            Page number
            <input type="number" min="1" value={pageNumber} onChange={(event) => setPageNumber(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-border bg-surface p-3 outline-none focus:border-primary" />
          </label>
          <div className="mt-5">
            <ToolButton onClick={exportImage} disabled={!files[0] || busy}>
              <ImageIcon size={17} />
              {busy ? "Rendering" : "Export PNG"}
            </ToolButton>
          </div>
        </div>
      </div>
      {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
    </WorkspaceShell>
  );
}

function AiSummarizerTool() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const summarize = () => {
    const sentences = text
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);
    const picked = sentences.slice(0, Math.min(5, Math.max(2, Math.ceil(sentences.length / 4))));
    setOutput(picked.map((sentence) => `- ${sentence}`).join("\n") || text.slice(0, 280));
  };

  return (
    <WorkspaceShell title="AI Text Summarizer" description="Turn long text into short bullet points using a fast local extractive summary.">
      <div className="grid gap-4 lg:grid-cols-2">
        <textarea value={text} onChange={(event) => setText(event.target.value)} className="min-h-[300px] rounded-xl border border-border bg-background p-4 text-sm leading-6 text-textMain outline-none focus:border-primary" placeholder="Paste text to summarize..." />
        <textarea readOnly value={output} className="min-h-[300px] rounded-xl border border-border bg-background p-4 text-sm leading-6 text-textMain outline-none" placeholder="Summary output" />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <ToolButton onClick={summarize} disabled={!text.trim()}>
          <Wand2 size={17} />
          Summarize
        </ToolButton>
        <SecondaryButton onClick={() => copyText(output, () => setCopied((state) => !state))} disabled={!output}>
          {copied ? <Check size={17} /> : <Copy size={17} />}
          {copied ? "Copied" : "Copy"}
        </SecondaryButton>
      </div>
    </WorkspaceShell>
  );
}

function AiTitleGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [titles, setTitles] = useState<string[]>([]);

  const generate = () => {
    const clean = topic.trim() || "Your Topic";
    setTitles([
      `${clean}: A Practical Guide`,
      `How to Use ${clean} Without Wasting Time`,
      `The Simple ${clean} Checklist`,
      `${clean} Explained for Beginners`,
      `Best ${clean} Tips You Can Apply Today`,
      `What Everyone Should Know About ${clean}`,
    ]);
  };

  return (
    <WorkspaceShell title="AI Title Generator" description="Generate headline ideas for blogs, videos, and social posts.">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input value={topic} onChange={(event) => setTopic(event.target.value)} className="min-h-[48px] flex-1 rounded-xl border border-border bg-background px-4 text-sm text-textMain outline-none focus:border-primary" placeholder="Enter topic or keyword" />
        <ToolButton onClick={generate}>
          <Wand2 size={17} />
          Generate
        </ToolButton>
      </div>
      {titles.length > 0 && (
        <div className="mt-5 grid gap-3">
          {titles.map((title) => (
            <div key={title} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-4">
              <span className="text-sm font-semibold text-textMain">{title}</span>
              <button type="button" onClick={() => copyText(title, () => undefined)} className="text-textMuted transition-colors hover:text-primary" aria-label="Copy title">
                <Copy size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </WorkspaceShell>
  );
}

export function ToolWorkspace({ tool }: ToolWorkspaceProps) {
  if (tool.slug === "jpg-to-png" || tool.slug === "png-to-jpg" || tool.slug === "webp-converter") return <ImageFormatTool mode={tool.slug} />;
  if (tool.slug === "image-resizer") return <ImageResizerTool />;
  if (tool.slug === "background-remover") return <BackgroundRemoverTool />;
  if (tool.slug === "image-to-pdf") return <ImageToPdfTool />;
  if (tool.slug === "merge-pdf") return <PdfMergeTool />;
  if (tool.slug === "split-pdf") return <PdfSplitTool />;
  if (tool.slug === "compress-pdf") return <PdfCompressTool />;
  if (tool.slug === "pdf-to-word") return <PdfToWordTool />;
  if (tool.slug === "word-to-pdf") return <WordToPdfTool />;
  if (tool.slug === "pdf-to-image") return <PdfToImageTool />;
  if (tool.slug === "ai-text-summarizer") return <AiSummarizerTool />;
  if (tool.slug === "ai-title-generator") return <AiTitleGeneratorTool />;
  if (tool.slug === "qr-code-generator") return <QrCodeTool />;
  if (tool.slug === "password-generator") return <PasswordTool />;
  if (tool.slug === "json-formatter") return <JsonFormatterTool />;
  if (tool.slug === "word-counter") return <WordCounterTool />;
  if (tool.slug === "text-case-converter") return <TextCaseTool />;
  if (tool.slug === "base64-encoder" || tool.slug === "base64-decoder" || tool.slug === "url-encoder" || tool.slug === "url-decoder") {
    return <TextTransformTool mode={tool.slug} />;
  }
  if (tool.slug === "html-formatter") return <SimpleFormatterTool label="HTML" />;
  if (tool.slug === "css-formatter") return <SimpleFormatterTool label="CSS" />;
  if (tool.slug === "javascript-formatter") return <SimpleFormatterTool label="JavaScript" />;

  return <AiTitleGeneratorTool />;
}
