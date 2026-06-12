"use client";

import { useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { WorkspaceShell, ToolButton, SecondaryButton, copyText } from "./ToolShared";

export default function PasswordTool() {
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
