import Image from "next/image";
import type { Beeld } from "@/lib/beelden";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  actions,
  image,
  children,
  className,
}: {
  /** Korte regel onder de titel (datum, context). Nooit erboven. */
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  actions?: React.ReactNode;
  /** Met een beeld wordt de kop een fotoband van rand tot rand, met de titel erop. */
  image?: Beeld;
  /** Extra regel onder de titel. */
  children?: React.ReactNode;
  className?: string;
}) {
  if (image) {
    return (
      <header
        className={cn(
          "bleed relative isolate -mt-[calc(72px+1rem)] flex min-h-[340px] flex-col justify-end overflow-hidden bg-surface-2 md:-mt-[calc(72px+1.5rem)] md:min-h-[440px]",
          className
        )}
      >
        <Image src={image.src} alt={image.alt} placeholder="blur" priority fill sizes="100vw" className="photo-grade -z-20 object-cover" />
        <div aria-hidden className="banner-veil absolute inset-0 -z-10" />
        <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-end justify-between gap-6 px-4 pb-10 pt-28 md:px-10 md:pb-12">
          <div className="min-w-0 text-on-accent">
            <h1 className="type-hero max-w-[16ch]">{title}</h1>
            {eyebrow && <p className="mt-3 text-[17px] text-on-accent/85 md:text-[19px]">{eyebrow}</p>}
            {children && <div className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-on-accent/85">{children}</div>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </header>
    );
  }

  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <h1 className="type-title">{title}</h1>
        {eyebrow && <p className="mt-2 text-[16px] text-muted">{eyebrow}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
