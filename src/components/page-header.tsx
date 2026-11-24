import Image from "next/image";
import type { Beeld } from "@/lib/beelden";
import { cn } from "@/lib/utils";

/** Twee beelden als een stukje moodboard: een hoge boog en een kleiner beeld dat ertegen leunt. */
function Collage({ image, detail }: { image: Beeld; detail?: Beeld }) {
  return (
    <div className="relative hidden h-[318px] w-[400px] shrink-0 lg:block">
      <div className="absolute right-0 top-0 h-[318px] w-[226px] overflow-hidden rounded-t-full rounded-b-[22px] bg-surface-2">
        <Image src={image.src} alt={image.alt} placeholder="blur" priority fill sizes="226px" className="photo-grade object-cover" />
      </div>
      {detail && (
        <div className="absolute bottom-0 left-0 h-[208px] w-[166px] overflow-hidden rounded-[20px] bg-surface-2 ring-[7px] ring-bg">
          <Image src={detail.src} alt={detail.alt} placeholder="blur" fill sizes="166px" className="photo-grade object-cover" />
        </div>
      )}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  actions,
  image,
  detail,
  children,
  className,
}: {
  /** Korte regel onder de titel (datum, context). Nooit erboven. */
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  actions?: React.ReactNode;
  /** Met een beeld krijgt de kop een collage: een hoge boog, en optioneel een tweede beeld ertegen. */
  image?: Beeld;
  detail?: Beeld;
  /** Extra regel onder de titel. */
  children?: React.ReactNode;
  className?: string;
}) {
  if (image) {
    return (
      <header className={cn("flex items-end justify-between gap-10", className)}>
        <div className="min-w-0 flex-1">
          <div className="relative mb-7 h-44 overflow-hidden rounded-[22px] bg-surface-2 sm:h-56 lg:hidden">
            <Image src={image.src} alt={image.alt} placeholder="blur" priority fill sizes="100vw" className="photo-grade object-cover" />
          </div>
          <h1 className="type-hero max-w-[14ch]">{title}</h1>
          {eyebrow && <p className="mt-4 font-display text-[19px] text-muted md:text-[22px]">{eyebrow}</p>}
          {children && <div className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-muted">{children}</div>}
          {actions && <div className="mt-6 flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
        <Collage image={image} detail={detail} />
      </header>
    );
  }

  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <h1 className="type-title">{title}</h1>
        {eyebrow && <p className="mt-2 font-display text-[18px] text-muted">{eyebrow}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
