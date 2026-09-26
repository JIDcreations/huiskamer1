"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { MoodPicker, moodLabel } from "@/components/shared/mood";
import { ShareSwitch } from "@/components/shared/share";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { actions, excerpt, usePrefs } from "@/lib/data";
import type { ID, JournalEntry, Mood } from "@/lib/types";

/**
 * "Hoe gaat het vandaag?" Opslaan maakt een check-in in het logboek.
 * Al gedaan vandaag: een compacte samenvatting met een link om aan te vullen.
 */
export function CheckIn({ clientId, today }: { clientId: ID; today?: JournalEntry }) {
  const prefs = usePrefs();
  const [editing, setEditing] = useState(false);
  const [mood, setMood] = useState<Mood | undefined>(today?.mood);
  const [text, setText] = useState("");
  const [shared, setShared] = useState(today?.sharedWithPsychologist ?? prefs.defaultShare);

  const open = !today || editing;

  function save() {
    if (!mood) return;
    actions.saveCheckin(clientId, { mood, text, shared });
    toast(today ? "Aangevuld" : "Bewaard in je logboek");
    setText("");
    setEditing(false);
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {open ? (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-[15px] font-semibold tracking-tight">Hoe gaat het vandaag?</h2>
          <p className="mt-0.5 text-[13px] text-muted">Een woord is genoeg.</p>
          <MoodPicker className="mt-4" value={mood} onChange={setMood} />
          <AnimatePresence initial={false}>
            {mood && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <Textarea
                  className="mt-4"
                  rows={2}
                  aria-label="Wil je er iets bij zeggen?"
                  placeholder="Wil je er iets bij zeggen? Hoeft niet."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <ShareSwitch shared={shared} onChange={setShared} className="min-w-0 flex-1" />
                  <div className="flex gap-2">
                    {today && (
                      <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                        Annuleren
                      </Button>
                    )}
                    <Button size="sm" onClick={save}>
                      Bewaren
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          key="done"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div className="min-w-0">
            <p className="text-[15px]">
              <span className="text-muted">Vandaag: </span>
              <span className="font-medium">{moodLabel(today!.mood)}</span>
            </p>
            {today!.blocks.length > 0 && <p className="mt-0.5 truncate text-[13px] text-muted">{excerpt(today!.blocks, 90)}</p>}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="quiet" size="sm" asChild>
              <Link href={`/c/logboek/${today!.id}`}>Bekijken</Link>
            </Button>
            <Button variant="soft" size="sm" onClick={() => setEditing(true)}>
              Aanvullen
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
