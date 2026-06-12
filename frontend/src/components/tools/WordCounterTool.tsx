"use client";

import { useMemo, useState } from "react";
import { WorkspaceShell } from "./ToolShared";

export default function WordCounterTool() {
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
