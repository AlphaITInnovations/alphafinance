"use client";

import { useState } from "react";
import { useData } from "@/context/data-context";
import type { Contract, PricingType, BillingInterval } from "@/lib/types";
import { formatMonth, formatCurrency, nowMonth } from "@/lib/utils";

const EMPTY: Omit<Contract, "id"> = {
  area: "alphaconsult",
  name: "",
  vendor: "",
  company: "",
  costCenter: "",
  startDate: nowMonth(),
  billingInterval: "monthly",
  pricingType: "fixed",
  monthlyAmount: 0,
};

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
          <p className="mt-1 text-sm text-muted-foreground">Laufende Verträge verwalten</p>
        </div>
        <button
          onClick={() => { setCreating(true); setEditing(null); }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-petrol-dark transition-colors"
        >
          + Neuer Vertrag
        </button>
      </div>

      {(creating || editing) && (
        <ContractForm
          initial={editing ?? EMPTY}
          isNew={creating}
          onSave={(c) => {
            if (creating) addContract(c);
            else if (editing) updateContract({ ...c, id: editing.id } as Contract);
            setCreating(false); setEditing(null);
          }}
          onCancel={() => { setCreating(false); setEditing(null); }}
        />
      )}

      <div className="space-y-3">
        {contracts.length === 0 && !creating && (
          <p className="text-sm text-muted-foreground">Keine Verträge vorhanden.</p>
        )}
        {contracts.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-card-foreground">{c.name}</h3>
                <p className="text-sm text-muted-foreground">{c.vendor}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(c); setCreating(false); }} className="text-sm text-primary hover:underline">Bearbeiten</button>
                <button onClick={() => { if (confirm("Vertrag löschen?")) deleteContract(c.id); }} className="text-sm text-destructive hover:underline">Löschen</button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
              <Detail label="Firma" value={c.company} />
              <Detail label="KST" value={c.costCenter} />
              <Detail label="Start" value={formatMonth(c.startDate)} />
              <Detail label="Ende" value={c.endDate ? formatMonth(c.endDate) : "—"} />
              <Detail label="Abrechnung" value={c.billingInterval === "monthly" ? "Monatlich" : c.billingInterval === "yearly" ? "Jährlich" : "Quartalsweise"} />
              <Detail label="Typ" value={c.pricingType === "fixed" ? "Festpreis" : c.pricingType === "per-user" ? "Pro Nutzer" : "Pro Gerät"} />
              <Detail label="Betrag" value={
                c.pricingType === "fixed"
                  ? formatCurrency(c.monthlyAmount ?? 0)
                  : `${c.defaultUnitCount ?? 0} × ${formatCurrency(c.costPerUnit ?? 0)}`
              } />
              {c.cancellationPeriod && <Detail label="Kündigungsfrist" value={c.cancellationPeriod} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}: </span>
      <span className="text-card-foreground">{value}</span>
    </div>
  );
}

function ContractForm({
  initial,
  isNew,
  onSave,
  onCancel,
}: {
  initial: Omit<Contract, "id"> | Contract;
  isNew: boolean;
  onSave: (c: Omit<Contract, "id">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...initial });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="mb-6 rounded-xl border border-primary/30 bg-card p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold">{isNew ? "Neuer Vertrag" : "Vertrag bearbeiten"}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Vertragsname *" value={form.name} onChange={(v) => set("name", v)} />
        <Field label="Lieferant *" value={form.vendor} onChange={(v) => set("vendor", v)} />
        <Field label="Firma *" value={form.company} onChange={(v) => set("company", v)} />
        <Field label="KST (Kostenstelle) *" value={form.costCenter} onChange={(v) => set("costCenter", v.replace(/\D/g, ""))} />
        <Field label="Startdatum" value={form.startDate} onChange={(v) => set("startDate", v)} type="month" />
        <Field label="Vertragsende" value={form.endDate ?? ""} onChange={(v) => set("endDate", v || undefined)} type="month" />
        <Field label="Kündigungsfrist" value={form.cancellationPeriod ?? ""} onChange={(v) => set("cancellationPeriod", v || undefined)} placeholder="z.B. 3 Monate" />
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Abrechnungsintervall</label>
          <select value={form.billingInterval} onChange={(e) => set("billingInterval", e.target.value as BillingInterval)} className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm">
            <option value="monthly">Monatlich</option>
            <option value="quarterly">Quartalsweise</option>
            <option value="yearly">Jährlich</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Preismodell</label>
          <select value={form.pricingType} onChange={(e) => set("pricingType", e.target.value as PricingType)} className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm">
            <option value="fixed">Festpreis</option>
            <option value="per-user">Pro Nutzer</option>
            <option value="per-device">Pro Gerät</option>
          </select>
        </div>
        {form.pricingType === "fixed" ? (
          <Field label="Betrag (€)" value={String(form.monthlyAmount ?? "")} onChange={(v) => set("monthlyAmount", parseFloat(v) || 0)} type="number" />
        ) : (
          <>
            <Field label="Kosten pro Einheit (€)" value={String(form.costPerUnit ?? "")} onChange={(v) => set("costPerUnit", parseFloat(v) || 0)} type="number" />
            <Field label="Standard-Anzahl" value={String(form.defaultUnitCount ?? "")} onChange={(v) => set("defaultUnitCount", parseInt(v) || 0)} type="number" />
          </>
        )}
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => { if (form.name && form.vendor && form.company) onSave(form as Omit<Contract, "id">); }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-petrol-dark transition-colors"
        >
          Speichern
        </button>
        <button onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors">
          Abbrechen
        </button>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
