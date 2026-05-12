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
        
        {/* Subtle Grid Background for Pro Look */}
        <div className="fixed inset-0 z-[-1] opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        {/* Minimal Header */}
        <header className="fixed top-0 w-full p-6 z-10 flex justify-center items-center backdrop-blur-md bg-background/50 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-glow flex items-center justify-center text-white shadow-glow-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2z"/></svg>
            </div>
            <span className="font-bold text-xl tracking-wide text-gradient">JaldiBhejo</span>
          </div>
        </header>

        <main className="min-h-screen flex flex-col items-center justify-center p-6 pt-24 relative z-0">
          {children}
        </main>
      </body>
    </html>
  );
}
