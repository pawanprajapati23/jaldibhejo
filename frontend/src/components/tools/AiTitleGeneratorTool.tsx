"use client";

import { useState } from "react";
import { Copy, Wand2 } from "lucide-react";
import { WorkspaceShell, ToolButton, copyText } from "./ToolShared";

export default function AiTitleGeneratorTool() {
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
