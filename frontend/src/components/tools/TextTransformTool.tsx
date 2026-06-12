"use client";

import { useState } from "react";
import { Check, Copy, Wand2 } from "lucide-react";
import { WorkspaceShell, ToolButton, SecondaryButton, copyText } from "./ToolShared";

export default function TextTransformTool({ mode }: { mode: "base64-encoder" | "base64-decoder" | "url-encoder" | "url-decoder" }) {
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
