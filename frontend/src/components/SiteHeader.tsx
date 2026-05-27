"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, ChevronDown, Code2, FileText, ImageIcon, Menu, Send, Sparkles, Wrench, X } from "lucide-react";

const toolLinks = [
  { href: "/image-tools", label: "Image Tools", description: "Compress, resize, and convert images.", icon: ImageIcon },
  { href: "/pdf-tools", label: "PDF Tools", description: "Merge, split, compress, and convert PDFs.", icon: FileText },
  { href: "/converter-tools", label: "Converter Tools", description: "Convert common files and formats.", icon: Wrench },
  { href: "/developer-tools", label: "Developer Tools", description: "Format JSON, HTML, CSS, and more.", icon: Code2 },
  { href: "/ai-tools", label: "AI Tools", description: "Helpful AI writing and image utilities.", icon: Sparkles },
];

const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/file-sharing", label: "File Sharing" },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-20 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-5 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="JaldiBhejo home" onClick={() => setIsMenuOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
            <Send size={18} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-wide text-white">JaldiBhejo</span>
        </Link>

        <nav className="hidden items-center gap-2 text-sm font-medium text-textMuted md:flex">
          {mainLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-surface hover:text-textMain">
                {Icon && <Icon size={16} />}
                {link.label}
              </Link>
            );
          })}

          <div className="group relative">
            <button className="inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-surface hover:text-textMain focus:bg-surface focus:text-textMain focus:outline-none">
              <Wrench size={16} />
              <span>Free Tools</span>
              <ChevronDown size={14} className="transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
            </button>

            <div className="invisible absolute right-0 top-full w-72 translate-y-2 rounded-xl border border-border bg-surface p-2 opacity-0 shadow-2xl shadow-black/40 transition-all group-hover:visible group-hover:translate-y-3 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-3 group-focus-within:opacity-100">
              {toolLinks.map((toolLink) => {
                const Icon = toolLink.icon;
                return (
                  <Link
                    key={toolLink.href}
                    href={toolLink.href}
                    className="flex items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-surfaceHover"
                  >
                    <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-background text-accent">
                      <Icon size={17} />
                    </span>
                    <span>
                      <span className="block font-semibold text-textMain">{toolLink.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-textMuted">{toolLink.description}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        <button
          type="button"
          onClick={() => setIsMenuOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-textMain transition-colors hover:bg-surfaceHover md:hidden"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-border bg-background px-5 pb-5 md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-2 pt-4 text-sm font-medium text-textMuted">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 transition-colors hover:text-textMain"
                >
                  {Icon && <Icon size={16} />}
                  {link.label}
                </Link>
              );
            })}

            <div className="mt-2 rounded-xl border border-border bg-surface p-2">
              <p className="px-2 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-textMuted">Free Tools</p>
              {toolLinks.map((toolLink) => {
                const Icon = toolLink.icon;
                return (
                  <Link
                    key={toolLink.href}
                    href={toolLink.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-surfaceHover"
                  >
                    <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-background text-accent">
                      <Icon size={17} />
                    </span>
                    <span>
                      <span className="block font-semibold text-textMain">{toolLink.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-textMuted">{toolLink.description}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
