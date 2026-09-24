"use client";

import { use } from "react";
import { Dossier } from "@/components/psy/dossier/dossier";

export default function Page({ params }: { params: Promise<{ id: string; pageId: string }> }) {
  const { id, pageId } = use(params);
  return <Dossier clientId={id} tab="tafel" pageId={pageId} />;
}
