"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { beelden, type Beeld } from "@/lib/beelden";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Mark, Wordmark } from "@/components/shell/platform-shell";
import { RoleSwitch, type Role } from "@/components/role-switch";
import { DemoReset } from "@/components/demo-reset";
import { Toaster } from "@/components/ui/toast";

const demo: Record<Role, { email: string; home: string }> = {
  client: { email: "lotte.janssens@voorbeeld.be", home: "/c/vandaag" },
  psy: { email: "sarah@praktijkdelinde.be", home: "/p/vandaag" },
};

function Pin({ beeld, className, priority }: { beeld: Beeld; className?: string; priority?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[22px] bg-surface-2", className)}>
      <Image src={beeld.src} alt={beeld.alt} placeholder="blur" priority={priority} fill sizes="28vw" className="photo-grade object-cover" />
    </div>
  );
}

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("client");

  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col px-5 py-8 md:px-12 lg:py-10">
        <div className="flex items-center gap-2.5">
          <Mark className="size-8" />
          <Wordmark className="text-[28px]" />
        </div>

        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">
          <h1 className="type-hero">
            Een rustige plek, <span className="text-sun-ink">ook tussen de sessies door.</span>
          </h1>
          <p className="mt-4 text-[16px] text-muted">Afspraken, opdrachten en je logboek, samen met je psycholoog.</p>

          <form
            className="mt-9"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(demo[role].home);
            }}
          >
            <RoleSwitch value={role} onChange={setRole} className="flex w-full" />

            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" key={role} defaultValue={demo[role].email} autoComplete="username" />
              </div>
              <div>
                <Label htmlFor="wachtwoord">Wachtwoord</Label>
                <Input id="wachtwoord" type="password" defaultValue="demodemo" autoComplete="current-password" />
              </div>
            </div>

            <Button type="submit" size="lg" className="mt-7 w-full">
              Aanmelden
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-[13px] text-faint">
            <p>Demo. Je kan aanmelden zonder echte gegevens.</p>
            <DemoReset />
          </div>
        </div>
      </div>

      {/* Een moodboard: beelden als pins in twee kolommen, met één geschreven kaart ertussen. */}
      <div className="relative hidden overflow-hidden border-l border-edge bg-side p-6 lg:block">
        <div className="grid h-full grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <Pin beeld={beelden.pampas} className="h-[58%] rounded-t-full" priority />
            <figure className="rounded-[22px] bg-surface p-7 shadow-[0_0_0_1px_var(--edge)]">
              <p className="font-display text-[30px] leading-[1.08]">
                Schrijf wanneer het past. <span className="text-sun-ink">Deel enkel wat je wil delen.</span>
              </p>
              <figcaption className="mt-4 text-[14px] text-muted">Wat je voor jezelf houdt, ziet niemand anders.</figcaption>
            </figure>
            <Pin beeld={beelden.schaduw} className="min-h-0 flex-1" />
          </div>
          <div className="-mt-16 flex flex-col gap-4">
            <Pin beeld={beelden.latte} className="h-[44%]" priority />
            <Pin beeld={beelden.ochtend} className="h-[36%] rounded-t-full" />
            <Pin beeld={beelden.linnen} className="min-h-0 flex-1" />
          </div>
        </div>
      </div>
      <Toaster />
    </main>
  );
}
