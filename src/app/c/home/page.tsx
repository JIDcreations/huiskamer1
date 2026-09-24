import { Placeholder } from "@/components/placeholder";
import { formatLongDate } from "@/lib/format";

export default function Page() {
  return <Placeholder eyebrow={formatLongDate(new Date())} title="Goeiemorgen, Lotte" note="Je overzicht, rustig op een rij" step={5} />;
}
