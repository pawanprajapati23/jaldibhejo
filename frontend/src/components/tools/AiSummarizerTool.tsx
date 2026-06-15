"use client";

import { useState, useEffect } from "react";
import { Check, Copy, Wand2, Loader2, Sparkles } from "lucide-react";
import { WorkspaceShell, ToolButton, SecondaryButton, copyText } from "./ToolShared";

export function AiSummarizerTool() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [displayedOutput, setDisplayedOutput] = useState("");

  // Typewriter effect
  useEffect(() => {
    if (!output || isGenerating) {
      setDisplayedOutput("");
      return;
    }
    
    let i = 0;
    setDisplayedOutput("");
    const interval = setInterval(() => {
      setDisplayedOutput(output.slice(0, i));
      i++;
      if (i > output.length) clearInterval(interval);
    }, 15);
    
    return () => clearInterval(interval);
  }, [output, isGenerating]);

  const summarize = () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    setOutput("");
    
    // Simulate AI processing delay
    setTimeout(() => {
      const sentences = text
        .replace(/\s+/g, " ")
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean);
      
      const picked = sentences.slice(0, Math.min(5, Math.max(2, Math.ceil(sentences.length / 4))));
      const finalSummary = picked.map((sentence) => `• ${sentence}`).join("\n\n") || "Not enough text to summarize.";
      
      setOutput(finalSummary);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <WorkspaceShell title="AI Text Summarizer" description="Distill long articles, documents, or notes into concise, easy-to-read bullet points instantly in your browser.">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-textMain">Input Text</label>
          <textarea 
            value={text} 
            onChange={(event) => setText(event.target.value)} 
            className="min-h-[350px] w-full rounded-2xl border border-border bg-surface p-5 text-sm leading-relaxed text-textMain outline-none transition-colors placeholder:text-textMuted focus:border-primary custom-scrollbar resize-y" 
            placeholder="Paste your long text, article, or document here to generate a quick summary..." 
          />
        </div>
        
        <div className="flex flex-col gap-3 relative">
          <label className="text-sm font-bold text-textMain flex items-center gap-2">
            <Sparkles size={16} className="text-secondary" /> AI Summary
          </label>
          <div className="min-h-[350px] w-full rounded-2xl border border-border bg-background p-5 text-sm leading-relaxed text-textMain overflow-y-auto custom-scrollbar relative">
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-primary bg-background/50 backdrop-blur-sm rounded-2xl z-10">
                <Loader2 size={32} className="animate-spin mb-4" />
                <span className="font-semibold animate-pulse">Analyzing text...</span>
              </div>
            ) : null}
            
            {!output && !isGenerating && (
              <p className="text-textMuted italic opacity-70">Your summary will appear here...</p>
            )}
            
            <p className="whitespace-pre-wrap">{displayedOutput}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 p-4 bg-surface border border-border rounded-2xl">
        <ToolButton onClick={summarize} disabled={!text.trim() || isGenerating}>
          {isGenerating ? <Loader2 size={17} className="animate-spin" /> : <Wand2 size={17} />}
          {isGenerating ? "Summarizing..." : "Summarize Now"}
        </ToolButton>
        
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-textMuted hidden sm:inline-block">
            {text.length > 0 ? `${text.split(/\s+/).filter(Boolean).length} words input` : ''}
          </span>
          <SecondaryButton onClick={() => copyText(output, () => setCopied((state) => !state))} disabled={!output || isGenerating}>
            {copied ? <Check size={17} /> : <Copy size={17} />}
            {copied ? "Copied" : "Copy Summary"}
          </SecondaryButton>
        </div>
      </div>
    </WorkspaceShell>
  );
}
