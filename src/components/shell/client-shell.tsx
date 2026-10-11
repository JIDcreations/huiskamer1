"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { EmergencyLink } from "@/components/emergency";
import { Avatar } from "@/components/ui/avatar";
import { PlatformShell } from "@/components/shell/platform-shell";
import { useHydrateStore, usePrefs, usePsychologist, useCurrentClient } from "@/lib/data";
import { clientMenu, clientNav, clientTabs } from "@/lib/nav";

/** De eerste keer: eerst de onboarding. */
function OnboardingGate() {
  const ready = useHydrateStore();
  const prefs = usePrefs();
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (ready && !prefs.onboarded && pathname !== "/c/welkom") router.replace("/c/welkom");
  }, [ready, prefs.onboarded, pathname, router]);
  return null;
}

/** Wie je psycholoog is en hoe je haar bereikt, rustig onderaan de zijbalk. */
function PsyCard() {
  const psy = usePsychologist();
  return (
    <div className="rounded-[20px] bg-side-hover p-4 ring-1 ring-inset ring-white/5">
      <div className="flex items-center gap-3">
        <Avatar name={psy.name} tone="psy" size="md" className="bg-sun text-ink" />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[14px] font-semibold text-side-text">{psy.name}</p>
          <p className="mt-0.5 truncate text-[12px] text-side-muted">{psy.practiceName}</p>
        </div>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-side-muted">{psy.address}</p>
      <a href={`tel:${psy.phone.replace(/\s/g, "")}`} className="mt-1 inline-block text-[12px] font-semibold text-side-text underline decoration-white/25 underline-offset-4 hover:decoration-sun">
        {psy.phone}
      </a>
    </div>
  );
}

export function ClientShell({ children }: { children: React.ReactNode }) {
  const psy = usePsychologist();
  const client = useCurrentClient();
  return (
    <PlatformShell
      homeHref="/c/vandaag"
      context={`Bij ${psy.name}`}
      nav={clientNav}
      footerNav={[]}
      sidebarFooter={<PsyCard />}
      mobileTabs={clientTabs}
      user={{ name: `${client.firstName} ${client.lastName}`, subtitle: `Cliënt bij ${psy.name}`, tone: "client", menu: clientMenu }}
      topbarEnd={<EmergencyLink />}
    >
      <OnboardingGate />
      {children}
    </PlatformShell>
  );
}
