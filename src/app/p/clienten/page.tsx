"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ClientStatusBadge } from "@/components/psy/client-status";
import { useClientMeta } from "@/components/psy/client-meta";
import { FormActions } from "@/components/psy/task-form";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { actions, useClients } from "@/lib/data";
import { formatRelativeDay, formatTime, formatWhen } from "@/lib/format";
import type { ClientStatus } from "@/lib/types";

type Filter = "alle" | ClientStatus;

function NewClientSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", reason: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Nieuwe cliënt" description="Na het bewaren krijgt je cliënt een uitnodiging (in de demo gebeurt dat niet).">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const id = actions.createClient({ ...form, reason: form.reason || undefined });
          toast("Cliënt toegevoegd");
          onOpenChange(false);
          router.push(`/p/clienten/${id}`);
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div>
          <Label htmlFor="n-first">Voornaam</Label>
          <Input id="n-first" value={form.firstName} onChange={set("firstName")} required />
        </div>
        <div>
          <Label htmlFor="n-last">Naam</Label>
          <Input id="n-last" value={form.lastName} onChange={set("lastName")} required />
        </div>
        <div>
          <Label htmlFor="n-mail">E-mail</Label>
          <Input id="n-mail" type="email" value={form.email} onChange={set("email")} required />
        </div>
        <div>
          <Label htmlFor="n-phone">Telefoon</Label>
          <Input id="n-phone" type="tel" value={form.phone} onChange={set("phone")} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="n-reason">Aanmelding (enkel voor jou)</Label>
          <Textarea id="n-reason" value={form.reason} onChange={set("reason")} placeholder="Kort, in een paar woorden." />
        </div>
        <div className="sm:col-span-2">
          <FormActions onCancel={() => onOpenChange(false)} submitLabel="Toevoegen" disabled={!form.firstName || !form.lastName || !form.email} />
        </div>
      </form>
    </Sheet>
  );
}

export default function Clienten() {
  const clients = useClients();
  const meta = useClientMeta(clients);
  const [filter, setFilter] = useState<Filter>("actief");
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);

  const count = (f: Filter) => (f === "alle" ? clients.length : clients.filter((c) => c.status === f).length);
  const shown = clients.filter(
    (c) => (filter === "alle" || c.status === filter) && `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(q.trim().toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Cliënten"
        eyebrow={`${count("actief")} actief`}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus /> Nieuwe cliënt
          </Button>
        }
      />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Filter"
          value={filter}
          onChange={setFilter}
          options={(["actief", "gepauzeerd", "afgerond", "alle"] as Filter[]).map((f) => ({
            value: f,
            label: `${f === "alle" ? "Alle" : f.charAt(0).toUpperCase() + f.slice(1)} ${count(f)}`,
          }))}
        />
        <label className="relative w-full sm:w-64">
          <span className="sr-only">Zoeken</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 stroke-[1.5] text-taupe" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Zoek op naam" className="h-10 pl-10" />
        </label>
      </div>

      <div className="mt-5 overflow-hidden rounded-card bg-surface shadow-soft ring-1 ring-surface-2/60">
        {shown.length === 0 ? (
          <EmptyState title="Niemand gevonden" description="Probeer een andere naam of filter." />
        ) : (
          <table className="w-full text-left">
            <thead className="hidden border-b border-surface-2 text-[12px] text-faint md:table-header-group">
              <tr>
                <th className="py-3 pl-6 font-medium">Naam</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium">Volgende afspraak</th>
                <th className="py-3 font-medium">Laatste activiteit</th>
                <th className="py-3 pr-6 text-right font-medium">Opdrachten</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-2/70">
              {shown.map((c) => {
                const m = meta.get(c.id);
                return (
                  <tr key={c.id} className="group relative transition-colors hover:bg-oat-soft/40">
                    <td className="py-3.5 pl-5 md:pl-6">
                      <Link href={`/p/clienten/${c.id}`} className="flex items-center gap-3 after:absolute after:inset-0">
                        <Avatar name={`${c.firstName} ${c.lastName}`} tone="client" size="md" />
                        <span className="min-w-0">
                          <span className="block text-[14px] font-medium">
                            {c.firstName} {c.lastName}
                          </span>
                          <span className="block truncate text-[12px] text-muted md:hidden">
                            {m?.next ? `Volgende: ${formatRelativeDay(m.next.start)}, ${formatTime(m.next.start)}` : c.email}
                          </span>
                          <span className="hidden text-[12px] text-muted md:block">{c.email}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="py-3.5 pr-4 text-right md:text-left">
                      <ClientStatusBadge status={c.status} />
                    </td>
                    <td className="hidden py-3.5 text-[14px] md:table-cell">
                      {m?.next ? `${formatRelativeDay(m.next.start)}, ${formatTime(m.next.start)}` : <span className="text-faint">Niets gepland</span>}
                    </td>
                    <td className="hidden py-3.5 text-[14px] text-muted md:table-cell">{m?.last ? formatWhen(m.last.at) : <span className="text-faint">Nog niets</span>}</td>
                    <td className="hidden py-3.5 pr-6 text-right text-[14px] tabular-nums text-muted md:table-cell">{m?.openTasks || <span className="text-faint">0</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {creating && <NewClientSheet open={creating} onOpenChange={setCreating} />}
    </>
  );
}
