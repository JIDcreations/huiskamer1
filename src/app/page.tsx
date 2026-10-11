"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { beelden } from "@/lib/beelden";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Mark } from "@/components/shell/platform-shell";
import { RoleSwitch, type Role } from "@/components/role-switch";
import { DemoReset } from "@/components/demo-reset";
import { Toaster } from "@/components/ui/toast";

const demo: Record<Role, { email: string; home: string }> = {
  client: { email: "lotte.janssens@voorbeeld.be", home: "/c/vandaag" },
  psy: { email: "sarah@praktijkdelinde.be", home: "/p/vandaag" },
};

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("client");

  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col px-5 py-8 md:px-12 lg:py-10">
        <div className="flex items-center gap-2.5">
          <Mark className="size-9" />
          <span className="font-display text-[21px] leading-none">Huiskamer</span>
        </div>

        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">
          <p className="mb-3 text-[13px] font-medium text-clay-ink">Welkom terug</p>
          <h1 className="type-hero">Een rustige plek, ook tussen de sessies door.</h1>
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

      <div className="relative isolate m-3 hidden overflow-hidden rounded-[32px] bg-pine-deep lg:block">
        <Image
          src={beelden.login.src}
          alt={beelden.login.alt}
          placeholder="blur"
          priority
          fill
          sizes="55vw"
          className="-z-20 object-cover"
        />
        <div aria-hidden className="photo-veil absolute inset-0 -z-10" />
        <figure className="absolute inset-x-10 bottom-10 max-w-md text-on-accent">
          <p className="font-display text-[32px] leading-[1.08]">Schrijf wanneer het past. Deel enkel wat je wil delen.</p>
          <figcaption className="mt-4 flex items-center gap-2 text-[14px] text-on-accent/80">
            <span aria-hidden className="size-2 rounded-full bg-sun" />
            Wat je voor jezelf houdt, ziet niemand anders.
          </figcaption>
        </figure>
      </div>
      <Toaster />
    </main>
  );
}
