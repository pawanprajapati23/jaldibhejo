"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Check, Copy, Download, Palette, Settings2, Sparkles } from "lucide-react";
import { WorkspaceShell, ToolButton, SecondaryButton, copyText, downloadText } from "./ToolShared";

const QRCodeSVG = dynamic(() => import("qrcode.react").then((mod) => mod.QRCodeSVG), {
  ssr: false,
  loading: () => <div className="h-[220px] w-[220px] rounded-xl bg-surface animate-pulse" />,
});

const QRCodeCanvas = dynamic(() => import("qrcode.react").then((mod) => mod.QRCodeCanvas), {
  ssr: false,
  loading: () => <div className="h-[220px] w-[220px] rounded-xl bg-surface animate-pulse" />,
});

const PRESETS = [
  { name: "Classic", fg: "#000000", bg: "#ffffff" },
  { name: "Indigo Tech", fg: "#6366f1", bg: "#ffffff" },
  { name: "Cyber Neon", fg: "#ec4899", bg: "#09090b" },
  { name: "Emerald Safe", fg: "#10b981", bg: "#f0fdf4" },
  { name: "Sunset Gold", fg: "#ea580c", bg: "#fff7ed" },
  { name: "Royal Blue", fg: "#1d4ed8", bg: "#f0f9ff" },
];

export function QrCodeTool() {
  const [value, setValue] = useState("https://jaldibhejo.sizesnap.in");
  const [copied, setCopied] = useState(false);
  
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [isTransparent, setIsTransparent] = useState(false);

  const downloadSvg = () => {
    const svg = document.querySelector("#jaldi-qr-code svg");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    downloadText("jaldibhejo-qr-code.svg", data, "image/svg+xml");
  };

  const downloadPng = () => {
    const canvas = document.querySelector("#jaldi-qr-canvas canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "jaldibhejo-qr-code.png";
    a.click();
  };

  const applyPreset = (fg: string, bg: string) => {
    setFgColor(fg);
    setBgColor(bg);
    setIsTransparent(false);
  };

  return (
    <WorkspaceShell title="Generate QR Code" description="Create custom styled QR codes for links, texts, contact details, or credentials locally.">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-textMain">URL or Plain Text</label>
            <textarea
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="min-h-[120px] w-full rounded-xl border border-border bg-surface p-4 text-sm leading-6 text-textMain outline-none transition-all placeholder:text-textMuted/40 focus:border-primary focus:ring-2 focus:ring-primary/10 custom-scrollbar font-medium"
              placeholder="Type your URL or message here..."
            />
          </div>
          
          {/* Style Presets */}
          <div className="bg-surface border border-border p-5 rounded-xl">
            <h3 className="text-sm font-bold text-textMain flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-indigo-500" /> Quick Style Presets
            </h3>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p.fg, p.bg)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background/50 hover:bg-surfaceHover hover:border-indigo-500/30 transition-all text-textMain"
                >
                  <span className="w-3.5 h-3.5 rounded border border-black/10 flex overflow-hidden shrink-0">
                    <span className="w-1/2 h-full" style={{ backgroundColor: p.fg }} />
                    <span className="w-1/2 h-full" style={{ backgroundColor: p.bg }} />
                  </span>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border p-5 rounded-xl">
            <h3 className="text-sm font-bold text-textMain flex items-center gap-2 mb-4">
              <Palette size={16} className="text-purple-500" /> Custom Colors
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs font-semibold text-textMuted">Foreground Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-none p-0" />
                  <span className="text-xs font-mono font-bold text-textMain">{fgColor.toUpperCase()}</span>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold text-textMuted">Background Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} disabled={isTransparent} className={`w-9 h-9 rounded-lg cursor-pointer bg-transparent border-none p-0 ${isTransparent ? 'opacity-40' : ''}`} />
                  <span className="text-xs font-mono font-bold text-textMain">{isTransparent ? 'Transparent' : bgColor.toUpperCase()}</span>
                </div>
              </div>
            </div>
            
            <label className="mt-5 flex items-center gap-3 text-sm text-textMuted cursor-pointer w-max hover:text-textMain transition-colors">
              <input type="checkbox" checked={isTransparent} onChange={(event) => setIsTransparent(event.target.checked)} className="h-4.5 w-4.5 accent-primary rounded border-border" />
              Transparent Background
            </label>
          </div>

          <div className="mt-2 flex flex-wrap gap-3">
            <ToolButton onClick={downloadPng} disabled={!value.trim()}>
              <Download size={17} />
              Download PNG
            </ToolButton>
            <SecondaryButton onClick={downloadSvg} disabled={!value.trim()}>
              <Download size={17} />
              Download SVG
            </SecondaryButton>
            <SecondaryButton onClick={() => copyText(value, () => setCopied((state) => !state))} disabled={!value.trim()}>
              {copied ? <Check size={17} /> : <Copy size={17} />}
              {copied ? "Copied" : "Copy Content"}
            </SecondaryButton>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <div id="jaldi-qr-code" className="flex min-h-[300px] w-full items-center justify-center rounded-2xl border border-border bg-surface p-8 shadow-inner relative">
            {value.trim() ? (
              <div className="p-5 rounded-2xl shadow-md border border-border/40" style={{ backgroundColor: isTransparent ? 'transparent' : bgColor }}>
                <QRCodeSVG 
                  value={value} 
                  size={220} 
                  fgColor={fgColor} 
                  bgColor={isTransparent ? "transparent" : bgColor} 
                  level="H"
                  includeMargin={true}
                />
              </div>
            ) : (
              <div className="text-center select-none">
                <Settings2 size={48} className="mx-auto text-border mb-3 animate-spin [animation-duration:8s]" />
                <p className="text-sm font-semibold text-textMuted">Waiting for input...</p>
              </div>
            )}
          </div>

          {/* Hidden Canvas Mirror for PNG downloading */}
          <div id="jaldi-qr-canvas" className="hidden">
            {value.trim() && (
              <QRCodeCanvas
                value={value}
                size={512}
                fgColor={fgColor}
                bgColor={isTransparent ? "transparent" : bgColor}
                level="H"
                includeMargin={true}
              />
            )}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
