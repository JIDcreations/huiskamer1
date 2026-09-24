import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export function Placeholder({
  eyebrow,
  title,
  note,
  step,
}: {
  eyebrow?: string;
  title: string;
  note: string;
  step: number;
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} />
      <div className="mt-8 rounded-card bg-surface ring-1 ring-inset ring-surface-2/60 md:mt-10">
        <EmptyState title={note} description={`Deze pagina wordt gebouwd in stap ${step}.`} />
      </div>
    </>
  );
}
