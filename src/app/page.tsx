"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { RoleSwitch, type Role } from "@/components/role-switch";

const demo: Record<Role, { email: string; home: string }> = {
  client: { email: "lotte.janssens@voorbeeld.be", home: "/c/home" },
  psy: { email: "sarah@praktijkdelinde.be", home: "/p/vandaag" },
};

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("client");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-[380px]">
        <div className="flex flex-col items-center text-center">
          <span
            aria-hidden
            className="flex size-11 items-center justify-center rounded-xl bg-accent text-[20px] font-semibold text-on-accent"
          >
            H
          </span>
          <h1 className="font-display mt-5 text-[28px] leading-tight">Aanmelden bij Huiskamer</h1>
          <p className="mt-2 text-[15px] text-muted">Het platform van je praktijk, ook tussen de sessies door.</p>
        </div>

        <form
          className="mt-10 rounded-sheet bg-surface p-6 shadow-soft ring-1 ring-inset ring-surface-2/60 md:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(demo[role].home);
          }}
        >
          <RoleSwitch value={role} onChange={setRole} className="flex w-full" />

          <div className="mt-7 space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" key={role} defaultValue={demo[role].email} autoComplete="off" />
            </div>
            <div>
              <Label htmlFor="wachtwoord">Wachtwoord</Label>
              <Input id="wachtwoord" type="password" defaultValue="demodemo" autoComplete="off" />
            </div>
          </div>

          <Button type="submit" size="lg" className="mt-7 w-full">
            Aanmelden
          </Button>
        </form>

        <p className="mt-6 text-center text-[13px] text-faint">Demo. Je kan inloggen zonder echte gegevens.</p>
      </div>
    </main>
  );
}
