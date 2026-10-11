import { Badge } from "@/components/ui/badge";
import type { ClientStatus } from "@/lib/types";

export const clientStatusLabel: Record<ClientStatus, string> = { actief: "Actief", gepauzeerd: "Gepauzeerd", afgerond: "Afgerond" };

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <Badge tone={status === "actief" ? "calm" : status === "gepauzeerd" ? "sun" : "neutral"} dot={status === "actief"}>
      {clientStatusLabel[status]}
    </Badge>
  );
}
