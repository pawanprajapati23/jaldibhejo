"use client";

import { useState } from "react";
import { Check, Copy, Settings2 } from "lucide-react";
import { WorkspaceShell, copyText } from "./ToolShared";

export function RegexTesterTool() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");
  const [copied, setCopied] = useState(false);

  let matches: RegExpMatchArray[] = [];
  let error = "";

  try {
    if (pattern) {
      const regex = new RegExp(pattern, flags);
      const allMatches = testString.matchAll(regex);
      matches = Array.from(allMatches);
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Invalid Regular Expression";
  }

  return (
    <WorkspaceShell title="Regex Tester" description="Test your regular expressions in real-time.">
      <div className="grid gap-5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 bg-surface border border-border rounded-xl px-4 flex items-center focus-within:border-primary">
            <span className="text-textMuted font-bold mr-1">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="pattern"
              className="w-full bg-transparent border-none py-4 text-textMain outline-none font-mono"
            />
            <span className="text-textMuted font-bold ml-1">/</span>
          </div>
          <div className="w-24 bg-surface border border-border rounded-xl px-4 flex items-center focus-within:border-primary">
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="flags"
              className="w-full bg-transparent border-none py-4 text-accent outline-none font-mono text-center"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-4">
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Test string..."
            className="min-h-[250px] w-full rounded-xl border border-border bg-background p-4 text-sm leading-6 text-textMain outline-none focus:border-primary font-mono"
          />

          <div className="min-h-[250px] w-full rounded-xl border border-border bg-surface p-4 text-sm leading-6 text-textMain overflow-auto">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold text-textMuted uppercase text-xs tracking-widest">
                Matches ({matches.length})
              </span>
              {matches.length > 0 && (
                <button
                  onClick={() => copyText(matches.map(m => m[0]).join("\n"), () => setCopied(true))}
                  className="text-textMuted hover:text-primary transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-widest"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>
            
            {matches.length === 0 && !error && pattern && (
              <p className="text-textMuted italic">No matches found.</p>
            )}

            <div className="flex flex-col gap-2">
              {matches.map((match, i) => (
                <div key={i} className="bg-background border border-border p-3 rounded-lg font-mono">
                  <span className="text-accent mr-2">Match {i + 1}:</span>
                  <span className="text-textMain">{match[0]}</span>
                  {match.groups && Object.entries(match.groups).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border flex flex-col gap-1 text-xs">
                      {Object.entries(match.groups).map(([key, val]) => (
                        <div key={key}>
                          <span className="text-secondary">{key}:</span> {val}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
