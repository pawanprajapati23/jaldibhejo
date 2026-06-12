"use client";

import { useState } from "react";
import { Check, Copy, Wand2 } from "lucide-react";
import { WorkspaceShell, ToolButton, SecondaryButton, copyText } from "./ToolShared";

export default function SimpleFormatterTool({ label }: { label: string }) {
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
