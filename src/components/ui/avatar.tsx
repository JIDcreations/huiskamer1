import { cn } from "@/lib/utils";

const tones = {
  psy: "bg-surface-2 text-muted",
  client: "bg-surface text-muted ring-1 ring-inset ring-faint/50",
  neutral: "bg-oat-soft text-muted",
} as const;

const sizes = {
  xs: "size-5 text-[9px]",
  sm: "size-7 text-[11px]",
  md: "size-9 text-[13px]",
  lg: "size-12 text-[16px]",
} as const;

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function Avatar({
  name,
  tone = "neutral",
  size = "md",
  className,
}: {
  name: string;
  tone?: keyof typeof tones;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-medium tracking-wide",
        tones[tone],
        sizes[size],
        className
      )}
    >
      {initials(name)}
    </span>
  );
}
