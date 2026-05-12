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
      <body className={`bg-background text-textMain antialiased selection:bg-primary/20 selection:text-primary relative`}>
        
        {/* Animated Fluid Blobs Background */}
        <div className="fixed inset-0 z-[-2] overflow-hidden pointer-events-none opacity-60">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-primary/20 mix-blend-screen blur-[120px] animate-blob"></div>
          <div className="absolute top-[20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-secondary/20 mix-blend-screen blur-[120px] animate-blob-reverse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-accent/20 mix-blend-screen blur-[120px] animate-blob" style={{ animationDelay: '4s' }}></div>
        </div>
        
        {/* Subtle Noise Texture for realism */}
        <div className="fixed inset-0 z-[-1] pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

        {/* Ultra Glass Header */}
        <header className="fixed top-0 w-full p-6 z-10 flex justify-center items-center">
          <div className="glass-panel px-6 py-3 flex items-center gap-3 rounded-full border-white/10 shadow-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2z"/></svg>
            </div>
            <span className="font-bold text-lg tracking-wide text-white">JaldiBhejo</span>
          </div>
        </header>

        <main className="min-h-screen flex flex-col items-center justify-center p-6 pt-24 relative z-0">
          {children}
        </main>
      </body>
    </html>
  );
}
