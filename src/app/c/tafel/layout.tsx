"use client";

import { PageHeader } from "@/components/page-header";
import { TafelIntro } from "@/components/tafel/workspace";
import { usePsychologist } from "@/lib/data";

export default function TafelLayout({ children }: { children: React.ReactNode }) {
  const psy = usePsychologist();
  return (
    <>
      <PageHeader title="Tafel" />
      <TafelIntro other={psy.firstName} />
      <div className="mt-8">{children}</div>
    </>
  );
}
