import { CategoryLinks, ToolGrid } from "@/components/ToolGrid";
import { ToolCategory, categoryLabels, getToolsByCategory } from "@/lib/tools";

type ToolCategoryPageProps = {
  category: ToolCategory;
  description: string;
};

export function ToolCategoryPage({ category, description }: ToolCategoryPageProps) {
  const categoryTools = getToolsByCategory(category);

  return (
    <div className="w-full max-w-6xl py-8">
      <section className="mb-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-accent">JaldiBhejo tools</p>
        <h1 className="text-3xl font-bold text-textMain md:text-5xl">{categoryLabels[category]}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-textMuted md:text-base">{description}</p>
      </section>
      <CategoryLinks />
      <ToolGrid tools={categoryTools} />
    </div>
  );
}
