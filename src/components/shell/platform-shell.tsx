"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DropdownMenu } from "radix-ui";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { RoleSwitch } from "@/components/role-switch";
import { DemoReset } from "@/components/demo-reset";
import { PageSkeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toast";
import { useHydrateStore } from "@/lib/data";
import { isActive, type NavGroup, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

export type ShellUser = {
  name: string;
  subtitle: string;
  tone: "psy" | "client";
  menu: NavItem[];
};

type ShellProps = {
  homeHref: string;
  /** Mobiel: een tab bar onderaan in plaats van een lade. */
  mobileTabs?: NavItem[];
  context: string;
  nav: NavGroup[];
  footerNav: NavItem[];
  /** Onderaan de zijbalk, boven de footer-links. */
  sidebarFooter?: React.ReactNode;
  user: ShellUser;
  topbarStart?: React.ReactNode;
  topbarEnd?: React.ReactNode;
  children: React.ReactNode;
};

/** Merkteken: een boograam in latte, met een dun binnenraam. */
export function Mark({ className }: { className?: string; inverted?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className}>
      <path d="M5 30V15C5 8.4 9.9 3 16 3s11 5.4 11 12v15H5Z" fill="var(--sun)" />
      <path d="M10 30V16.5C10 12.9 12.7 10 16 10s6 2.9 6 6.5V30" fill="none" stroke="var(--pine)" strokeWidth="1.2" />
      <path d="M16 10v20M10 21h12" stroke="var(--pine)" strokeWidth="1.2" />
    </svg>
  );
}

/** Woordmerk: Jost, medium en strak. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn("font-display leading-none tracking-[-0.03em]", className)}
      style={{ fontWeight: 500 }}
    >
      Huiskamer
    </span>
  );
}

function Brand({ href, context, compact }: { href: string; context: string; compact?: boolean }) {
  if (compact) {
    return (
      <Link href={href} className="flex items-center gap-2" aria-label="Huiskamer">
        <Mark className="size-6" />
        <Wordmark className="text-[23px] text-text" />
      </Link>
    );
  }
  return (
    <Link href={href} className="flex flex-col items-start gap-2.5">
      <Mark className="size-8" />
      <span className="leading-tight">
        <Wordmark className="block text-[30px] text-side-text" />
        <span className="caps mt-2 block text-side-muted">{context}</span>
      </span>
    </Link>
  );
}

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-11 items-center gap-3 rounded-full px-4 text-[15px] lowercase outline-none transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-sun",
        active ? "bg-side-active text-side-text" : "text-side-muted hover:bg-side-hover hover:text-side-text"
      )}
    >
      <Icon className={cn("size-[17px] stroke-[1.25]", active ? "text-sun" : "text-side-muted group-hover:text-side-text")} />
      <span className="truncate">{item.label}</span>
      {active && <span aria-hidden className="ml-auto size-1.5 rounded-full bg-sun" />}
    </Link>
  );
}

function SidebarContent({ homeHref, context, nav, footerNav, sidebarFooter }: Omit<ShellProps, "user" | "children" | "mobileTabs">) {
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-7 pb-2 pt-8">
        <Brand href={homeHref} context={context} />
      </div>
      <nav aria-label="Hoofdnavigatie" className="flex-1 overflow-y-auto px-4 pt-8">
        {nav.map((group, i) => (
          <div key={group.label ?? i} className={cn(i > 0 && "mt-5 border-t border-white/10 pt-5")}>
            {group.label && <p className="sr-only">{group.label}</p>}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>
      {sidebarFooter && <div className="px-4 pb-4">{sidebarFooter}</div>}
      {footerNav.length > 0 && (
        <div className="flex flex-col gap-0.5 border-t border-white/10 px-4 py-3">
          {footerNav.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

const menuItem =
  "flex h-10 cursor-pointer items-center gap-3 rounded-full px-3.5 text-[14.5px] text-text outline-none transition-colors data-[highlighted]:bg-oat-soft [&_svg]:size-4 [&_svg]:stroke-[1.25] [&_svg]:text-taupe";

function UserMenu({ user }: { user: ShellUser }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label="Account"
        className="group flex h-10 items-center gap-2.5 rounded-full pl-1 pr-1 outline-none transition-colors duration-300 ease-out-soft hover:bg-oat-soft focus-visible:ring-1 focus-visible:ring-pine data-[state=open]:bg-oat-soft md:pr-3.5"
      >
        <Avatar name={user.name} tone={user.tone} size="sm" className="size-8" />
        <span className="hidden text-left leading-tight md:block">
          <span className="block text-[13.5px] font-medium">{user.name}</span>
          <span className="block text-[11px] text-faint">{user.tone === "psy" ? "Psycholoog" : "Mijn account"}</span>
        </span>
        <ChevronDown className="hidden size-3.5 stroke-[1.75] text-faint transition-transform duration-300 ease-out-soft group-data-[state=open]:rotate-180 md:block" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-60 origin-(--radix-dropdown-menu-content-transform-origin) animate-pop rounded-[22px] bg-surface p-2 shadow-soft ring-1 ring-edge"
        >
          <div className="px-3 pb-2 pt-1.5">
            <p className="text-[14px] font-medium">{user.name}</p>
            <p className="text-[12px] text-muted">{user.subtitle}</p>
          </div>
          <DropdownMenu.Separator className="mx-1 my-1 h-px bg-surface-2" />
          {user.menu.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenu.Item key={item.href} asChild className={menuItem}>
                <Link href={item.href}>
                  <Icon /> {item.label}
                </Link>
              </DropdownMenu.Item>
            );
          })}
          <DropdownMenu.Separator className="mx-1 my-1 h-px bg-surface-2" />
          <div className="px-3 pb-2 pt-1.5 md:hidden">
            <p className="mb-2 text-[12px] text-faint">Demo: bekijk als</p>
            <RoleSwitch className="flex w-full" />
          </div>
          <DropdownMenu.Separator className="mx-1 my-1 h-px bg-surface-2 md:hidden" />
          <DropdownMenu.Item asChild className={menuItem}>
            <Link href="/">
              <LogOut /> Afmelden
            </Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function TabBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Hoofdnavigatie"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-edge bg-bg pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="mx-auto flex max-w-md">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-[66px] flex-1 flex-col items-center justify-center gap-1 text-[12px] lowercase transition-colors duration-200",
                active ? "text-text" : "text-faint hover:text-muted"
              )}
            >
              <span className="relative flex h-8 w-14 items-center justify-center">
                {active && (
                  <motion.span
                    layoutId="tabbar-active"
                    className="absolute inset-0 rounded-full bg-sun-soft"
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                <Icon className={cn("relative size-[21px] stroke-[1.25]", active ? "text-pine" : "text-taupe")} />
              </span>
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function MobileDrawer({
  open,
  onOpenChange,
  ...sidebar
}: Omit<ShellProps, "user" | "children" | "mobileTabs"> & { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-pine/20 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                className="fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] bg-side shadow-soft outline-none lg:hidden"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              >
                <Dialog.Title className="sr-only">Menu</Dialog.Title>
                <Dialog.Description className="sr-only">Navigatie</Dialog.Description>
                <Dialog.Close
                  aria-label="Menu sluiten"
                  className="absolute right-3 top-6 z-10 inline-flex size-8 items-center justify-center rounded-full text-side-muted hover:bg-side-hover hover:text-side-text"
                >
                  <X className="size-4 stroke-[1.5]" />
                </Dialog.Close>
                <div className="flex h-full flex-col">
                  <div className="min-h-0 flex-1">
                    <SidebarContent {...sidebar} />
                  </div>
                  <div className="border-t border-edge bg-surface px-4 py-4 md:hidden">
                    <p className="mb-2 text-[12px] text-faint">Demo: bekijk als</p>
                    <RoleSwitch className="flex w-full" />
                    <DemoReset className="mt-3" />
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export function PlatformShell({ user, topbarStart, topbarEnd, mobileTabs, children, ...sidebar }: ShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const ready = useHydrateStore();
  const sentinel = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  // Topbalk: doorzichtig bovenaan, effen papier met een haarlijn zodra je scrolt.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Sluit het menu na navigatie.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setDrawerOpen(false), [pathname]);

  return (
    <div className="min-h-dvh lg:pl-[264px]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] bg-side lg:block">
        <SidebarContent {...sidebar} />
      </aside>
      {!mobileTabs && <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} {...sidebar} />}

      <div className="@container relative">
        <div ref={sentinel} aria-hidden className="absolute inset-x-0 top-0 h-px" />
        <header
          className={cn(
            "sticky top-0 z-20 flex h-[72px] items-center gap-3 px-4 transition-[background-color,box-shadow] duration-500 ease-out-soft md:px-8",
            scrolled ? "bg-bg shadow-[0_1px_0_var(--edge)]" : "bg-transparent"
          )}
        >
          {mobileTabs ? (
            <div className="island h-11 px-3 lg:hidden">
              <Brand href={sidebar.homeHref} context={sidebar.context} compact />
            </div>
          ) : (
            <button type="button" className="island size-11 justify-center lg:hidden" aria-label="Menu" onClick={() => setDrawerOpen(true)}>
              <Menu className="size-[18px] stroke-[1.25]" />
            </button>
          )}
          <div className="min-w-0 flex-1">{topbarStart}</div>
          <div className="island h-12 gap-1 p-1">
            {topbarEnd}
            {topbarEnd && <span aria-hidden className="mx-0.5 h-6 w-px bg-edge" />}
            <UserMenu user={user} />
          </div>
        </header>

        <main className={cn("mx-auto max-w-[1280px] px-4 pt-4 md:px-10 md:pt-6", mobileTabs ? "pb-32 lg:pb-24" : "pb-24")}>
          {ready ? children : <PageSkeleton />}
        </main>
      </div>
      {mobileTabs && <TabBar items={mobileTabs} />}

      {/* Hoog genoeg om boven de "Powered by Netlify"-badge en de tab bar te blijven. */}
      <div className="fixed bottom-20 right-4 z-40 hidden items-center gap-2 md:flex">
        <DemoReset variant="icon" />
        <RoleSwitch floating />
      </div>
      <Toaster />
    </div>
  );
}
