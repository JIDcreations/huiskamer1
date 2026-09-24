"use client";

import { Suspense, use } from "react";
import { useSearchParams } from "next/navigation";
import { Dossier, dossierTabs, type DossierTab } from "@/components/psy/dossier/dossier";

function WithTab({ id }: { id: string }) {
  const q = useSearchParams().get("tab");
  const tab = (dossierTabs.find((t) => t.id === q)?.id ?? "overzicht") as DossierTab;
  return <Dossier clientId={id} tab={tab} />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense>
      <WithTab id={id} />
    </Suspense>
  );
}
