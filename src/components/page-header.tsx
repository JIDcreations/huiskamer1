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
          "relative isolate flex min-h-[220px] flex-col justify-end overflow-hidden rounded-[28px] bg-pine-deep p-6 md:min-h-[260px] md:p-9",
          className
        )}
      >
        <Image
          src={image.src}
          alt={image.alt}
          placeholder="blur"
          priority
          fill
          sizes="(min-width: 1280px) 1100px, 100vw"
          className="-z-20 object-cover"
        />
        <div aria-hidden className="photo-veil absolute inset-0 -z-10" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0 text-on-accent">
            {eyebrow && (
              <p className="mb-3 inline-flex rounded-full bg-on-accent/15 px-3 py-1 text-[12px] font-medium tracking-wide text-on-accent backdrop-blur-md first-letter:uppercase">
                {eyebrow}
              </p>
            )}
            <h1 className="type-hero text-on-accent">{title}</h1>
            {children && <div className="mt-3 max-w-2xl text-[15px] text-on-accent/85">{children}</div>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      </header>
    );
  }

  return (
    <header className={cn("flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 text-[13px] font-medium text-clay-ink first-letter:uppercase">{eyebrow}</p>}
        <h1 className="type-title">{title}</h1>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
