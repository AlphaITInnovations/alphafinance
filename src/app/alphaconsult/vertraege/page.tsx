"use client";

import { useState } from "react";
import { useData } from "@/context/data-context";
import { SortableTable, type Column } from "@/components/sortable-table";
import type { Contract, PricingType, BillingInterval } from "@/lib/types";
import { formatMonth, formatCurrency, nowMonth } from "@/lib/utils";

const EMPTY: Omit<Contract, "id"> = {
  area: "alphaconsult", name: "", vendor: "", company: "", costCenter: "",
  startDate: nowMonth(), billingInterval: "monthly", pricingType: "fixed", monthlyAmount: 0,
};

const BILLING_LABELS: Record<BillingInterval, string> = { monthly: "Monatlich", quarterly: "Quartalsweise", yearly: "Jährlich" };
const PRICING_LABELS: Record<PricingType, string> = { fixed: "Festpreis", "per-user": "Pro Nutzer", "per-device": "Pro Gerät" };

function contractAmount(c: Contract): number {
  return c.pricingType === "fixed" ? (c.monthlyAmount ?? 0) : (c.defaultUnitCount ?? 0) * (c.costPerUnit ?? 0);
}

const columns: Column<Contract>[] = [
  { key: "name", label: "Vertrag", sortValue: (c) => c.name, render: (c) => (
    <div><div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground">{c.vendor}</div></div>
  )},
  { key: "company", label: "Firma", sortValue: (c) => c.company, render: (c) => c.company },
  { key: "kst", label: "KST", sortValue: (c) => c.costCenter, render: (c) => c.costCenter, className: "tabular-nums" },
  { key: "start", label: "Start", sortValue: (c) => c.startDate, render: (c) => formatMonth(c.startDate) },
  { key: "end", label: "Ende", sortValue: (c) => c.endDate ?? "9999", render: (c) => c.endDate ? formatMonth(c.endDate) : "—" },
  { key: "billing", label: "Intervall", sortValue: (c) => c.billingInterval, render: (c) => BILLING_LABELS[c.billingInterval] },
  { key: "type", label: "Typ", sortValue: (c) => c.pricingType, render: (c) => PRICING_LABELS[c.pricingType] },
  { key: "amount", label: "Betrag", sortValue: (c) => contractAmount(c), className: "text-right tabular-nums",
    render: (c) => c.pricingType === "fixed" ? formatCurrency(c.monthlyAmount ?? 0) : `${c.defaultUnitCount ?? 0} × ${formatCurrency(c.costPerUnit ?? 0)}` },
  { key: "status", label: "Status", sortValue: (c) => c.endDate && nowMonth() > c.endDate ? "beendet" : "aktiv",
    render: (c) => {
      const ended = c.endDate && nowMonth() > c.endDate;
      return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ended ? "bg-muted text-muted-foreground" : "bg-petrol-superlight text-primary"}`}>{ended ? "Beendet" : "Aktiv"}</span>;
    }},
];

export default function VertraegePage() {
  const { contractsByArea, addContract, updateContract, deleteContract } = useData();
  const contracts = contractsByArea("alphaconsult");
  const [editing, setEditing] = useState<Contract | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Verträge</h1>
          <p className="mt-1 text-sm text-muted-foreground">Laufende Verträge verwalten — Klicken Sie auf Spaltenköpfe zum Sortieren</p>
        </div>
        <button onClick={() => { setCreating(true); setEditing(null); }} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-petrol-dark transition-colors">
          + Neuer Vertrag
        </button>
      </div>

      {(creating || editing) && (
        <ContractForm
          initial={editing ?? EMPTY}
          isNew={creating}
          onSave={(c) => {
            if (creating) addContract(c); else if (editing) updateContract({ ...c, id: editing.id } as Contract);
            setCreating(false); setEditing(null);
          }}
          onCancel={() => { setCreating(false); setEditing(null); }}
        />
      )}

      <SortableTable
        columns={columns}
        data={contracts}
        keyFn={(c) => c.id}
        actions={(c) => (
          <div className="flex gap-2">
            <button onClick={() => { setEditing(c); setCreating(false); }} className="text-sm text-primary hover:underline">Bearbeiten</button>
            <button onClick={() => { if (confirm("Vertrag löschen?")) deleteContract(c.id); }} className="text-sm text-destructive hover:underline">Löschen</button>
          </div>
        )}
      />
    </div>
  );
}

function ContractForm({ initial, isNew, onSave, onCancel }: {
  initial: Omit<Contract, "id"> | Contract; isNew: boolean;
  onSave: (c: Omit<Contract, "id">) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...initial });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="mb-6 rounded-xl border border-primary/30 bg-card p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold">{isNew ? "Neuer Vertrag" : "Vertrag bearbeiten"}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Inp label="Vertragsname *" value={form.name} onChange={(v) => set("name", v)} />
        <Inp label="Lieferant *" value={form.vendor} onChange={(v) => set("vendor", v)} />
        <Inp label="Firma *" value={form.company} onChange={(v) => set("company", v)} />
        <Inp label="KST *" value={form.costCenter} onChange={(v) => set("costCenter", v.replace(/\D/g, ""))} />
        <Inp label="Startdatum" value={form.startDate} onChange={(v) => set("startDate", v)} type="month" />
        <Inp label="Vertragsende" value={form.endDate ?? ""} onChange={(v) => set("endDate", v || undefined)} type="month" />
        <Inp label="Kündigungsfrist" value={form.cancellationPeriod ?? ""} onChange={(v) => set("cancellationPeriod", v || undefined)} placeholder="z.B. 3 Monate" />
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Intervall</label>
          <select value={form.billingInterval} onChange={(e) => set("billingInterval", e.target.value as BillingInterval)} className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm">
            <option value="monthly">Monatlich</option><option value="quarterly">Quartalsweise</option><option value="yearly">Jährlich</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Preismodell</label>
          <select value={form.pricingType} onChange={(e) => set("pricingType", e.target.value as PricingType)} className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm">
            <option value="fixed">Festpreis</option><option value="per-user">Pro Nutzer</option><option value="per-device">Pro Gerät</option>
          </select>
        </div>
        {form.pricingType === "fixed" ? (
          <Inp label="Betrag (€)" value={String(form.monthlyAmount ?? "")} onChange={(v) => set("monthlyAmount", parseFloat(v) || 0)} type="number" />
        ) : (
          <>
            <Inp label="Kosten/Einheit (€)" value={String(form.costPerUnit ?? "")} onChange={(v) => set("costPerUnit", parseFloat(v) || 0)} type="number" />
            <Inp label="Standard-Anzahl" value={String(form.defaultUnitCount ?? "")} onChange={(v) => set("defaultUnitCount", parseInt(v) || 0)} type="number" />
          </>
        )}
      </div>
      <div className="mt-4 flex gap-3">
        <button onClick={() => { if (form.name && form.vendor && form.company) onSave(form as Omit<Contract, "id">); }} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-petrol-dark transition-colors">Speichern</button>
        <button onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors">Abbrechen</button>
      </div>
    </div>
  );
}

function Inp({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}
