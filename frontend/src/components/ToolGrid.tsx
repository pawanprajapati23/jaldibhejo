import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ToolInfo, categoryLabels, categoryRoutes } from "@/lib/tools";

type ToolGridProps = {
  tools: ToolInfo[];
  showCategory?: boolean;
};

export function ToolGrid({ tools, showCategory = false }: ToolGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <Link key={tool.slug} href={`/tools/${tool.slug}`} className="glass-panel group flex min-h-[210px] flex-col p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              {showCategory && (
                <span className="mb-2 inline-flex rounded-full border border-border bg-background px-3 py-1 text-xs text-textMuted">
                  {categoryLabels[tool.category]}
                </span>
              )}
              <h2 className="text-lg font-bold text-textMain group-hover:text-primary">{tool.name}</h2>
            </div>
            <ArrowRight size={18} className="mt-1 flex-shrink-0 text-textMuted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <p className="flex-1 text-sm leading-6 text-textMuted">{tool.description}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-accent">{tool.keyword}</p>
        </Link>
      ))}
    </div>
  );
}

export function CategoryLinks() {
  return (
    <div className="mb-8 flex flex-wrap gap-3">
      {Object.entries(categoryRoutes).map(([category, href]) => (
        <Link
          key={href}
          href={href}
          className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-textMuted transition-colors hover:border-primary hover:text-textMain"
        >
          {categoryLabels[category as keyof typeof categoryLabels]}
        </Link>
      ))}
    </div>
  );
}
