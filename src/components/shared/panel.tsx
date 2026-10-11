import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Rustig paneel: witte kaart met een titel en optioneel een link. */
export function Panel({
  title,
  description,
  href,
  hrefLabel = "Alles bekijken",
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  href?: string;
  hrefLabel?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("card", className)}>
      {(title || href || action) && (
        <header className="flex items-start justify-between gap-4 px-5 pt-5 md:px-6">
          <div className="min-w-0">
            {title && <h2 className="type-subtitle">{title}</h2>}
            {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
          </div>
          {action}
          {href && (
            <Link href={href} className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-moss/70 px-3 py-1 text-[13px] font-medium text-pine transition-colors hover:bg-moss">
              {hrefLabel}
              <ChevronRight className="size-3.5 stroke-[1.5]" />
            </Link>
          )}
        </header>
      )}
      <div className={cn("px-5 pb-5 pt-3 md:px-6", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Kleine sectiekop boven een lijst. */
export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("mb-3 text-[12px] font-semibold tracking-[0.06em] text-clay-ink uppercase", className)}>{children}</h2>;
}
