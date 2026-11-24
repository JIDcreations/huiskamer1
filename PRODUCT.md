# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Psychologists in a Flemish private practice** (primary audience for the look right now: they are the buyers who decide whether to adopt it). They work at a desk between sessions, on desktop or tablet, keeping an overview of 10 to 40 clients: today's appointments, what clients shared since the last session, session pages, private notes, assignments, invoices.
- **Their clients** (daily users). Adults in therapy who use it on laptop or phone, often in the evening, to check in, do an assignment, write in their logbook and prepare the next session.

## Product Purpose

One shared place for psychologist and client: appointments, payments, assignments, a logbook and a shared writing space, so the psychologist can follow along between sessions without a chat. Success: a psychologist sees in the demo that "Tussen de sessies" gives them something no agenda tool does, and a client keeps writing because it feels like their own place.

## Positioning

It thinks in time, not features: Vandaag (what do I do today), Logboek (how was my week), Sessies (what did we discuss, what do we take along). No chat, no read receipts, no pressure to answer. Every logbook entry is either shared with the psychologist or private, and private things never show up on the other side, not even as a count.

## Operating Context

- Phase 1 is a clickable prototype with mock data (Next.js 16, Tailwind 4, Tiptap, Zustand). No backend, real login or payments yet.
- Belgian context: Bancontact/Mollie later, mutualiteit attest, Zelfmoordlijn 1813 and Tele-Onthaal 106 always reachable via "Hulp nodig?".
- Demo is shown to psychologists, switching between the client and psychologist role.

## Capabilities and Constraints

- Online platform, not an app: both roles share one shell (sidebar + top bar).
- Components only talk to `src/lib/data`, never to `src/lib/mock`.
- Private logbook entries and session notes never appear for the other party.
- Assignment rhythms: Elke dag, vaste dagen, x per week, eenmalig. Missed assignments disappear silently: no red, no backlog, no counters.
- Tests (`npm run test:demo`, `npm run test:layout`) must keep passing.

## Brand Commitments

- Name: **Huiskamer**. This is the only binding brand element; logo, palette, type and photography are open for replacement (decided 24 Nov 2026).
- Copy: Dutch (Flemish), je/jij, short and warm. No emoji, no decorative icons, no em dashes.
- Must not feel clinical, loud or techy. Playfulness is not ruled out.

## Evidence on Hand

- Demo data: 1 psychologist (Sarah Peeters, Praktijk De Linde, Gent), 8 fictional Flemish clients with three weeks of sessions, logbook entries and invoices, generated around today.
- No real testimonials, customers or usage numbers exist. Do not invent them.

## Product Principles

1. Time over features: three places for the client, never more.
2. No pressure: no chat, no streaks, no guilt in empty states.
3. Privacy is visible: what is shared and what is not is always clear, in the same place.
4. The psychologist reads, the client writes: the interface serves reflection, not throughput.

## Accessibility & Inclusion

Small text meets WCAG AA. Status is shown with color and shape together. Keyboard and focus states throughout. Works at 375, 768 and 1440px.
