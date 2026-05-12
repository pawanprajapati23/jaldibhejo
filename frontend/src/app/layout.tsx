import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JaldiBhejo - Send Anything Instantly",
  description: "A modern instant file-sharing platform. Send files between any devices directly from the browser.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`bg-background text-textMain antialiased selection:bg-primary/20 selection:text-primary`}>
        
        {/* Simple Header */}
        <header className="fixed top-0 w-full p-6 z-10 flex justify-center items-center bg-background border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2z"/></svg>
            </div>
            <span className="font-bold text-lg tracking-wide text-white">JaldiBhejo</span>
          </div>
        </header>

        <main className="min-h-screen flex flex-col items-center justify-center p-6 pt-24">
          {children}
        </main>
      </body>
    </html>
  );
}
