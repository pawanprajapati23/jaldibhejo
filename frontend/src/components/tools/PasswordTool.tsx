"use client";
import { useState, useEffect, useCallback } from "react";
import { Check, Copy, RefreshCw, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { WorkspaceShell, ToolButton, SecondaryButton, copyText } from "./ToolShared";

export default function PasswordTool() {
  const [length, setLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
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
  }, [length, useUppercase, useNumbers, useSymbols]);

  // Generate on mount and when configurations change
  useEffect(() => {
    generate();
  }, [generate]);

  const getStrength = () => {
    if (!password) return { label: "None", color: "text-textMuted bg-border/20", pct: 0, icon: Shield };
    let pool = 26;
    if (useUppercase) pool += 26;
    if (useNumbers) pool += 10;
    if (useSymbols) pool += 23;
    
    const entropy = length * Math.log2(pool);
    if (entropy < 50) {
      return { 
        label: "Weak Password", 
        color: "text-red-500 bg-red-500/10 border-red-500/20", 
        barColor: "bg-red-500",
        pct: 33, 
        icon: ShieldAlert 
      };
    }
    if (entropy < 80) {
      return { 
        label: "Medium Security", 
        color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", 
        barColor: "bg-yellow-500",
        pct: 66, 
        icon: Shield 
      };
    }
    return { 
      label: "Highly Secure", 
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", 
      barColor: "bg-emerald-500",
      pct: 100, 
      icon: ShieldCheck 
    };
  };

  const strength = getStrength();
  const StrengthIcon = strength.icon;

  return (
    <WorkspaceShell title="Generate Strong Password" description="Create highly secure, cryptographically random passwords locally in your browser using the Web Crypto API.">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-xl border border-border bg-surface/50 p-5">
          <label className="mb-3 flex items-center justify-between text-sm font-semibold text-textMain">
            <span>Password length</span>
            <span className="text-primary font-mono text-base font-black">{length}</span>
          </label>
          <input 
            type="range" 
            min="8" 
            max="64" 
            value={length} 
            onChange={(event) => setLength(Number(event.target.value))} 
            className="w-full accent-primary h-2 bg-background rounded-lg cursor-pointer" 
          />
          
          <div className="mt-6 pt-5 border-t border-border/80 space-y-4">
            <h4 className="text-xs font-bold text-textMuted uppercase tracking-wider">Include Characters</h4>
            {[
              ["Uppercase letters (A-Z)", useUppercase, setUseUppercase],
              ["Numbers (0-9)", useNumbers, setUseNumbers],
              ["Symbols (!@#$%)", useSymbols, setUseSymbols],
            ].map(([label, checked, setter]) => (
              <label key={label as string} className="flex items-center gap-3 text-sm text-textMain font-medium cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={checked as boolean} 
                  onChange={(event) => (setter as (value: boolean) => void)(event.target.checked)} 
                  disabled={checked as boolean && !useUppercase && !useNumbers && !useSymbols} // Ensure at least lowercase is active
                  className="h-4.5 w-4.5 accent-primary rounded border-border" 
                />
                {label as string}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-border bg-background p-5">
          <div>
            <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-2">Generated Password</label>
            <div className="min-h-[100px] rounded-xl border border-border bg-surface/40 p-4 font-mono text-sm md:text-base leading-relaxed text-textMain break-all shadow-inner font-semibold flex items-center select-all">
              {password}
            </div>
            
            {/* Strength meter */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-textMuted">Password Strength</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider border flex items-center gap-1 ${strength.color}`}>
                  <StrengthIcon size={12} />
                  {strength.label}
                </span>
              </div>
              <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden border border-border/30">
                <div className={`h-full transition-all duration-300 ${strength.barColor}`} style={{ width: `${strength.pct}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <ToolButton onClick={generate} className="flex-1 justify-center">
              <RefreshCw size={17} />
              Regenerate
            </ToolButton>
            <SecondaryButton 
              onClick={() => copyText(password, () => setCopied((state) => !state))} 
              disabled={!password}
              className="flex-1 justify-center"
            >
              {copied ? <Check size={17} className="text-green-500" /> : <Copy size={17} />}
              {copied ? "Copied" : "Copy Password"}
            </SecondaryButton>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
