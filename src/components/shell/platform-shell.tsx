"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DropdownMenu } from "radix-ui";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  user: ShellUser;
  topbarStart?: React.ReactNode;
  topbarEnd?: React.ReactNode;
  children: React.ReactNode;
};

/** Merkteken: een huisje met een warm raam, in Mocha. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className}>
      <rect width="32" height="32" rx="9" fill="var(--mocha)" />
      <path d="M9 15.2 16 9.5l7 5.7V23a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1v-7.8Z" fill="none" stroke="var(--milk)" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="14.2" y="17.2" width="3.6" height="3.6" rx="0.8" fill="var(--oat)" />
    </svg>
  );
}

function Brand({ href, context, compact }: { href: string; context: string; compact?: boolean }) {
  if (compact) {
    return (
      <Link href={href} className="flex items-center gap-2" aria-label="Huiskamer">
        <Mark className="size-7" />
        <span className="font-display text-[21px] leading-none text-text">Huiskamer</span>
      </Link>
    );
  }
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <Mark className="size-8" />
      <span className="leading-tight">
        <span className="block font-display text-[22px] leading-none text-text">Huiskamer</span>
        <span className="mt-1 block text-[12px] text-muted">{context}</span>
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
        "flex h-9 items-center gap-3 rounded-[10px] px-3 text-[14px] outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-taupe",
        active ? "bg-oat-soft font-medium text-text shadow-[inset_0_0_0_1px_var(--edge)]" : "text-muted hover:bg-oat-soft/70 hover:text-text"
      )}
    >
      <Icon className={cn("size-[18px] stroke-[1.5]", active ? "text-muted" : "text-taupe")} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function SidebarContent({ homeHref, context, nav, footerNav }: Omit<ShellProps, "user" | "children" | "mobileTabs">) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Brand href={homeHref} context={context} />
      </div>
      <nav aria-label="Hoofdnavigatie" className="flex-1 overflow-y-auto px-3 pt-4">
        {nav.map((group, i) => (
          <div key={group.label ?? i} className={cn(i > 0 && "mt-6")}>
            {group.label && (
              <p className="mb-1.5 px-3 text-[11px] font-medium tracking-[0.08em] text-faint uppercase">
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
      {footerNav.length > 0 && (
        <div className="flex flex-col gap-0.5 border-t border-edge px-3 py-3">
          {footerNav.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

const menuItem =
  "flex h-9 cursor-pointer items-center gap-3 rounded-lg px-3 text-[14px] text-text outline-none transition-colors data-[highlighted]:bg-oat-soft [&_svg]:size-4 [&_svg]:stroke-[1.5] [&_svg]:text-taupe";

function UserMenu({ user }: { user: ShellUser }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label="Account"
        className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 transition-colors hover:bg-oat-soft data-[state=open]:bg-oat-soft md:pr-3"
      >
        <Avatar name={user.name} tone={user.tone} size="sm" />
        <span className="hidden text-left leading-tight md:block">
          <span className="block text-[13px] font-medium">{user.name}</span>
        </span>
        <ChevronDown className="hidden size-3.5 stroke-[1.5] text-taupe md:block" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-56 origin-(--radix-dropdown-menu-content-transform-origin) animate-pop rounded-xl bg-surface p-1.5 shadow-soft ring-1 ring-surface-2"
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
                "relative flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors duration-200",
                active ? "text-text" : "text-faint hover:text-muted"
              )}
            >
              {active && (
                <motion.span
                  layoutId="tabbar-active"
                  className="absolute top-0 h-[2px] w-8 rounded-full bg-accent"
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              <Icon className={cn("size-[22px] stroke-[1.5]", active ? "text-text" : "text-taupe")} />
              {item.label}
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
                className="fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] bg-surface shadow-soft outline-none lg:hidden"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              >
                <Dialog.Title className="sr-only">Menu</Dialog.Title>
                <Dialog.Description className="sr-only">Navigatie</Dialog.Description>
                <Dialog.Close
                  aria-label="Menu sluiten"
                  className="absolute right-3 top-4 z-10 inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-oat-soft"
                >
                  <X className="size-4 stroke-[1.5]" />
                </Dialog.Close>
                <div className="flex h-full flex-col">
                  <div className="min-h-0 flex-1">
                    <SidebarContent {...sidebar} />
                  </div>
                  <div className="border-t border-edge px-4 py-4 md:hidden">
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

  // Sluit het menu na navigatie.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setDrawerOpen(false), [pathname]);

  return (
    <div className="min-h-dvh lg:pl-[248px]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-edge bg-surface lg:block">
        <SidebarContent {...sidebar} />
      </aside>
      {!mobileTabs && <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} {...sidebar} />}

      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-edge bg-surface/90 px-4 backdrop-blur-md md:px-8">
        {mobileTabs ? (
          <div className="lg:hidden">
            <Brand href={sidebar.homeHref} context={sidebar.context} compact />
          </div>
        ) : (
          <Button
            variant="quiet"
            size="icon-sm"
            className="-ml-1 lg:hidden"
            aria-label="Menu"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu />
          </Button>
        )}
        <div className="min-w-0 flex-1">{topbarStart}</div>
        <div className="flex items-center gap-2 md:gap-3">
          {topbarEnd}
          <UserMenu user={user} />
        </div>
      </header>

      <main className={cn("mx-auto max-w-6xl px-5 pt-8 md:px-8 md:pt-10", mobileTabs ? "pb-32 lg:pb-24" : "pb-24")}>
        {ready ? children : <PageSkeleton />}
      </main>
      {mobileTabs && <TabBar items={mobileTabs} />}

      <div className="fixed bottom-4 right-4 z-40 hidden items-center gap-2 md:flex">
        <DemoReset variant="icon" />
        <RoleSwitch floating />
      </div>
      <Toaster />
    </div>
  );
}
