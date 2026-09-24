import { format } from "date-fns";
import { nlBE } from "date-fns/locale";

export function formatLongDate(date: Date) {
  return format(date, "EEEE d MMMM", { locale: nlBE });
}
