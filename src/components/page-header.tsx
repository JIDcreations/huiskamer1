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
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  actions?: React.ReactNode;
  /** Met een beeld wordt de kop een fotoband met de titel erop. */
  image?: Beeld;
  /** Extra regel onder de titel, enkel bij een fotoband. */
  children?: React.ReactNode;
  className?: string;
}) {
  if (image) {
    return (
      <header
        className={cn(
          "bleed relative isolate -mt-[calc(72px+1.5rem)] flex min-h-[400px] flex-col justify-end overflow-hidden bg-pine-deep md:-mt-[calc(72px+2rem)] md:min-h-[480px]",
          className
        )}
      >
        <Image
          src={image.src}
          alt={image.alt}
          placeholder="blur"
          priority
          fill
          sizes="100vw"
          className="-z-20 object-cover"
        />
        <div aria-hidden className="photo-veil absolute inset-0 -z-10" />
        <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-end justify-between gap-6 px-4 pb-10 pt-32 md:px-10 md:pb-14">
          <div className="min-w-0 text-on-accent">
            {eyebrow && (
              <p className="eyebrow mb-4 inline-flex items-center gap-2 rounded-full bg-on-accent/12 px-3 py-1.5 text-on-accent ring-1 ring-inset ring-on-accent/20 backdrop-blur-md">
                <span aria-hidden className="size-1.5 rounded-full bg-sun" />
                {eyebrow}
              </p>
            )}
            <h1 className="type-hero max-w-[16ch] text-on-accent">{title}</h1>
            {children && <div className="mt-4 max-w-xl text-[16px] leading-relaxed text-on-accent/85">{children}</div>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      </header>
    );
  }

  return (
    <header className={cn("flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-3 text-clay-ink">{eyebrow}</p>}
        <h1 className="type-title">{title}</h1>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
