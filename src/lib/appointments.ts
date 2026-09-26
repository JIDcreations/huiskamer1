import type { Appointment } from "@/lib/types";

/** Labels voor afspraken, gedeeld door cliënt- en psycholoogkant. */
export const typeLabel = { intake: "Intake", opvolging: "Opvolging" } as const;
export const statusLabel = { gepland: "Gepland", voltooid: "Voltooid", geannuleerd: "Geannuleerd", "no-show": "Niet gekomen" } as const;

/** Duur van een afspraak in minuten. */
export function minutesOf(a: Appointment) {
  return Math.round((new Date(a.end).getTime() - new Date(a.start).getTime()) / 60000);
}
