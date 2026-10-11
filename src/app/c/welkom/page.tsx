"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { beelden } from "@/lib/beelden";
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
      image: beelden.lelie,
      title: `Welkom, ${client.firstName}`,
      body: (
        <>
          <p>Een rustige plek voor jou en {psy.firstName}, tussen de sessies door.</p>
          <ul className="mt-6 flex flex-col gap-3 text-[15px]">
            {[
              ["Vandaag", "Hoe het gaat, en wat je vandaag doet.", "bg-sun"],
              ["Logboek", "Alles wat je schrijft, op één plek.", "bg-clay"],
              ["Sessies", "Wat jullie bespraken, en wat je wil meenemen.", "bg-pine"],
            ].map(([t, d, dot]) => (
              <li key={t} className="flex gap-3">
                <span aria-hidden className={cn("mt-2 size-2.5 shrink-0 rounded-full", dot)} />
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
      image: beelden.groen,
      title: `Wat ziet ${psy.firstName}?`,
      body: (
        <>
          <p>Bij alles wat je schrijft, zie je of het gedeeld is. Standaard is het gedeeld, en je kan het altijd per entry aanpassen.</p>
          <div className="mt-6 flex flex-col gap-2">
            {[true, false].map((shared) => (
              <div key={String(shared)} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 ring-1 ring-edge">
                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", shared ? "bg-moss text-pine" : "bg-clay-soft text-clay-ink")}>
                  <ShareIcon shared={shared} className="size-4" />
                </span>
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
      image: beelden.thee,
      title: "Een seintje?",
      body: (
        <>
          <p>Wil je een herinnering voor je check-in? Kan ook later, onder je naam rechtsboven.</p>
          <div className="mt-6 rounded-2xl bg-surface px-4 py-4 ring-1 ring-edge">
            <ReminderPicker value={prefs.checkinReminder} onChange={(v) => actions.updatePrefs({ checkinReminder: v })} />
          </div>
        </>
      ),
    },
  ];

  const last = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[60] grid overflow-y-auto bg-bg lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="relative isolate order-first m-3 hidden overflow-hidden rounded-[32px] bg-pine-deep lg:order-last lg:block">
        <AnimatePresence initial={false}>
          <motion.div
            key={step}
            className="absolute inset-0 -z-10"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image src={steps[step].image.src} alt={steps[step].image.alt} placeholder="blur" fill sizes="50vw" className="object-cover" priority />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col px-6 pb-[max(env(safe-area-inset-bottom),24px)] pt-6 md:justify-center md:pt-0">
        <div className="flex items-center justify-between">
          <ol aria-label={`Stap ${step + 1} van ${steps.length}`} className="flex gap-1.5">
            {steps.map((_, i) => (
              <li key={i} className={cn("h-1 rounded-full transition-all duration-300", i === step ? "w-8 bg-clay" : i < step ? "w-1.5 bg-pine" : "w-1.5 bg-surface-2")} />
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

        <div className="relative mt-6 h-40 overflow-hidden rounded-[24px] bg-pine-deep lg:hidden">
          <Image src={steps[step].image.src} alt="" placeholder="blur" fill sizes="100vw" className="object-cover" />
        </div>

        <div className="mt-8 flex-1 md:mt-10 md:flex-none">
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
