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

/** Tafel: gedeelde pagina's per cliënt. */
export type TablePage = {
  id: ID;
  clientId: ID;
  title: string;
  blocks: Block[];
  pinned: boolean;
  createdBy: ID;
  createdAt: ISODate;
  updatedAt: ISODate;
};

export type Mood = 1 | 2 | 3 | 4 | 5;

export type JournalEntry = {
  id: ID;
  clientId: ID;
  createdAt: ISODate;
  updatedAt: ISODate;
  title?: string;
  blocks: Block[];
  mood?: Mood;
  tags: string[];
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

export type Recurrence = {
  every: "dag" | "week";
  /** Enkel bij `week`: 1 = maandag, 7 = zondag. */
  days?: number[];
  until?: Day;
};

export type TaskTemplate = {
  id: ID;
  title: string;
  description: string;
  kind: TaskKind;
  defaultRecurrence?: Recurrence;
  /** Bij meditatie: duur in minuten. Bij schaal: wat er gemeten wordt. */
  minutes?: number;
  scaleLabel?: string;
};

export type Task = {
  id: ID;
  clientId: ID;
  templateId?: ID;
  title: string;
  description: string;
  kind: TaskKind;
  dueDate?: Day;
  recurrence?: Recurrence;
  minutes?: number;
  scaleLabel?: string;
  createdAt: ISODate;
  archived?: boolean;
};

export type TaskEntry = {
  id: ID;
  taskId: ID;
  date: Day;
  completed: boolean;
  answer?: string;
  scale?: number;
  updatedAt: ISODate;
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
