import { addDays, addMinutes, format, setHours, setMinutes, startOfDay, startOfWeek } from "date-fns";
import type {
  Appointment,
  Block,
  Client,
  Invoice,
  JournalEntry,
  Psychologist,
  SessionNote,
  TablePage,
  Task,
  TaskEntry,
  TaskTemplate,
} from "@/lib/types";

export const PSY_ID = "p1";
export const CURRENT_CLIENT_ID = "c1";

export type Database = {
  psychologist: Psychologist;
  clients: Client[];
  appointments: Appointment[];
  tablePages: TablePage[];
  journal: JournalEntry[];
  sessionNotes: SessionNote[];
  templates: TaskTemplate[];
  tasks: Task[];
  taskEntries: TaskEntry[];
  invoices: Invoice[];
};

/** Deterministisch "toeval", zodat de demo elke keer hetzelfde voelt. */
function chance(seed: string, p: number) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000 < p;
}

export function seed(now = new Date()): Database {
  const today = startOfDay(now);
  const iso = (d: Date) => d.toISOString();
  const hoursAgo = (h: number) => iso(addMinutes(now, -h * 60));
  const day = (offset: number) => format(addDays(today, offset), "yyyy-MM-dd");

  let blockCounter = 0;
  const block = (type: Block["type"], content: string, authorId: string, updatedAt: string, extra: Partial<Block> = {}): Block => ({
    id: `sb${++blockCounter}`,
    type,
    content,
    authorId,
    updatedAt,
    ...extra,
  });
  const P = (c: string, a: string, t: string) => block("paragraph", c, a, t);
  const H = (c: string, a: string, t: string, level: 2 | 3 = 2) => block("heading", c, a, t, { level });
  const C = (c: string, checked: boolean, a: string, t: string) => block("checklist", c, a, t, { checked });
  const Q = (c: string, a: string, t: string) => block("quote", c, a, t);
  const HR = (a: string, t: string) => block("divider", "", a, t);

  // ---------------------------------------------------------------- Praktijk

  const psychologist: Psychologist = {
    id: PSY_ID,
    name: "Sarah Peeters",
    firstName: "Sarah",
    practiceName: "Praktijk De Linde",
    email: "sarah@praktijkdelinde.be",
    phone: "0470 12 34 56",
    address: "Lindestraat 14, 9000 Gent",
    hourlyRate: 75,
    sessionMinutes: 50,
    cancellationHours: 24,
    availability: [
      { weekday: 1, start: "09:00", end: "17:00" },
      { weekday: 2, start: "09:00", end: "17:00" },
      { weekday: 3, start: "13:00", end: "19:00" },
      { weekday: 4, start: "09:00", end: "17:00" },
      { weekday: 5, start: "09:00", end: "13:00" },
    ],
  };

  const started = (daysAgo: number) => iso(addDays(today, -daysAgo));

  const clients: Client[] = [
    { id: "c1", firstName: "Lotte", lastName: "Janssens", email: "lotte.janssens@voorbeeld.be", phone: "0485 22 31 90", birthDate: "1997-03-14", status: "actief", startedAt: started(70), psychologistId: PSY_ID, reason: "Piekeren en slecht slapen, drukke job in de zorg." },
    { id: "c2", firstName: "Arne", lastName: "Maes", email: "arne.maes@voorbeeld.be", phone: "0472 81 40 12", birthDate: "1988-11-02", status: "actief", startedAt: started(120), psychologistId: PSY_ID, reason: "Rouw na het overlijden van zijn vader." },
    { id: "c3", firstName: "Fien", lastName: "Wouters", email: "fien.wouters@voorbeeld.be", phone: "0496 55 18 73", birthDate: "2003-06-21", status: "actief", startedAt: started(45), psychologistId: PSY_ID, reason: "Faalangst rond examens." },
    { id: "c4", firstName: "Jonas", lastName: "De Smet", email: "jonas.desmet@voorbeeld.be", phone: "0478 09 66 21", birthDate: "1981-01-30", status: "actief", startedAt: started(200), psychologistId: PSY_ID, reason: "Burn-out, re-integratie op het werk." },
    { id: "c5", firstName: "Elise", lastName: "Vermeulen", email: "elise.vermeulen@voorbeeld.be", phone: "0491 44 02 58", birthDate: "1994-09-08", status: "actief", startedAt: started(30), psychologistId: PSY_ID, reason: "Paniekaanvallen, vooral op de trein." },
    { id: "c6", firstName: "Robbe", lastName: "Claes", email: "robbe.claes@voorbeeld.be", phone: "0468 37 90 14", birthDate: "1999-12-11", status: "actief", startedAt: started(16), psychologistId: PSY_ID, reason: "Somberheid, weinig energie sinds de winter." },
    { id: "c7", firstName: "Nora", lastName: "Willems", email: "nora.willems@voorbeeld.be", phone: "0487 63 25 47", birthDate: "1990-04-17", status: "gepauzeerd", startedAt: started(150), psychologistId: PSY_ID, reason: "Relatieproblemen." },
    { id: "c8", firstName: "Tom", lastName: "Jacobs", email: "tom.jacobs@voorbeeld.be", phone: "0475 18 72 36", birthDate: "1985-07-25", status: "afgerond", startedAt: started(300), psychologistId: PSY_ID, reason: "Stress en perfectionisme." },
  ];

  // ---------------------------------------------------------------- Afspraken

  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const todayIdx = Math.min((today.getDay() + 6) % 7, 4);
  const appointments: Appointment[] = [];

  const schedule: { clientId: string; offset: number; time: string; mode: Appointment["mode"]; biweekly?: boolean; weeks?: number[] }[] = [
    { clientId: "c1", offset: 2, time: "14:00", mode: "fysiek" },
    { clientId: "c2", offset: 0, time: "09:30", mode: "fysiek" },
    { clientId: "c3", offset: 0, time: "11:00", mode: "online" },
    { clientId: "c4", offset: 1, time: "10:00", mode: "fysiek", biweekly: true },
    { clientId: "c5", offset: 0, time: "15:30", mode: "fysiek" },
    { clientId: "c6", offset: 3, time: "16:00", mode: "online" },
    { clientId: "c7", offset: 4, time: "13:30", mode: "fysiek", weeks: [-3] },
  ];

  for (const s of schedule) {
    const client = clients.find((c) => c.id === s.clientId)!;
    let first = true;
    for (let w = -3; w <= 2; w++) {
      if (s.biweekly && w % 2 !== 0) continue;
      if (s.weeks && !s.weeks.includes(w)) continue;
      const dayIdx = (todayIdx + s.offset) % 5;
      const [h, m] = s.time.split(":").map(Number);
      const start = setMinutes(setHours(addDays(weekStart, w * 7 + dayIdx), h), m);
      if (start < new Date(client.startedAt)) continue;
      const end = addMinutes(start, psychologist.sessionMinutes);
      let status: Appointment["status"] = end < now ? "voltooid" : "gepland";
      if (s.clientId === "c2" && w === -2) status = "no-show";
      if (s.clientId === "c3" && w === -1) status = "geannuleerd";
      appointments.push({
        id: `a-${s.clientId}-${w + 3}`,
        clientId: s.clientId,
        start: iso(start),
        end: iso(end),
        type: first && s.clientId === "c6" ? "intake" : "opvolging",
        mode: s.mode,
        status,
      });
      first = false;
    }
  }
  appointments.sort((a, b) => a.start.localeCompare(b.start));

  // ---------------------------------------------------------------- Facturen

  const invoices: Invoice[] = [];
  let invoiceNo = 131;
  for (const a of appointments) {
    if (a.status !== "voltooid" && a.status !== "no-show") continue;
    const issued = new Date(a.end);
    const age = (now.getTime() - issued.getTime()) / 86_400_000;
    const isLatest = !appointments.some(
      (b) => b.clientId === a.clientId && b.start > a.start && (b.status === "voltooid" || b.status === "no-show")
    );
    let status: Invoice["status"] = age > 10 ? "betaald" : isLatest ? "open" : "betaald";
    if (a.clientId === "c2" && a.status === "no-show") status = "vervallen";
    invoices.push({
      id: `f-${a.id}`,
      number: `${now.getFullYear()}-0${invoiceNo++}`,
      clientId: a.clientId,
      appointmentId: a.id,
      amount: psychologist.hourlyRate,
      issuedAt: a.end,
      dueAt: iso(addDays(issued, 14)),
      status,
      paidAt: status === "betaald" ? iso(addDays(issued, 3)) : undefined,
      attestUrl: status === "betaald" ? "#" : undefined,
    });
  }

  // ---------------------------------------------------------------- Tafel

  const lotteSessions = appointments.filter((a) => a.clientId === "c1" && a.status === "voltooid");
  const lastSession = lotteSessions[lotteSessions.length - 1];
  const prevSession = lotteSessions[lotteSessions.length - 2] ?? lastSession;
  const nlDate = (a: Appointment) =>
    new Intl.DateTimeFormat("nl-BE", { day: "numeric", month: "long" }).format(new Date(a.start));

  const tLast = iso(addMinutes(new Date(lastSession.end), 40));
  const tPrev = iso(addMinutes(new Date(prevSession.end), 30));

  const tablePages: TablePage[] = [
    {
      id: "tp1",
      clientId: "c1",
      title: "Vragen voor volgende keer",
      pinned: true,
      createdBy: "c1",
      createdAt: hoursAgo(24 * 20),
      updatedAt: hoursAgo(20),
      blocks: [
        P("Hier verzamel ik wat ik niet wil vergeten tegen de volgende sessie.", "c1", hoursAgo(24 * 20)),
        C("Hoe hou ik de wandelingen vol als het donkerder wordt?", false, "c1", hoursAgo(24 * 6)),
        C("Is het normaal dat ik na een goede dag toch slecht slaap?", true, "c1", hoursAgo(24 * 12)),
        C("Kunnen we het hebben over grenzen stellen op het werk?", false, "c1", hoursAgo(24 * 3)),
        C("Neem je slaaplogboek van deze week mee, dan kijken we samen naar het patroon.", false, PSY_ID, hoursAgo(20)),
      ],
    },
    {
      id: "tp2",
      clientId: "c1",
      title: `Na de sessie van ${nlDate(lastSession)}`,
      pinned: false,
      createdBy: PSY_ID,
      createdAt: tLast,
      updatedAt: hoursAgo(3),
      blocks: [
        H("Waar we het over hadden", PSY_ID, tLast),
        P("We spraken over de avonden, als het huis stil wordt en de gedachten luider. Je merkte dat <strong>even naar buiten gaan</strong> soms helpt, en dat je telefoon in de slaapkamer het moeilijker maakt.", PSY_ID, tLast),
        Q("Ik hoef niet alles vandaag op te lossen.", PSY_ID, tLast),
        H("Wat we afspraken", PSY_ID, tLast, 3),
        C("Drie avonden per week een korte wandeling", true, "c1", hoursAgo(26)),
        C("Telefoon buiten de slaapkamer laten", false, PSY_ID, tLast),
        C("Piekermoment van 15 minuten om 19u", false, PSY_ID, tLast),
        HR(PSY_ID, tLast),
        P("Woensdag lukte het wandelen niet, het regende. Wel <em>tien minuten</em> op het balkon gezeten. Telt dat ook?", "c1", hoursAgo(3)),
        P("En de telefoon ligt sinds zondag in de keuken. Eerste nacht was raar, nu went het.", "c1", hoursAgo(3)),
      ],
    },
    {
      id: "tp3",
      clientId: "c1",
      title: "Oefening: ademhaling 4-7-8",
      pinned: false,
      createdBy: PSY_ID,
      createdAt: hoursAgo(24 * 30),
      updatedAt: hoursAgo(24 * 30),
      blocks: [
        P("Een korte oefening voor wanneer je hoofd blijft malen. Doe ze liggend of zittend, ogen dicht als dat prettig voelt.", PSY_ID, hoursAgo(24 * 30)),
        H("Zo ga je te werk", PSY_ID, hoursAgo(24 * 30), 3),
        C("Adem 4 tellen in door je neus", false, PSY_ID, hoursAgo(24 * 30)),
        C("Hou je adem 7 tellen vast", false, PSY_ID, hoursAgo(24 * 30)),
        C("Adem 8 tellen uit door je mond", false, PSY_ID, hoursAgo(24 * 30)),
        P("Herhaal dat vier keer. Het hoeft niet perfect, het gaat om het vertragen.", PSY_ID, hoursAgo(24 * 30)),
      ],
    },
    {
      id: "tp4",
      clientId: "c1",
      title: `Na de sessie van ${nlDate(prevSession)}`,
      pinned: false,
      createdBy: PSY_ID,
      createdAt: tPrev,
      updatedAt: tPrev,
      blocks: [
        H("Waar we het over hadden", PSY_ID, tPrev),
        P("De drukte op het werk en het gevoel altijd bereikbaar te moeten zijn. We keken naar wat er gebeurt in je lijf als je collega's je na je shift nog berichten sturen.", PSY_ID, tPrev),
        H("Om mee te nemen", PSY_ID, tPrev, 3),
        C("Slaaplogboek bijhouden", true, "c1", tPrev),
        C("Opschrijven wanneer het piekeren begint", true, "c1", tPrev),
      ],
    },
    {
      id: "tp5",
      clientId: "c2",
      title: "Herinneringen aan papa",
      pinned: true,
      createdBy: "c2",
      createdAt: hoursAgo(24 * 40),
      updatedAt: hoursAgo(30),
      blocks: [
        P("Sarah vroeg om hier dingen te noteren die me aan hem doen denken.", "c2", hoursAgo(24 * 40)),
        P("De geur van zaagsel in de garage. Hoe hij floot als hij iets aan het repareren was.", "c2", hoursAgo(30)),
        P("Mooi dat je dit bijhoudt, Arne. We nemen er volgende keer een paar mee.", PSY_ID, hoursAgo(20)),
      ],
    },
    {
      id: "tp6",
      clientId: "c3",
      title: "Plan voor de examenweek",
      pinned: false,
      createdBy: PSY_ID,
      createdAt: hoursAgo(24 * 8),
      updatedAt: hoursAgo(5),
      blocks: [
        H("Een haalbare dag", PSY_ID, hoursAgo(24 * 8)),
        C("Blokken van 50 minuten, dan 10 minuten pauze", false, PSY_ID, hoursAgo(24 * 8)),
        C("Na 21u geen cursus meer", true, "c3", hoursAgo(5)),
        P("Gisteren voor het eerst om 21u gestopt. Voelde als spijbelen, maar ik sliep wel beter.", "c3", hoursAgo(5)),
      ],
    },
    {
      id: "tp7",
      clientId: "c6",
      title: "Welkom aan de Tafel",
      pinned: true,
      createdBy: PSY_ID,
      createdAt: hoursAgo(24 * 15),
      updatedAt: hoursAgo(24 * 15),
      blocks: [
        P("Dit is onze gedeelde pagina. Ik schrijf hier na een sessie wat we bespraken, jij mag er altijd iets bij zetten.", PSY_ID, hoursAgo(24 * 15)),
        C("Iets opschrijven over een dag die beter ging", false, PSY_ID, hoursAgo(24 * 15)),
      ],
    },
    {
      id: "tp8",
      clientId: "c4",
      title: "Opbouw werkuren",
      pinned: false,
      createdBy: PSY_ID,
      createdAt: hoursAgo(24 * 21),
      updatedAt: hoursAgo(24 * 6),
      blocks: [
        C("Week 1 en 2: halve dagen", true, "c4", hoursAgo(24 * 6)),
        C("Week 3: drie volle dagen", false, PSY_ID, hoursAgo(24 * 21)),
        C("Week 4: gesprek met leidinggevende", false, PSY_ID, hoursAgo(24 * 21)),
      ],
    },
    {
      id: "tp9",
      clientId: "c5",
      title: "Wat helpt op de trein",
      pinned: false,
      createdBy: "c5",
      createdAt: hoursAgo(24 * 10),
      updatedAt: hoursAgo(24 * 2),
      blocks: [
        P("Oordopjes en een podcast. Aan het raam zitten.", "c5", hoursAgo(24 * 10)),
        P("Probeer ook de 5-4-3-2-1 oefening: vijf dingen die je ziet, vier die je hoort.", PSY_ID, hoursAgo(24 * 2)),
      ],
    },
  ];

  // ---------------------------------------------------------------- Logboek

  const J = (
    id: string,
    clientId: string,
    hAgo: number,
    text: string[],
    opts: Partial<JournalEntry> = {}
  ): JournalEntry => ({
    id,
    clientId,
    createdAt: hoursAgo(hAgo),
    updatedAt: hoursAgo(hAgo),
    blocks: text.map((t) => P(t, clientId, hoursAgo(hAgo))),
    tags: [],
    sharedWithPsychologist: true,
    ...opts,
  });

  const journal: JournalEntry[] = [
    J("j1", "c1", 24 * 12 + 2, ["Zondagavond, en dat bekende gevoel in mijn buik. Morgen weer vroege shift. Ik lag tot half twee wakker."], { title: "Zondagavond", mood: 2, tags: ["slaap", "werk"] }),
    J("j2", "c1", 24 * 9 + 5, ["Na het werk een half uur gewandeld langs de Leie. Niet veel gedacht. Dat was fijn."], {
      mood: 3,
      tags: ["wandelen"],
      psychologistNote: { text: "Mooi dat je het merkt: niet veel denken is ook iets. Hou dat vast.", createdAt: hoursAgo(24 * 8) },
    }),
    J("j3", "c1", 24 * 6 + 3, ["Ruzie met mama aan de telefoon. Dit wil ik voorlopig voor mezelf houden."], { title: "Enkel voor mij", mood: 2, tags: ["familie"], sharedWithPsychologist: false }),
    J("j4", "c1", 24 * 4 + 1, ["Drie avonden op rij gewandeld. Sliep donderdag voor het eerst in weken door tot de wekker."], { mood: 4, tags: ["wandelen", "slaap"] }),
    J("j5", "c1", 24 * 2 + 6, ["Collega vroeg of ik zaterdag wilde overnemen. Ik zei dat ik erover zou nadenken in plaats van meteen ja. Klein, maar het voelde groot."], { title: "Nee zeggen, bijna", mood: 3, tags: ["werk"] }),
    J("j6", "c1", 24 + 4, ["Moe vandaag. Niet slecht, gewoon moe."], { mood: 3, tags: [], sharedWithPsychologist: false }),
    J("j7", "c1", 3.5, ["Rustige ochtend. Koffie op het balkon voor iedereen wakker was. Merk dat ik minder snel mijn telefoon pak."], { title: "Rustige ochtend", mood: 4, tags: ["ochtend"] }),
    J("j8", "c2", 24 * 3, ["Zijn verjaardag vandaag. Naar het kerkhof geweest met mijn zus. Minder zwaar dan ik dacht."], { mood: 3, tags: ["rouw"] }),
    J("j9", "c3", 6, ["Examen statistiek achter de rug. Handen trilden bij het begin, daarna ging het."], { mood: 4, tags: ["examen"] }),
    J("j10", "c5", 2, ["Vandaag de trein naar Brussel genomen, alleen. Halverwege even kort paniek, de oefening gedaan. Ik ben aangekomen."], { title: "Trein naar Brussel", mood: 4, tags: ["trein", "paniek"] }),
    J("j11", "c6", 24 * 5, ["Weinig zin in alles. Wel de afwas gedaan."], { mood: 2, tags: [] }),
    J("j12", "c4", 24 * 8, ["Eerste volle werkdag. Om 15u moest ik even naar buiten."], { mood: 3, tags: ["werk"], sharedWithPsychologist: false }),
  ];

  // ---------------------------------------------------------------- Opdrachten

  const templates: TaskTemplate[] = [
    { id: "tt1", title: "Ademhaling 4-7-8", description: "Vier tellen in, zeven vasthouden, acht uit. Vier keer herhalen.", kind: "meditatie", minutes: 5, defaultRecurrence: { every: "dag" } },
    { id: "tt2", title: "Gedachtenschema", description: "Beschrijf de situatie, je gedachte, je gevoel en wat je deed. Daarna: welke andere gedachte is ook mogelijk?", kind: "tekst" },
    { id: "tt3", title: "Dankbaarheidslijst", description: "Schrijf drie kleine dingen op waar je vandaag dankbaar voor bent.", kind: "tekst", defaultRecurrence: { every: "dag" } },
    { id: "tt4", title: "Slaaplogboek", description: "Hoe goed sliep je vannacht?", kind: "schaal", scaleLabel: "Slaapkwaliteit", defaultRecurrence: { every: "dag" } },
    { id: "tt5", title: "Meditatie 10 minuten", description: "Zit rustig, volg je adem. Afdwalen mag, gewoon terugkeren.", kind: "meditatie", minutes: 10, defaultRecurrence: { every: "dag" } },
    { id: "tt6", title: "Korte wandeling", description: "Twintig minuten buiten, zonder doel.", kind: "afvinken", defaultRecurrence: { every: "week", days: [1, 3, 5] } },
    { id: "tt7", title: "Piekermoment", description: "Kies een vast moment van 15 minuten om te piekeren. Daarbuiten mag het wachten.", kind: "afvinken", defaultRecurrence: { every: "dag" } },
  ];

  const tasks: Task[] = [
    { id: "k1", clientId: "c1", templateId: "tt6", title: "Korte wandeling", description: templates[5].description, kind: "afvinken", recurrence: { every: "week", days: [1, 3, 5] }, createdAt: hoursAgo(24 * 16) },
    { id: "k2", clientId: "c1", templateId: "tt4", title: "Slaaplogboek", description: templates[3].description, kind: "schaal", scaleLabel: "Slaapkwaliteit", recurrence: { every: "dag" }, createdAt: hoursAgo(24 * 16) },
    { id: "k3", clientId: "c1", templateId: "tt3", title: "Dankbaarheidslijst", description: templates[2].description, kind: "tekst", recurrence: { every: "dag", until: day(12) }, createdAt: hoursAgo(24 * 9) },
    { id: "k4", clientId: "c1", templateId: "tt2", title: "Gedachtenschema: de zondagavond", description: "Neem een zondagavond van deze week. Wat dacht je, wat voelde je, wat deed je?", kind: "tekst", dueDate: day(3), createdAt: hoursAgo(24 * 2) },
    { id: "k5", clientId: "c1", templateId: "tt5", title: "Meditatie 10 minuten", description: templates[4].description, kind: "meditatie", minutes: 10, recurrence: { every: "dag" }, createdAt: hoursAgo(24 * 5) },
    { id: "k6", clientId: "c2", title: "Brief aan papa", description: "Schrijf wat je hem nog had willen zeggen. Je hoeft hem aan niemand te laten lezen.", kind: "tekst", dueDate: day(5), createdAt: hoursAgo(24 * 4) },
    { id: "k7", clientId: "c3", templateId: "tt1", title: "Ademhaling 4-7-8", description: templates[0].description, kind: "meditatie", minutes: 5, recurrence: { every: "dag" }, createdAt: hoursAgo(24 * 10) },
    { id: "k8", clientId: "c5", title: "Paniekdagboek", description: "Noteer na een paniekmoment: waar, hoe sterk (1-10), wat hielp.", kind: "tekst", recurrence: { every: "dag" }, createdAt: hoursAgo(24 * 14) },
    { id: "k9", clientId: "c6", templateId: "tt6", title: "Korte wandeling", description: templates[5].description, kind: "afvinken", recurrence: { every: "week", days: [2, 4, 6] }, createdAt: hoursAgo(24 * 12) },
    { id: "k10", clientId: "c4", templateId: "tt7", title: "Piekermoment", description: templates[6].description, kind: "afvinken", recurrence: { every: "dag" }, createdAt: hoursAgo(24 * 20) },
  ];

  const taskEntries: TaskEntry[] = [];
  const gratitude = [
    "De zon op het balkon. Een collega die koffie bracht. Mijn kat.",
    "Warme soep. Een lieve sms van mijn zus. Op tijd thuis.",
    "Een goed gesprek met een patiënt. Nieuwe sokken. Stilte.",
    "Wandelen in de regen, en dat het oké was.",
  ];
  for (const t of tasks) {
    const created = startOfDay(new Date(t.createdAt));
    for (let d = created; d < today; d = addDays(d, 1)) {
      const weekday = ((d.getDay() + 6) % 7) + 1;
      if (t.recurrence?.every === "week" && !t.recurrence.days?.includes(weekday)) continue;
      if (!t.recurrence) continue;
      const key = format(d, "yyyy-MM-dd");
      if (!chance(`${t.id}${key}`, t.clientId === "c1" ? 0.72 : 0.6)) continue;
      taskEntries.push({
        id: `e-${t.id}-${key}`,
        taskId: t.id,
        date: key,
        completed: true,
        scale: t.kind === "schaal" ? 4 + ((key.charCodeAt(9) + key.charCodeAt(8)) % 5) : undefined,
        answer: t.kind === "tekst" ? gratitude[key.charCodeAt(9) % gratitude.length] : undefined,
        updatedAt: iso(setHours(d, 21)),
      });
    }
  }
  // Vandaag al gedaan: slaaplogboek van Lotte, paniekdagboek van Elise.
  taskEntries.push({ id: "e-k2-today", taskId: "k2", date: day(0), completed: true, scale: 7, updatedAt: hoursAgo(4) });
  taskEntries.push({ id: "e-k8-today", taskId: "k8", date: day(0), completed: true, answer: "Trein, tussen Gent en Aalst. Een 6. De ademhaling en naar buiten kijken hielpen.", updatedAt: hoursAgo(2) });

  // ---------------------------------------------------------------- Sessienotities

  const noteTexts: Record<string, string[][]> = {
    c1: [
      ["Eerste indruk: veel spanning, praat snel. Slaapt 5 uur per nacht, piekert vooral 's avonds.", "Plan: psycho-educatie rond piekeren, slaaplogboek starten."],
      ["Meer ruimte in het verhaal dan vorige keer. Piekeren vooral rond 22u. Slaap licht verbeterd.", "Werkdruk en bereikbaarheid na de shift komen steeds terug."],
      ["Wandelen werkt. Telefoon uit de slaapkamer besproken, ze twijfelt nog.", "Volgende keer: grenzen op het werk, concrete situatie met collega's."],
      ["Opvallend rustiger. Vertelt zelf over een moment waarop ze nee zei.", "Aandachtspunt: relatie met moeder, ze houdt het nog af. Niet forceren."],
    ],
  };

  const sessionNotes: SessionNote[] = [];
  const done = appointments.filter((a) => a.status === "voltooid");
  for (const a of done) {
    const list = noteTexts[a.clientId];
    const own = done.filter((b) => b.clientId === a.clientId);
    const idx = own.indexOf(a);
    let paras: string[] | undefined;
    if (list) paras = list[Math.max(0, list.length - own.length + idx)];
    else if (idx === own.length - 1) {
      const c = clients.find((x) => x.id === a.clientId)!;
      paras = [`Opvolging rond: ${c.reason?.toLowerCase().replace(/\.$/, "")}`, "Stemming stabiel. Afspraken van vorige keer grotendeels gehaald."];
    }
    if (!paras) continue;
    const t = iso(addMinutes(new Date(a.end), 10));
    sessionNotes.push({
      id: `sn-${a.id}`,
      clientId: a.clientId,
      appointmentId: a.id,
      createdAt: t,
      updatedAt: t,
      blocks: paras.map((p) => P(p, PSY_ID, t)),
    });
  }

  return { psychologist, clients, appointments, tablePages, journal, sessionNotes, templates, tasks, taskEntries, invoices };
}
