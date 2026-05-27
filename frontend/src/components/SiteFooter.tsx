import Link from "next/link";
import { siteConfig } from "@/lib/site";

const footerLinks = [
  { href: "/file-sharing", label: "File Sharing" },
  { href: "/image-tools", label: "Image Tools" },
  { href: "/pdf-tools", label: "PDF Tools" },
  { href: "/converter-tools", label: "Converter Tools" },
  { href: "/developer-tools", label: "Developer Tools" },
  { href: "/ai-tools", label: "AI Tools" },
  { href: "/blog", label: "Blog" },
  { href: "/about-us", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms-of-service", label: "Terms & Conditions" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background px-6 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 text-sm text-textMuted md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} {siteConfig.name}. Owned by {siteConfig.owner}.</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-textMain">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
