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

/** Merkteken: een boograam met een lage zon erin. Op de donkere zijbalk keert het om. */
export function Mark({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className}>
      <path
        d="M6 29V14.5C6 8.7 10.5 4 16 4s10 4.7 10 10.5V29H6Z"
        fill="var(--pine)"
        stroke={inverted ? "var(--sun)" : "none"}
        strokeWidth={inverted ? 1.5 : 0}
        strokeLinejoin="round"
      />
      <circle cx="16" cy="21.5" r="4.5" fill="var(--sun)" />
      <path d="M9.5 25.8h13" stroke="var(--on-accent)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Woordmerk: Fraunces, zacht en een tikje rond. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn("font-display leading-none tracking-[-0.03em]", className)}
      style={{ fontWeight: 500, fontVariationSettings: '"opsz" 72, "SOFT" 100, "WONK" 1' }}
    >
      Huiskamer
    </span>
  );
}

function Brand({ href, context, compact }: { href: string; context: string; compact?: boolean }) {
  if (compact) {
    return (
      <Link href={href} className="flex items-center gap-2" aria-label="Huiskamer">
        <Mark className="size-7" />
        <Wordmark className="text-[23px] text-text" />
      </Link>
    );
  }
  return (
    <Link href={href} className="flex items-center gap-3">
      <Mark inverted className="size-9" />
      <span className="leading-tight">
        <Wordmark className="block text-[25px] text-side-text" />
        <span className="mt-1.5 block text-[11px] font-medium tracking-[0.14em] text-side-muted uppercase">{context}</span>
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
        "relative flex h-11 items-center gap-3 rounded-2xl px-3.5 text-[14.5px] outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-sun",
        active ? "bg-side-active font-medium text-side-text" : "text-side-muted hover:bg-side-hover hover:text-side-text"
      )}
    >
      {active && <span aria-hidden className="absolute -left-3 top-2.5 bottom-2.5 w-[3px] rounded-r-full bg-sun" />}
      <Icon className={cn("size-[18px] stroke-[1.6]", active ? "text-sun" : "text-side-muted")} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function SidebarContent({ homeHref, context, nav, footerNav, sidebarFooter }: Omit<ShellProps, "user" | "children" | "mobileTabs">) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-20 shrink-0 items-center px-5">
        <Brand href={homeHref} context={context} />
      </div>
      <nav aria-label="Hoofdnavigatie" className="flex-1 overflow-y-auto px-3 pt-6">
        {nav.map((group, i) => (
          <div key={group.label ?? i} className={cn(i > 0 && "mt-6")}>
            {group.label && (
              <p className="mb-1.5 px-3 text-[11px] font-medium tracking-[0.08em] text-side-muted uppercase">
                {group.label}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>
      {sidebarFooter && <div className="px-3 pb-3">{sidebarFooter}</div>}
      {footerNav.length > 0 && (
        <div className="flex flex-col gap-0.5 border-t border-white/10 px-3 py-3">
          {footerNav.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

const menuItem =
  "flex h-10 cursor-pointer items-center gap-3 rounded-xl px-3 text-[14px] text-text outline-none transition-colors data-[highlighted]:bg-oat-soft [&_svg]:size-4 [&_svg]:stroke-[1.5] [&_svg]:text-taupe";

function UserMenu({ user }: { user: ShellUser }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label="Account"
        className="group flex h-10 items-center gap-2.5 rounded-full pl-1 pr-1 outline-none transition-colors duration-300 ease-out-soft hover:bg-oat-soft focus-visible:ring-2 focus-visible:ring-pine data-[state=open]:bg-oat-soft md:pr-3.5"
      >
        <Avatar name={user.name} tone={user.tone} size="sm" className="size-8" />
        <span className="hidden text-left leading-tight md:block">
          <span className="block text-[13px] font-semibold">{user.name}</span>
          <span className="block text-[11px] text-faint">{user.tone === "psy" ? "Psycholoog" : "Mijn account"}</span>
        </span>
        <ChevronDown className="hidden size-3.5 stroke-[1.75] text-faint transition-transform duration-300 ease-out-soft group-data-[state=open]:rotate-180 md:block" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-60 origin-(--radix-dropdown-menu-content-transform-origin) animate-pop rounded-[20px] bg-surface p-2 shadow-[0_24px_60px_-20px_rgba(21,33,27,0.35)] ring-1 ring-edge"
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
            <p className="mb-2 text-[11px] font-medium tracking-[0.08em] text-faint uppercase">Demo: bekijk als</p>
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
      className="glass fixed inset-x-0 bottom-0 z-30 border-t border-edge pb-[env(safe-area-inset-bottom)] lg:hidden"
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
                "relative flex h-[68px] flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors duration-200",
                active ? "text-text" : "text-faint hover:text-muted"
              )}
            >
              <span className="relative flex h-8 w-14 items-center justify-center">
                {active && (
                  <motion.span
                    layoutId="tabbar-active"
                    className="absolute inset-0 rounded-full bg-moss"
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                <Icon className={cn("relative size-[22px] stroke-[1.6]", active ? "text-pine" : "text-taupe")} />
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
                className="fixed inset-0 z-50 bg-surface-2/50 backdrop-blur-[3px] lg:hidden"
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
                  className="absolute right-3 top-6 z-10 inline-flex size-8 items-center justify-center rounded-lg text-side-muted hover:bg-side-hover hover:text-side-text"
                >
                  <X className="size-4 stroke-[1.5]" />
                </Dialog.Close>
                <div className="flex h-full flex-col">
                  <div className="min-h-0 flex-1">
                    <SidebarContent {...sidebar} />
                  </div>
                  <div className="border-t border-white/10 bg-surface px-4 py-4 md:hidden">
                    <p className="mb-2 text-[11px] font-medium tracking-[0.08em] text-faint uppercase">Demo: bekijk als</p>
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

  // Topbalk: doorzichtig bovenaan (over de foto), glas zodra je scrolt.
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
            scrolled ? "bg-bg/80 shadow-[0_1px_0_var(--edge)] backdrop-blur-xl" : "bg-transparent"
          )}
        >
          {mobileTabs ? (
            <div className="island h-11 px-3 lg:hidden">
              <Brand href={sidebar.homeHref} context={sidebar.context} compact />
            </div>
          ) : (
            <button type="button" className="island size-11 justify-center lg:hidden" aria-label="Menu" onClick={() => setDrawerOpen(true)}>
              <Menu className="size-[18px] stroke-[1.75]" />
            </button>
          )}
          <div className="min-w-0 flex-1">{topbarStart}</div>
          <div className="island h-12 gap-1 p-1">
            {topbarEnd}
            {topbarEnd && <span aria-hidden className="mx-0.5 h-6 w-px bg-surface-2" />}
            <UserMenu user={user} />
          </div>
        </header>

        <main className={cn("mx-auto max-w-[1280px] px-4 pt-6 md:px-10 md:pt-8", mobileTabs ? "pb-32 lg:pb-24" : "pb-24")}>
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
