import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-[13px] text-muted first-letter:uppercase">{eyebrow}</p>}
        <h1 className="font-display text-[26px] leading-tight md:text-[30px]">{title}</h1>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
