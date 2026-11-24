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
        <header className="flex items-start justify-between gap-4 px-5 pt-6 md:px-7">
          <div className="min-w-0">
            {title && <h2 className="type-subtitle">{title}</h2>}
            {description && <p className="mt-1 text-[13.5px] text-muted">{description}</p>}
          </div>
          {action}
          {href && (
            <Link href={href} className="inline-flex shrink-0 items-center gap-0.5 text-[14px] text-muted underline decoration-taupe decoration-1 underline-offset-4 transition-colors hover:text-text hover:decoration-pine">
              {hrefLabel}
              <ChevronRight className="size-3.5 stroke-[1.25]" />
            </Link>
          )}
        </header>
      )}
      <div className={cn("px-5 pb-6 pt-3 md:px-7", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Kleine sectiekop boven een lijst. */
export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("mb-3 font-display text-[21px] italic leading-tight text-ink", className)}>{children}</h2>;
}
