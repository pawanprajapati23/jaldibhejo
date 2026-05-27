import { ToolInfo } from "@/lib/tools";

export function ToolSeoContent({ tool }: { tool: ToolInfo }) {
  return (
    <section className="mt-8 grid gap-5 md:grid-cols-2">
      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-xl font-bold text-textMain">How to use {tool.name}</h2>
        <ol className="space-y-3 text-sm leading-6 text-textMuted">
          {tool.howToUse.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-xl font-bold text-textMain">Benefits</h2>
        <ul className="space-y-3 text-sm leading-6 text-textMuted">
          {tool.benefits.map((benefit) => (
            <li key={benefit}>• {benefit}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
