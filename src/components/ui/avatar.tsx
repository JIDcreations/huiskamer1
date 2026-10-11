import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

const tones = {
  psy: "bg-pine text-on-accent",
  client: "",
  neutral: "bg-surface-2 text-text",
} as const;

/** Elke cliënt een eigen, vaste tint, zodat je mensen in een lijst snel terugvindt. */
const clientTints = [
  "bg-clay-soft text-clay-ink",
  "bg-moss text-pine",
  "bg-sun-soft text-sun-ink",
  "bg-sky-soft text-sky-ink",
  "bg-plum-soft text-plum-ink",
] as const;

export function clientTint(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return clientTints[h % clientTints.length];
}

const sizes = {
  xs: "size-5 text-[9px]",
  sm: "size-7 text-[11px]",
  md: "size-9 text-[13px]",
  lg: "size-12 text-[16px]",
  xl: "size-16 text-[20px]",
} as const;

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
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold tracking-wide",
        tone === "client" ? clientTint(name) : tones[tone],
        sizes[size],
        className
      )}
    >
      {initials(name)}
    </span>
  );
}
