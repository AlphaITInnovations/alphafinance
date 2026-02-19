"use client";

import { useState } from "react";
import { useData } from "@/context/data-context";
import { SortableTable, type Column } from "@/components/sortable-table";
import type { OneTimeCost } from "@/lib/types";
import { formatMonth, formatCurrency, nowMonth } from "@/lib/utils";

const EMPTY: Omit<OneTimeCost, "id"> = {
  area: "alphaconsult", name: "", vendor: "", company: "", costCenter: "", date: nowMonth(), amount: 0,
};

const columns: Column<OneTimeCost>[] = [
  { key: "name", label: "Bezeichnung", sortValue: (c) => c.name, render: (c) => (
    <div><div className="font-medium">{c.name}</div>{c.description && <div className="text-xs text-muted-foreground">{c.description}</div>}</div>
  )},
  { key: "vendor", label: "Lieferant", sortValue: (c) => c.vendor, render: (c) => c.vendor },
  { key: "company", label: "Firma", sortValue: (c) => c.company, render: (c) => c.company },
  { key: "kst", label: "KST", sortValue: (c) => c.costCenter, render: (c) => c.costCenter || "—", className: "tabular-nums" },
  { key: "date", label: "Datum", sortValue: (c) => c.date, render: (c) => formatMonth(c.date) },
  { key: "amount", label: "Betrag", sortValue: (c) => c.amount, className: "text-right tabular-nums font-medium",
    render: (c) => formatCurrency(c.amount) },
];

export default function EinmaligeKostenPage() {
  const { oneTimeCostsByArea, addOneTimeCost, updateOneTimeCost, deleteOneTimeCost } = useData();
  const items = oneTimeCostsByArea("alphaconsult");
  const [editing, setEditing] = useState<OneTimeCost | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Einmalige Kosten</h1>
          <p className="mt-1 text-sm text-muted-foreground">Einmalige Anschaffungen und Kosten — Klicken Sie auf Spaltenköpfe zum Sortieren</p>
        </div>
        <button onClick={() => { setCreating(true); setEditing(null); }} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-petrol-dark transition-colors">
          + Neue Position
        </button>
      </div>

      {(creating || editing) && (
        <div className="mb-6 rounded-xl border border-primary/30 bg-card p-6 shadow-md">
          <h3 className="mb-4 text-lg font-semibold">{creating ? "Neue Position" : "Position bearbeiten"}</h3>
          <CostForm
            initial={editing ?? EMPTY}
            onSave={(c) => {
              if (creating) addOneTimeCost(c); else if (editing) updateOneTimeCost({ ...c, id: editing.id } as OneTimeCost);
              setCreating(false); setEditing(null);
            }}
            onCancel={() => { setCreating(false); setEditing(null); }}
          />
        </div>
      )}

      <SortableTable
        columns={columns}
        data={items}
        keyFn={(c) => c.id}
        actions={(c) => (
          <div className="flex gap-2">
            <button onClick={() => { setEditing(c); setCreating(false); }} className="text-sm text-primary hover:underline">Bearbeiten</button>
            <button onClick={() => { if (confirm("Löschen?")) deleteOneTimeCost(c.id); }} className="text-sm text-destructive hover:underline">Löschen</button>
          </div>
        )}
      />
    </div>
  );
}

function CostForm({ initial, onSave, onCancel }: {
  initial: Omit<OneTimeCost, "id"> | OneTimeCost;
  onSave: (c: Omit<OneTimeCost, "id">) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...initial });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Inp label="Bezeichnung *" value={form.name} onChange={(v) => set("name", v)} />
        <Inp label="Lieferant *" value={form.vendor} onChange={(v) => set("vendor", v)} />
        <Inp label="Firma *" value={form.company} onChange={(v) => set("company", v)} />
        <Inp label="KST" value={form.costCenter} onChange={(v) => set("costCenter", v.replace(/\D/g, ""))} />
        <Inp label="Datum" value={form.date} onChange={(v) => set("date", v)} type="month" />
        <Inp label="Betrag (€)" value={String(form.amount || "")} onChange={(v) => set("amount", parseFloat(v) || 0)} type="number" />
        <div className="sm:col-span-2 lg:col-span-3">
          <Inp label="Beschreibung" value={form.description ?? ""} onChange={(v) => set("description", v || undefined)} />
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button onClick={() => { if (form.name && form.vendor) onSave(form as Omit<OneTimeCost, "id">); }} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-petrol-dark transition-colors">Speichern</button>
        <button onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors">Abbrechen</button>
      </div>
    </>
  );
}

function Inp({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}
