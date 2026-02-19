"use client";

import { useState, useMemo } from "react";
import { useData } from "@/context/data-context";
import { SortableTable, type Column } from "@/components/sortable-table";
import type { ConsultingCost } from "@/lib/types";
import { formatMonth, formatCurrency, fiscalYearMonths, currentFiscalYear } from "@/lib/utils";

const EMPTY: Omit<ConsultingCost, "id"> = {
  area: "alphaconsult", name: "", vendor: "", company: "", costCenter: "", monthlyAmounts: {},
};

export default function ConsultingPage() {
  const { consultingCostsByArea, addConsultingCost, updateConsultingCost, deleteConsultingCost } = useData();
  const items = consultingCostsByArea("alphaconsult");
  const [editing, setEditing] = useState<ConsultingCost | null>(null);
  const [creating, setCreating] = useState(false);

  const columns: Column<ConsultingCost>[] = useMemo(() => [
    { key: "name", label: "Bezeichnung", sortValue: (c) => c.name, render: (c) => (
      <div><div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground">{c.vendor}</div></div>
    )},
    { key: "company", label: "Firma", sortValue: (c) => c.company, render: (c) => c.company },
    { key: "kst", label: "KST", sortValue: (c) => c.costCenter, render: (c) => c.costCenter || "—", className: "tabular-nums" },
    { key: "months", label: "Monate", sortValue: (c) => Object.keys(c.monthlyAmounts).length,
      render: (c) => {
        const n = Object.keys(c.monthlyAmounts).length;
        return <span className="text-muted-foreground">{n} {n === 1 ? "Eintrag" : "Einträge"}</span>;
      }},
    { key: "total", label: "Gesamt", sortValue: (c) => Object.values(c.monthlyAmounts).reduce((s, v) => s + v, 0),
      className: "text-right tabular-nums font-medium",
      render: (c) => formatCurrency(Object.values(c.monthlyAmounts).reduce((s, v) => s + v, 0)) },
  ], []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consulting</h1>
          <p className="mt-1 text-sm text-muted-foreground">Dienstleister und Consulting-Kosten — Klicken Sie auf Spaltenköpfe zum Sortieren</p>
        </div>
        <button onClick={() => { setCreating(true); setEditing(null); }} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-petrol-dark transition-colors">
          + Neuer Dienstleister
        </button>
      </div>

      {(creating || editing) && (
        <ConsultingForm
          initial={editing ?? EMPTY}
          isNew={creating}
          onSave={(c) => {
            if (creating) addConsultingCost(c); else if (editing) updateConsultingCost({ ...c, id: editing.id } as ConsultingCost);
            setCreating(false); setEditing(null);
          }}
          onCancel={() => { setCreating(false); setEditing(null); }}
        />
      )}

      <SortableTable
        columns={columns}
        data={items}
        keyFn={(c) => c.id}
        actions={(c) => (
          <div className="flex gap-2">
            <button onClick={() => { setEditing(c); setCreating(false); }} className="text-sm text-primary hover:underline">Bearbeiten</button>
            <button onClick={() => { if (confirm("Löschen?")) deleteConsultingCost(c.id); }} className="text-sm text-destructive hover:underline">Löschen</button>
          </div>
        )}
      />
    </div>
  );
}

function ConsultingForm({ initial, isNew, onSave, onCancel }: {
  initial: Omit<ConsultingCost, "id"> | ConsultingCost; isNew: boolean;
  onSave: (c: Omit<ConsultingCost, "id">) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...initial, monthlyAmounts: { ...initial.monthlyAmounts } });
  const months = fiscalYearMonths(currentFiscalYear());
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const setMonth = (m: string, v: string) => {
    const num = parseFloat(v);
    setForm((f) => {
      const ma = { ...f.monthlyAmounts };
      if (!v || isNaN(num)) delete ma[m]; else ma[m] = num;
      return { ...f, monthlyAmounts: ma };
    });
  };

  return (
    <div className="mb-6 rounded-xl border border-primary/30 bg-card p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold">{isNew ? "Neuer Dienstleister" : "Dienstleister bearbeiten"}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Inp label="Bezeichnung *" value={form.name} onChange={(v) => set("name", v)} />
        <Inp label="Lieferant *" value={form.vendor} onChange={(v) => set("vendor", v)} />
        <Inp label="Firma *" value={form.company} onChange={(v) => set("company", v)} />
        <Inp label="KST" value={form.costCenter} onChange={(v) => set("costCenter", v.replace(/\D/g, ""))} />
      </div>
      <div className="mt-4">
        <label className="mb-2 block text-xs font-medium text-muted-foreground">Monatliche Beträge (aktuelles Geschäftsjahr)</label>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
          {months.map((m) => (
            <div key={m}>
              <label className="mb-0.5 block text-[10px] text-muted-foreground">{formatMonth(m)}</label>
              <input type="number" step="0.01" value={form.monthlyAmounts[m] ?? ""} onChange={(e) => setMonth(m, e.target.value)}
                className="w-full rounded border border-input bg-card px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring" placeholder="—" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button onClick={() => { if (form.name && form.vendor) onSave(form as Omit<ConsultingCost, "id">); }} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-petrol-dark transition-colors">Speichern</button>
        <button onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors">Abbrechen</button>
      </div>
    </div>
  );
}

function Inp({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}
