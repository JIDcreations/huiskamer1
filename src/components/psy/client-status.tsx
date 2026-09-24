import { Badge } from "@/components/ui/badge";
import type { ClientStatus } from "@/lib/types";

export const clientStatusLabel: Record<ClientStatus, string> = { actief: "Actief", gepauzeerd: "Gepauzeerd", afgerond: "Afgerond" };

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <Badge tone={status === "actief" ? "neutral" : status === "gepauzeerd" ? "outline" : "calm"} dot={status === "actief"}>
      {clientStatusLabel[status]}
    </Badge>
  );
}
