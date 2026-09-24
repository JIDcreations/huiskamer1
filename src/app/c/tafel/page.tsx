"use client";

import { TafelWorkspace } from "@/components/tafel/workspace";
import { CURRENT_CLIENT_ID, PSY_ID } from "@/lib/data";

export default function Page() {
  return (
    <TafelWorkspace clientId={CURRENT_CLIENT_ID} viewer={{ id: CURRENT_CLIENT_ID, role: "client" }} otherId={PSY_ID} basePath="/c/tafel" />
  );
}
