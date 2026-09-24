import { PsyShell } from "@/components/shell/psy-shell";

export default function PsyLayout({ children }: { children: React.ReactNode }) {
  return <PsyShell>{children}</PsyShell>;
}
