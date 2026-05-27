import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="w-full max-w-2xl py-12 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface text-primary">
        <SearchX size={30} />
      </div>
      <h1 className="text-3xl font-bold text-textMain md:text-5xl">Page not found</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-textMuted md:text-base">
        The page may have moved, or the link may be incorrect. You can return to JaldiBhejo file sharing or explore free online tools.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90">
          Send Files Now
          <ArrowRight size={18} />
        </Link>
        <Link href="/tools" className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm font-bold text-textMain transition-colors hover:bg-surfaceHover">
          Explore Tools
        </Link>
      </div>
    </div>
  );
}
