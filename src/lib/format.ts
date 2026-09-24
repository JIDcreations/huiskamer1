import {
  differenceInCalendarDays,
  format,
  isThisYear,
  isToday,
  isTomorrow,
  isYesterday,
  parseISO,
} from "date-fns";
import { nlBE } from "date-fns/locale";

const locale = { locale: nlBE };

export type DateInput = Date | string;

export function toDate(d: DateInput) {
  return typeof d === "string" ? parseISO(d) : d;
}

/** "donderdag 24 september" */
export function formatLongDate(d: DateInput) {
  return format(toDate(d), "EEEE d MMMM", locale);
}

/** "do 24 sep" */
export function formatShortDate(d: DateInput) {
  const date = toDate(d);
  return format(date, isThisYear(date) ? "EEE d MMM" : "EEE d MMM yyyy", locale).replace(/\./g, "");
}

/** "24 sep" of "24 sep 2025" */
export function formatDayMonth(d: DateInput) {
  const date = toDate(d);
  return format(date, isThisYear(date) ? "d MMM" : "d MMM yyyy", locale).replace(/\./g, "");
}

/** "24 september 2026" */
export function formatFullDate(d: DateInput) {
  return format(toDate(d), "d MMMM yyyy", locale);
}

/** "14:05" */
export function formatTime(d: DateInput) {
  return format(toDate(d), "HH:mm");
}

/** "vandaag", "morgen", "gisteren", of "do 24 sep" */
export function formatRelativeDay(d: DateInput) {
  const date = toDate(d);
  if (isToday(date)) return "vandaag";
  if (isTomorrow(date)) return "morgen";
  if (isYesterday(date)) return "gisteren";
  const diff = differenceInCalendarDays(date, new Date());
  if (diff > 1 && diff < 7) return format(date, "EEEE", locale);
  return formatShortDate(date);
}

/** "vandaag, 14:05" */
export function formatWhen(d: DateInput) {
  return `${formatRelativeDay(d)}, ${formatTime(d)}`;
}

/** "Donderdag 24 september, 14:00" */
export function formatAppointment(d: DateInput) {
  const date = toDate(d);
  const day = isToday(date) ? "Vandaag" : isTomorrow(date) ? "Morgen" : capitalize(formatLongDate(date));
  return `${day}, ${formatTime(date)}`;
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" }).format(amount);
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return "Goeiemorgen";
  if (h < 18) return "Goeiemiddag";
  return "Goeienavond";
}

export function dayKey(d: DateInput) {
  return format(toDate(d), "yyyy-MM-dd");
}

/** Platte tekst uit inline HTML, voor voorbeelden. */
export function plainText(html: string) {
  return html
    .replace(/<br\s*\/?>/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}
