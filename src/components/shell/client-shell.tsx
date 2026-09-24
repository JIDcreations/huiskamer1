"use client";

import { EmergencyLink } from "@/components/emergency";
import { PlatformShell } from "@/components/shell/platform-shell";
import { clientNav, clientNavFooter } from "@/lib/nav";

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <PlatformShell
      homeHref="/c/home"
      context="Bij Sarah Peeters"
      nav={clientNav}
      footerNav={clientNavFooter}
      user={{ name: "Lotte Janssens", subtitle: "Cliënt bij Sarah Peeters", tone: "client", menu: clientNavFooter }}
      topbarEnd={<EmergencyLink />}
    >
      {children}
    </PlatformShell>
  );
}
