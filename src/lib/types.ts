// Datamodel (sectie 6 van het plan). Mockdata en later de echte backend delen deze types.

export type ID = string;
/** ISO 8601 datum-tijd. */
export type ISODate = string;
/** Kalenderdag, `yyyy-MM-dd`. */
export type Day = string;

export type Role = "psy" | "client";

export type WeeklySlot = {
  /** 1 = maandag, 7 = zondag. */
  weekday: number;
  start: string; // "09:00"
  end: string; // "12:00"
};

export type Psychologist = {
  id: ID;
  name: string;
  firstName: string;
  practiceName: string;
  email: string;
  phone: string;
  address: string;
  hourlyRate: number;
  sessionMinutes: number;
  /** Minimaal aantal uur op voorhand om kosteloos te annuleren of te verzetten. */
  cancellationHours: number;
  availability: WeeklySlot[];
};

export type ClientStatus = "actief" | "gepauzeerd" | "afgerond";

export type Client = {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate?: Day;
  status: ClientStatus;
  startedAt: ISODate;
  psychologistId: ID;
  /** Korte aanmeldingsreden, enkel zichtbaar voor de psycholoog. */
  reason?: string;
};

export type AppointmentType = "intake" | "opvolging";
export type AppointmentMode = "fysiek" | "online";
export type AppointmentStatus = "gepland" | "voltooid" | "geannuleerd" | "no-show";

export type Appointment = {
  id: ID;
  clientId: ID;
  start: ISODate;
  end: ISODate;
  type: AppointmentType;
  mode: AppointmentMode;
  status: AppointmentStatus;
};

export type BlockType = "paragraph" | "heading" | "checklist" | "quote" | "divider";

export type Block = {
  id: string;
  type: BlockType;
  /** Inline HTML: tekst met <strong>, <em>, <s>. */
  content: string;
  authorId: ID;
  updatedAt: ISODate;
  checked?: boolean;
  level?: 2 | 3;
};

/**
 * Gedeelde pagina bij een sessie. Ontstaat de eerste keer dat iemand erop schrijft.
 * `summary` schrijft de psycholoog (wat we bespraken), `reactions` schrijven beiden.
 */
export type SessionPage = {
  id: ID;
  clientId: ID;
  appointmentId: ID;
  summary: Block[];
  reactions: Block[];
  updatedAt: ISODate;
};

/** Een punt op "Voor volgende keer" van een komende sessie. */
export type AgendaItem = {
  id: ID;
  clientId: ID;
  appointmentId: ID;
  /** Korte vraag of punt, als het geen entry is. */
  text?: string;
  /** Een logboekentry die de cliënt meeneemt. */
  journalEntryId?: ID;
  addedBy: ID;
  createdAt: ISODate;
};

export type Mood = 1 | 2 | 3 | 4 | 5;

export type JournalKind = "checkin" | "notitie" | "opdracht";

/** Alles wat de cliënt schrijft komt hier terecht: check-ins, vrije notities en opdracht-resultaten. */
export type JournalEntry = {
  id: ID;
  clientId: ID;
  kind: JournalKind;
  /** De dag waarop de entry telt (bij opdrachten: de dag waarvoor ze gedaan is). */
  day: Day;
  createdAt: ISODate;
  updatedAt: ISODate;
  title?: string;
  blocks: Block[];
  mood?: Mood;
  tags: string[];
  /** Bij een opdracht-entry. */
  taskId?: ID;
  scale?: number;
  sharedWithPsychologist: boolean;
  psychologistNote?: { text: string; createdAt: ISODate };
};

/** Enkel voor de psycholoog. Nooit zichtbaar in de cliëntomgeving. */
export type SessionNote = {
  id: ID;
  clientId: ID;
  appointmentId?: ID;
  createdAt: ISODate;
  updatedAt: ISODate;
  blocks: Block[];
};

export type TaskKind = "afvinken" | "tekst" | "schaal" | "meditatie";

/** Elke opdracht heeft precies één ritme. */
export type Rhythm =
  | { kind: "dagelijks" }
  /** 1 = maandag, 7 = zondag. */
  | { kind: "dagen"; days: number[] }
  | { kind: "perWeek"; times: number }
  | { kind: "eenmalig"; due: Day };

export type TaskTemplate = {
  id: ID;
  title: string;
  description: string;
  kind: TaskKind;
  defaultRhythm?: Rhythm;
  /** Bij meditatie: duur in minuten. Bij schaal: wat er gemeten wordt. */
  minutes?: number;
  scaleLabel?: string;
};

export type Task = {
  id: ID;
  clientId: ID;
  /** De sessie waaruit de opdracht komt. */
  appointmentId?: ID;
  templateId?: ID;
  title: string;
  description: string;
  kind: TaskKind;
  rhythm: Rhythm;
  /** Herhalende opdrachten: tot en met deze dag. */
  until?: Day;
  minutes?: number;
  scaleLabel?: string;
  createdAt: ISODate;
  archived?: boolean;
};

/** Voorkeuren van de cliënt: onboarding, herinneringen, delen. */
export type ClientPrefs = {
  onboarded: boolean;
  /** "20:00", of leeg als er geen herinnering is. */
  checkinReminder?: string;
  taskReminders: boolean;
  appointmentReminder: boolean;
  defaultShare: boolean;
};

export type InvoiceStatus = "open" | "betaald" | "vervallen";

export type Invoice = {
  id: ID;
  number: string;
  clientId: ID;
  appointmentId: ID;
  amount: number;
  issuedAt: ISODate;
  dueAt: ISODate;
  status: InvoiceStatus;
  paidAt?: ISODate;
  attestUrl?: string;
};
