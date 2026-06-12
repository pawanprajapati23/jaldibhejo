"use client";

import { useState } from "react";
import { Check, Copy, Wand2 } from "lucide-react";
import { WorkspaceShell, ToolButton, SecondaryButton, copyText } from "./ToolShared";

export default function AiSummarizerTool() {
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
