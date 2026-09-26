"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { EmergencyLink } from "@/components/emergency";
import { ReminderPicker } from "@/components/shared/reminder-picker";
import { ShareIcon, shareText } from "@/components/shared/share";
import { Button } from "@/components/ui/button";
import { actions, useCurrentClient, usePrefs, usePsychologist } from "@/lib/data";
import { cn } from "@/lib/utils";

/** Drie korte schermen bij de eerste keer. Overslaan kan altijd. */
export default function Welkom() {
  const router = useRouter();
  const psy = usePsychologist();
  const client = useCurrentClient();
  const prefs = usePrefs();
  const [step, setStep] = useState(0);

  function finish() {
    actions.updatePrefs({ onboarded: true });
    router.replace("/c/vandaag");
  }

  const steps = [
    {
      title: `Welkom, ${client.firstName}`,
      body: (
        <>
          <p>Een rustige plek voor jou en {psy.firstName}, tussen de sessies door.</p>
          <ul className="mt-6 flex flex-col gap-3 text-[15px]">
            {[
              ["Vandaag", "Hoe het gaat, en wat je vandaag doet."],
              ["Logboek", "Alles wat je schrijft, op één plek."],
              ["Sessies", "Wat jullie bespraken, en wat je wil meenemen."],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-taupe" />
                <span>
                  <span className="font-medium text-text">{t}.</span> {d}
                </span>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      title: `Wat ziet ${psy.firstName}?`,
      body: (
        <>
          <p>Bij alles wat je schrijft, zie je of het gedeeld is. Standaard is het gedeeld, en je kan het altijd per entry aanpassen.</p>
          <div className="mt-6 flex flex-col gap-2">
            {[true, false].map((shared) => (
              <div key={String(shared)} className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3 ring-1 ring-surface-2/80">
                <ShareIcon shared={shared} className="size-4" />
                <span className="min-w-0">
                  <span className="block text-[15px] font-medium text-text">{shareText(shared, psy.firstName)}</span>
                  <span className="block text-[13px]">{shared ? `${psy.firstName} kan het lezen.` : `${psy.firstName} ziet het niet, ook niet dat het bestaat.`}</span>
                </span>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      title: "Een seintje?",
      body: (
        <>
          <p>Wil je een herinnering voor je check-in? Kan ook later, onder je naam rechtsboven.</p>
          <div className="mt-6 rounded-xl bg-surface px-4 py-4 ring-1 ring-surface-2/80">
            <ReminderPicker value={prefs.checkinReminder} onChange={(v) => actions.updatePrefs({ checkinReminder: v })} />
          </div>
        </>
      ),
    },
  ];

  const last = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-bg">
      <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col px-6 pb-[max(env(safe-area-inset-bottom),24px)] pt-6 md:justify-center md:pt-0">
        <div className="flex items-center justify-between">
          <ol aria-label={`Stap ${step + 1} van ${steps.length}`} className="flex gap-1.5">
            {steps.map((_, i) => (
              <li key={i} className={cn("h-1 rounded-full transition-all duration-300", i === step ? "w-6 bg-accent" : "w-1.5 bg-surface-2")} />
            ))}
          </ol>
          <div className="flex items-center gap-1">
            <EmergencyLink />
            {!last && (
              <Button variant="quiet" size="sm" onClick={finish}>
                Overslaan
              </Button>
            )}
          </div>
        </div>

        <div className="mt-12 flex-1 md:mt-10 md:flex-none">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="type-hero">{steps[step].title}</h1>
              <div className="mt-4 text-[16px] leading-relaxed text-muted">{steps[step].body}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center justify-between gap-3">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              Terug
            </Button>
          ) : (
            <span />
          )}
          <Button size="lg" onClick={() => (last ? finish() : setStep((s) => s + 1))}>
            {last ? "Aan de slag" : "Volgende"}
          </Button>
        </div>
      </div>
    </div>
  );
}
