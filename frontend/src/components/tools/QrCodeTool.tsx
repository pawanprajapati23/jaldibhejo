"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Check, Copy, Download } from "lucide-react";
import { WorkspaceShell, ToolButton, SecondaryButton, copyText, downloadText } from "./ToolShared";

const QRCodeSVG = dynamic(() => import("qrcode.react").then((mod) => mod.QRCodeSVG), {
  ssr: false,
  loading: () => <div className="h-[220px] w-[220px] rounded-xl bg-slate-100" />,
});

export default function QrCodeTool() {
  const [value, setValue] = useState("https://jaldibhejo.vercel.app");
  const [copied, setCopied] = useState(false);

  const downloadSvg = () => {
    const svg = document.querySelector("#jaldi-qr-code svg");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    downloadText("jaldibhejo-qr-code.svg", data, "image/svg+xml");
  };

  return (
    <WorkspaceShell title="Generate QR Code" description="Create a QR code for links, text, contact details, or file sharing instructions.">
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <label className="mb-2 block text-sm font-semibold text-textMain">Text or URL</label>
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="min-h-[180px] w-full rounded-xl border border-border bg-background p-4 text-sm leading-6 text-textMain outline-none transition-colors placeholder:text-textMuted focus:border-primary"
            placeholder="Enter URL or text"
          />
          <div className="mt-4 flex flex-wrap gap-3">
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
        <div id="jaldi-qr-code" className="flex min-h-[280px] items-center justify-center rounded-xl border border-border bg-white p-5">
          {value.trim() ? <QRCodeSVG value={value} size={220} fgColor="#111827" bgColor="#ffffff" /> : <p className="text-center text-sm text-slate-500">Enter text to generate QR.</p>}
        </div>
      </div>
    </WorkspaceShell>
  );
}
