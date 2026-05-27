import type { ReactNode } from "react";

type ContentPageProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function ContentPage({ eyebrow, title, description, children }: ContentPageProps) {
  return (
    <div className="w-full max-w-4xl py-8">
      <header className="mb-8">
        {eyebrow && <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
        <h1 className="text-3xl font-bold text-textMain md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-textMuted">{description}</p>
      </header>
      <div className="glass-panel space-y-8 p-6 md:p-8">{children}</div>
    </div>
  );
}

export function ContentSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-bold text-textMain">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-textMuted md:text-base">{children}</div>
    </section>
  );
}
