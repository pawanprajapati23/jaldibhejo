"use client";

import { useState } from "react";
import { Check, Copy, Wand2 } from "lucide-react";
import { WorkspaceShell, ToolButton, SecondaryButton, copyText } from "./ToolShared";

export default function JsonFormatterTool() {
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
