"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Check, Copy, Download, Palette, Settings2 } from "lucide-react";
import { WorkspaceShell, ToolButton, SecondaryButton, copyText, downloadText } from "./ToolShared";

const QRCodeSVG = dynamic(() => import("qrcode.react").then((mod) => mod.QRCodeSVG), {
  ssr: false,
  loading: () => <div className="h-[220px] w-[220px] rounded-xl bg-surface animate-pulse" />,
});

export function QrCodeTool() {
  const [value, setValue] = useState("https://jaldibhejo.vercel.app");
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

  return (
    <WorkspaceShell title="Generate QR Code" description="Create a highly customizable QR code for links, text, contact details, or file sharing instructions.">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-textMain">Text or URL</label>
            <textarea
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="min-h-[140px] w-full rounded-xl border border-border bg-surface p-4 text-sm leading-6 text-textMain outline-none transition-colors placeholder:text-textMuted focus:border-primary custom-scrollbar"
              placeholder="Enter URL or text"
            />
          </div>
          
          <div className="bg-surface border border-border p-5 rounded-xl">
            <h3 className="text-sm font-bold text-textMain flex items-center gap-2 mb-4">
              <Palette size={16} /> Customization
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs font-semibold text-textMuted">Foreground Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0" />
                  <span className="text-xs font-mono text-textMain">{fgColor.toUpperCase()}</span>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold text-textMuted">Background Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} disabled={isTransparent} className={`w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0 ${isTransparent ? 'opacity-50' : ''}`} />
                  <span className="text-xs font-mono text-textMain">{isTransparent ? 'Transparent' : bgColor.toUpperCase()}</span>
                </div>
              </div>
            </div>
            
            <label className="mt-5 flex items-center gap-3 text-sm text-textMuted cursor-pointer w-max hover:text-textMain transition-colors">
              <input type="checkbox" checked={isTransparent} onChange={(event) => setIsTransparent(event.target.checked)} className="h-4 w-4 accent-primary rounded border-border" />
              Transparent Background
            </label>
          </div>

          <div className="mt-2 flex flex-wrap gap-3">
            <ToolButton onClick={downloadSvg} disabled={!value.trim()}>
              <Download size={17} />
              Download SVG
            </ToolButton>
            <SecondaryButton onClick={() => copyText(value, () => setCopied((state) => !state))} disabled={!value.trim()}>
              {copied ? <Check size={17} /> : <Copy size={17} />}
              {copied ? "Copied" : "Copy Text"}
            </SecondaryButton>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <div id="jaldi-qr-code" className="flex min-h-[300px] w-full items-center justify-center rounded-2xl border border-border bg-surface p-8 shadow-sm">
            {value.trim() ? (
              <div className="p-4 rounded-xl" style={{ backgroundColor: isTransparent ? 'transparent' : bgColor }}>
                <QRCodeSVG 
                  value={value} 
                  size={240} 
                  fgColor={fgColor} 
                  bgColor={isTransparent ? "transparent" : bgColor} 
                  level="H"
                  includeMargin={true}
                />
              </div>
            ) : (
              <div className="text-center">
                <Settings2 size={48} className="mx-auto text-border mb-3" />
                <p className="text-sm text-textMuted">Enter text to generate QR</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
