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
      <body className={`bg-background text-white antialiased selection:bg-primary/30`}>
        
        {/* Animated Mesh Gradient Background */}
        <div className="fixed inset-0 z-[-2] bg-gradient-mesh opacity-40"></div>

        {/* Floating Glow Orbs */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[140px] mix-blend-screen animate-float" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[140px] mix-blend-screen animate-float-delayed" />
          <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
        </div>

        {/* Subtle Noise Texture Overlay for Premium Feel */}
        <div className="fixed inset-0 z-[-1] pointer-events-none opacity-[0.015] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
        
        {/* Header */}
        <header className="fixed top-0 w-full p-6 z-10 flex justify-between items-center backdrop-blur-md bg-background/30 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-glow flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-glow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2z"/></svg>
            </div>
            <span className="font-bold text-2xl tracking-tight text-gradient-animated">JaldiBhejo</span>
          </div>
        </header>

        <main className="min-h-screen flex flex-col items-center justify-center p-6 pt-24 relative z-0">
          {children}
        </main>
      </body>
    </html>
  );
}
