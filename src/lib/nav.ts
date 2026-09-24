import {
  CalendarDays,
  Files,
  House,
  ListChecks,
  NotebookPen,
  Receipt,
  Settings,
  Sun,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };
export type NavGroup = { label?: string; items: NavItem[] };

export const psyNav: NavGroup[] = [
  {
    items: [
      { href: "/p/vandaag", label: "Vandaag", icon: Sun },
      { href: "/p/agenda", label: "Agenda", icon: CalendarDays },
    ],
  },
  {
    label: "Praktijk",
    items: [
      { href: "/p/clienten", label: "Cliënten", icon: Users },
      { href: "/p/opdrachten", label: "Opdrachtenbibliotheek", icon: ListChecks },
      { href: "/p/facturatie", label: "Facturatie", icon: Receipt },
    ],
  },
];

export const psyNavFooter: NavItem[] = [
  { href: "/p/instellingen", label: "Instellingen", icon: Settings },
];

export const clientNav: NavGroup[] = [
  {
    items: [
      { href: "/c/home", label: "Overzicht", icon: House },
      { href: "/c/afspraken", label: "Afspraken", icon: CalendarDays },
    ],
  },
  {
    label: "Tussen de sessies",
    items: [
      { href: "/c/tafel", label: "Tafel", icon: Files },
      { href: "/c/logboek", label: "Logboek", icon: NotebookPen },
      { href: "/c/opdrachten", label: "Opdrachten", icon: ListChecks },
    ],
  },
  {
    label: "Administratie",
    items: [{ href: "/c/betalingen", label: "Betalingen", icon: Receipt }],
  },
];

export const clientNavFooter: NavItem[] = [
  { href: "/c/profiel", label: "Profiel", icon: UserRound },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}
