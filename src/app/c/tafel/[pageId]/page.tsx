"use client";

import { use } from "react";
import { TafelWorkspace } from "@/components/tafel/workspace";
import { CURRENT_CLIENT_ID, PSY_ID } from "@/lib/data";

export default function Page({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = use(params);
  return (
    <TafelWorkspace
      clientId={CURRENT_CLIENT_ID}
      viewer={{ id: CURRENT_CLIENT_ID, role: "client" }}
      otherId={PSY_ID}
      pageId={pageId}
      basePath="/c/tafel"
    />
  );
}
