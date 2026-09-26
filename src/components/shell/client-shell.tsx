"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { EmergencyLink } from "@/components/emergency";
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

export function ClientShell({ children }: { children: React.ReactNode }) {
  const psy = usePsychologist();
  const client = useCurrentClient();
  return (
    <PlatformShell
      homeHref="/c/vandaag"
      context={`Bij ${psy.name}`}
      nav={clientNav}
      footerNav={[]}
      mobileTabs={clientTabs}
      user={{ name: `${client.firstName} ${client.lastName}`, subtitle: `Cliënt bij ${psy.name}`, tone: "client", menu: clientMenu }}
      topbarEnd={<EmergencyLink />}
    >
      <OnboardingGate />
      {children}
    </PlatformShell>
  );
}
