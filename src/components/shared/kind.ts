/** Eén vaste tint per soort, overal dezelfde: check-in is latte, opdracht is salie, notitie is terracotta. */
export const kindTone = {
  checkin: "bg-sun-soft text-sun-ink",
  opdracht: "bg-moss text-pine",
  notitie: "bg-clay-soft text-clay-ink",
  session: "bg-sky-soft text-sky-ink",
  agenda: "bg-plum-soft text-plum-ink",
  note: "bg-surface-2 text-muted",
  appointment: "bg-surface-2 text-muted",
} as const;

export type ToneKind = keyof typeof kindTone;

/** Soort opdracht: zelfde idee, elk een eigen tint. */
export const taskKindTone = {
  afvinken: "bg-moss text-pine",
  tekst: "bg-clay-soft text-clay-ink",
  schaal: "bg-sky-soft text-sky-ink",
  meditatie: "bg-plum-soft text-plum-ink",
} as const;

/** Het bolletje per soort, voor een label zonder vlak. */
export const kindDot = {
  checkin: "bg-sun",
  opdracht: "bg-mood-4",
  notitie: "bg-clay",
} as const;
