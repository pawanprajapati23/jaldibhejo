import { ToolInfo } from "@/lib/tools";

export function ToolSeoContent({ tool }: { tool: ToolInfo }) {
  return (
    <div className="space-y-8 mt-8">
      <section className="grid gap-5 md:grid-cols-2">
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

      {tool.seoArticle && (
        <section 
          className="rounded-xl border border-border bg-surface p-6 text-sm leading-relaxed text-textMuted space-y-4 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-textMain [&>h3]:mt-6 [&>h3]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-2 [&>p]:mb-4"
          dangerouslySetInnerHTML={{ __html: tool.seoArticle }}
        />
      )}
    </div>
  );
}
