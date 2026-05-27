"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { Check, Copy, Download, RefreshCw, Wand2 } from "lucide-react";
import { ToolInfo } from "@/lib/tools";

type ToolWorkspaceProps = {
  tool: ToolInfo;
};

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

function ComingSoonTool({ tool }: { tool: ToolInfo }) {
  return (
    <WorkspaceShell title={`${tool.name} workspace`} description="This page is SEO-ready and prepared for a full tool interface.">
      <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface text-primary">
          <Wand2 size={24} />
        </div>
        <h2 className="text-xl font-bold text-textMain">Tool interface coming soon</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-textMuted">
          {tool.name} is included in the JaldiBhejo tools roadmap. This page already has useful SEO content, internal links, and metadata.
        </p>
      </div>
    </WorkspaceShell>
  );
}

export function ToolWorkspace({ tool }: ToolWorkspaceProps) {
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

  return <ComingSoonTool tool={tool} />;
}
