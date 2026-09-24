import { Placeholder } from "@/components/placeholder";
import { formatLongDate } from "@/lib/format";

export default function Page() {
  return <Placeholder eyebrow={formatLongDate(new Date())} title="Vandaag" note="Rustige lijst van vandaag" step={6} />;
}
