"use client";

import { use } from "react";
import Link from "next/link";
import { SessionView } from "@/components/sessions/session-view";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CURRENT_CLIENT_ID, useAppointment } from "@/lib/data";

export default function Sessie({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const appointment = useAppointment(id);

  if (!appointment || appointment.clientId !== CURRENT_CLIENT_ID) {
    return (
      <div className="rounded-card bg-surface shadow-soft ring-1 ring-surface-2/60">
        <EmptyState
          title="Deze sessie vind je hier niet"
          action={
            <Button asChild variant="secondary">
              <Link href="/c/sessies">Naar je sessies</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return <SessionView appointmentId={id} viewer="client" backHref="/c/sessies" entryHref={(e) => `/c/logboek/${e}`} />;
}
