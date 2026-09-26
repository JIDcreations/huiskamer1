import {
  Bell,
  CalendarDays,
  ListChecks,
    NotebookPen,
  Receipt,
  Settings,
  ShieldCheck,
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

/** Cliënt: drie plekken, in tijd gedacht. */
export const clientTabs: NavItem[] = [
  { href: "/c/vandaag", label: "Vandaag", icon: Sun },
  { href: "/c/logboek", label: "Logboek", icon: NotebookPen },
  { href: "/c/sessies", label: "Sessies", icon: CalendarDays },
];

export const clientNav: NavGroup[] = [{ items: clientTabs }];

/** Onder de avatar. */
export const clientMenu: NavItem[] = [
  { href: "/c/opdrachten", label: "Alle opdrachten", icon: ListChecks },
  { href: "/c/betalingen", label: "Betalingen", icon: Receipt },
  { href: "/c/herinneringen", label: "Herinneringen", icon: Bell },
  { href: "/c/privacy", label: "Privacy", icon: ShieldCheck },
  { href: "/c/profiel", label: "Profiel", icon: UserRound },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}
