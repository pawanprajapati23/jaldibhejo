"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { WorkspaceShell, ToolButton, SecondaryButton, copyText } from "./ToolShared";

function toTitleCase(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function TextCaseTool() {
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
