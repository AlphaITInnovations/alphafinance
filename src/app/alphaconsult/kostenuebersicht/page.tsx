"use client";

import { useState, useMemo } from "react";
import { useData } from "@/context/data-context";
import {
  formatMonth,
  formatCurrency,
  fiscalYearMonths,
  calendarYearMonths,
  currentFiscalYear,
  fiscalYearLabel,
  calculateContractCost,
} from "@/lib/utils";

type ViewMode = "fiscal" | "yearly" | "monthly";
type SortBy = "default" | "name" | "kst" | "total-asc" | "total-desc";

export default function KostenuebersichtPage() {
  const {
    contractsByArea, oneTimeCostsByArea, consultingCostsByArea,
    data, setOverride, removeOverride, updateConsultingCost,
  } = useData();

  const contracts = contractsByArea("alphaconsult");
  const oneTime = oneTimeCostsByArea("alphaconsult");
  const consulting = consultingCostsByArea("alphaconsult");
  const overrides = data.overrides;

  const [viewMode, setViewMode] = useState<ViewMode>("fiscal");
  const [fy, setFy] = useState(currentFiscalYear());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [monthIdx, setMonthIdx] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  // Visible months
  const months = useMemo(() => {
    if (viewMode === "fiscal") return fiscalYearMonths(fy);
    if (viewMode === "yearly") return calendarYearMonths(calYear);
    return [monthIdx];
  }, [viewMode, fy, calYear, monthIdx]);

  const periodLabel = viewMode === "fiscal"
    ? fiscalYearLabel(fy)
    : viewMode === "yearly"
      ? `Kalenderjahr ${calYear}`
      : formatMonth(monthIdx);

  // ── Sort ──
  const [sortBy, setSortBy] = useState<SortBy>("default");

  const sortedContracts = useMemo(() => {
    if (sortBy === "default") return contracts;
    const arr = [...contracts];
    if (sortBy === "name") return arr.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "kst") return arr.sort((a, b) => a.costCenter.localeCompare(b.costCenter));
    // total-asc / total-desc
    const dir = sortBy === "total-asc" ? 1 : -1;
    return arr.sort((a, b) => {
      const ta = months.reduce((s, m) => s + calculateContractCost(a, m, overrides).amount, 0);
      const tb = months.reduce((s, m) => s + calculateContractCost(b, m, overrides).amount, 0);
      return (ta - tb) * dir;
    });
  }, [contracts, sortBy, months, overrides]);

  const sortedConsulting = useMemo(() => {
    if (sortBy === "default") return consulting;
    const arr = [...consulting];
    if (sortBy === "name") return arr.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "kst") return arr.sort((a, b) => a.costCenter.localeCompare(b.costCenter));
    const dir = sortBy === "total-asc" ? 1 : -1;
    return arr.sort((a, b) => {
      const ta = months.reduce((s, m) => s + (a.monthlyAmounts[m] ?? 0), 0);
      const tb = months.reduce((s, m) => s + (b.monthlyAmounts[m] ?? 0), 0);
      return (ta - tb) * dir;
    });
  }, [consulting, sortBy, months]);

  const sortedOneTime = useMemo(() => {
    if (sortBy === "default") return oneTime;
    const arr = [...oneTime];
    if (sortBy === "name") return arr.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "kst") return arr.sort((a, b) => a.costCenter.localeCompare(b.costCenter));
    const dir = sortBy === "total-asc" ? 1 : -1;
    return arr.sort((a, b) => (a.amount - b.amount) * dir);
  }, [oneTime, sortBy]);

  // ── One-time cost collapsible ──
  const [otExpanded, setOtExpanded] = useState(false);

  // ── Editing state ──
  const [editCell, setEditCell] = useState<{ id: string; month: string } | null>(null);
  const [editValue, setEditValue] = useState("");

  // ── Navigate ──
  const prev = () => {
    if (viewMode === "fiscal") setFy((f) => f - 1);
    else if (viewMode === "yearly") setCalYear((y) => y - 1);
    else {
      const [y, m] = monthIdx.split("-").map(Number);
      const d = new Date(y, m - 2, 1);
      setMonthIdx(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
  };
  const next = () => {
    if (viewMode === "fiscal") setFy((f) => f + 1);
    else if (viewMode === "yearly") setCalYear((y) => y + 1);
    else {
      const [y, m] = monthIdx.split("-").map(Number);
      const d = new Date(y, m, 1);
      setMonthIdx(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
  };

  // ── Totals ──
  const monthTotals = months.map((m) => {
    let total = 0;
    contracts.forEach((c) => {
      total += calculateContractCost(c, m, overrides).amount;
    });
    oneTime.forEach((ot) => {
      if (ot.date === m) total += ot.amount;
    });
    consulting.forEach((cc) => {
      total += cc.monthlyAmounts[m] ?? 0;
    });
    return total;
  });

  const grandTotal = monthTotals.reduce((s, v) => s + v, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Kostenübersicht</h1>
        <p className="mt-1 text-sm text-muted-foreground">Alle Kosten im Überblick — AlphaConsult Gruppe</p>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* View mode */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(["fiscal", "yearly", "monthly"] as ViewMode[]).map((vm) => (
            <button
              key={vm}
              onClick={() => setViewMode(vm)}
              className={`px-3 py-1.5 text-sm transition-colors ${viewMode === vm ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}
            >
              {vm === "fiscal" ? "Geschäftsjahr" : vm === "yearly" ? "Kalenderjahr" : "Monatlich"}
            </button>
          ))}
        </div>
        {/* Period navigation */}
        <div className="flex items-center gap-2">
          <button onClick={prev} className="rounded border border-border px-2 py-1 text-sm hover:bg-muted">&larr;</button>
          <span className="min-w-[120px] text-center text-sm font-medium">{periodLabel}</span>
          <button onClick={next} className="rounded border border-border px-2 py-1 text-sm hover:bg-muted">&rarr;</button>
        </div>
        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="default">Standard-Reihenfolge</option>
          <option value="name">Name (A-Z)</option>
          <option value="kst">Kostenstelle</option>
          <option value="total-desc">Summe (absteigend)</option>
          <option value="total-asc">Summe (aufsteigend)</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border/50 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="sticky left-0 z-10 bg-muted/50 px-4 py-3 text-left font-medium text-muted-foreground min-w-[200px]">Position</th>
              {months.map((m) => (
                <th key={m} className="px-3 py-3 text-right font-medium text-muted-foreground whitespace-nowrap min-w-[100px]">
                  {formatMonth(m)}
                </th>
              ))}
              {months.length > 1 && (
                <th className="px-3 py-3 text-right font-medium text-muted-foreground min-w-[100px]">Summe</th>
              )}
            </tr>
          </thead>
          <tbody>
            {/* ── Contracts ── */}
            {contracts.length > 0 && (
              <tr>
                <td colSpan={months.length + (months.length > 1 ? 2 : 1)} className="bg-petrol-superlight/30 px-4 py-1.5 text-xs font-semibold text-petrol-dark uppercase tracking-wider">
                  Verträge
                </td>
              </tr>
            )}
            {sortedContracts.map((c) => {
              const cells = months.map((m) => calculateContractCost(c, m, overrides));
              const rowTotal = cells.reduce((s, cell) => s + cell.amount, 0);
              return (
                <tr key={c.id} className="border-b border-border/30 hover:bg-muted/30">
                  <td className="sticky left-0 z-10 bg-card px-4 py-2 font-medium">
                    <div>{c.name}</div>
                    <div className="text-[10px] text-muted-foreground">{c.vendor} · KST {c.costCenter}</div>
                  </td>
                  {cells.map((cell, i) => (
                    <CostCell
                      key={months[i]}
                      amount={cell.amount}
                      isOverridden={cell.isOverridden}
                      isActive={cell.isActive}
                      isEditing={editCell?.id === c.id && editCell?.month === months[i]}
                      editValue={editValue}
                      onStartEdit={() => { setEditCell({ id: c.id, month: months[i] }); setEditValue(String(cell.amount || "")); }}
                      onEditChange={setEditValue}
                      onSaveEdit={() => {
                        const num = parseFloat(editValue);
                        if (!isNaN(num)) setOverride(c.id, months[i], num);
                        setEditCell(null);
                      }}
                      onCancelEdit={() => setEditCell(null)}
                      onRemoveOverride={cell.isOverridden ? () => removeOverride(c.id, months[i]) : undefined}
                    />
                  ))}
                  {months.length > 1 && (
                    <td className="px-3 py-2 text-right font-semibold">{formatCurrency(rowTotal)}</td>
                  )}
                </tr>
              );
            })}

            {/* ── Consulting ── */}
            {consulting.length > 0 && (
              <tr>
                <td colSpan={months.length + (months.length > 1 ? 2 : 1)} className="bg-petrol-superlight/30 px-4 py-1.5 text-xs font-semibold text-petrol-dark uppercase tracking-wider">
                  Consulting
                </td>
              </tr>
            )}
            {sortedConsulting.map((cc) => {
              const rowTotal = months.reduce((s, m) => s + (cc.monthlyAmounts[m] ?? 0), 0);
              return (
                <tr key={cc.id} className="border-b border-border/30 hover:bg-muted/30">
                  <td className="sticky left-0 z-10 bg-card px-4 py-2 font-medium">
                    <div>{cc.name}</div>
                    <div className="text-[10px] text-muted-foreground">{cc.vendor} · KST {cc.costCenter}</div>
                  </td>
                  {months.map((m) => {
                    const amt = cc.monthlyAmounts[m] ?? 0;
                    const isEditingThis = editCell?.id === cc.id && editCell?.month === m;
                    if (isEditingThis) {
                      return (
                        <td key={m} className="px-1 py-1">
                          <input
                            type="number" step="0.01" value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const num = parseFloat(editValue);
                                const ma = { ...cc.monthlyAmounts };
                                if (!editValue || isNaN(num) || num === 0) delete ma[m]; else ma[m] = num;
                                updateConsultingCost({ ...cc, monthlyAmounts: ma });
                                setEditCell(null);
                              }
                              if (e.key === "Escape") setEditCell(null);
                            }}
                            onBlur={() => {
                              const num = parseFloat(editValue);
                              const ma = { ...cc.monthlyAmounts };
                              if (!editValue || isNaN(num) || num === 0) delete ma[m]; else ma[m] = num;
                              updateConsultingCost({ ...cc, monthlyAmounts: ma });
                              setEditCell(null);
                            }}
                            autoFocus
                            className="w-full rounded border border-primary bg-card px-2 py-1 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </td>
                      );
                    }
                    return (
                      <td
                        key={m}
                        onClick={() => { setEditCell({ id: cc.id, month: m }); setEditValue(String(amt || "")); }}
                        className={`px-3 py-2 text-right tabular-nums cursor-pointer hover:bg-primary/5 ${amt === 0 ? "text-muted-foreground/40" : ""}`}
                        title="Klicken zum Bearbeiten"
                      >
                        {amt === 0 ? "—" : formatCurrency(amt)}
                      </td>
                    );
                  })}
                  {months.length > 1 && (
                    <td className="px-3 py-2 text-right font-semibold">{formatCurrency(rowTotal)}</td>
                  )}
                </tr>
              );
            })}

            {/* ── One-time costs (collapsible) ── */}
            {oneTime.length > 0 && (
              <>
                <tr
                  className="cursor-pointer"
                  onClick={() => setOtExpanded(!otExpanded)}
                >
                  <td className="sticky left-0 z-10 bg-petrol-superlight/30 px-4 py-1.5 text-xs font-semibold text-petrol-dark uppercase tracking-wider">
                    <span className="mr-1">{otExpanded ? "▼" : "▶"}</span>
                    Einmalige Kosten
                  </td>
                  {!otExpanded && months.map((m) => {
                    const sum = oneTime.filter((ot) => ot.date === m).reduce((s, ot) => s + ot.amount, 0);
                    return (
                      <td key={m} className={`bg-petrol-superlight/30 px-3 py-1.5 text-right text-xs font-semibold text-petrol-dark ${sum === 0 ? "text-muted-foreground/40" : ""}`}>
                        {sum === 0 ? "—" : formatCurrency(sum)}
                      </td>
                    );
                  })}
                  {!otExpanded && months.length > 1 && (
                    <td className="bg-petrol-superlight/30 px-3 py-1.5 text-right text-xs font-semibold text-petrol-dark">
                      {formatCurrency(oneTime.reduce((s, ot) => {
                        return months.includes(ot.date) ? s + ot.amount : s;
                      }, 0))}
                    </td>
                  )}
                  {otExpanded && <td colSpan={months.length + (months.length > 1 ? 1 : 0)} className="bg-petrol-superlight/30" />}
                </tr>
                {otExpanded && sortedOneTime.map((ot) => (
                  <tr key={ot.id} className="border-b border-border/30 hover:bg-muted/30">
                    <td className="sticky left-0 z-10 bg-card px-4 py-2 pl-8 font-medium">
                      <div>{ot.name}</div>
                      <div className="text-[10px] text-muted-foreground">{ot.vendor}</div>
                    </td>
                    {months.map((m) => (
                      <td key={m} className={`px-3 py-2 text-right tabular-nums ${ot.date !== m ? "text-muted-foreground/40" : ""}`}>
                        {ot.date === m ? formatCurrency(ot.amount) : "—"}
                      </td>
                    ))}
                    {months.length > 1 && (
                      <td className="px-3 py-2 text-right font-semibold">
                        {months.includes(ot.date) ? formatCurrency(ot.amount) : "—"}
                      </td>
                    )}
                  </tr>
                ))}
              </>
            )}

            {/* ── Total row ── */}
            <tr className="border-t-2 border-primary/30 bg-muted/50 font-bold">
              <td className="sticky left-0 z-10 bg-muted/50 px-4 py-3">Gesamt</td>
              {monthTotals.map((t, i) => (
                <td key={months[i]} className="px-3 py-3 text-right tabular-nums">
                  {formatCurrency(t)}
                </td>
              ))}
              {months.length > 1 && (
                <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(grandTotal)}</td>
              )}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-amber-100 border border-amber-300" /> Manuell überschrieben
        </span>
        <span>Klicken Sie auf einen Wert, um ihn zu überschreiben</span>
      </div>
    </div>
  );
}

function CostCell({
  amount, isOverridden, isActive, isEditing, editValue,
  onStartEdit, onEditChange, onSaveEdit, onCancelEdit, onRemoveOverride,
}: {
  amount: number;
  isOverridden: boolean;
  isActive: boolean;
  isEditing: boolean;
  editValue: string;
  onStartEdit: () => void;
  onEditChange: (v: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRemoveOverride?: () => void;
}) {
  if (isEditing) {
    return (
      <td className="px-1 py-1">
        <div className="flex items-center gap-1">
          <input
            type="number"
            step="0.01"
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onSaveEdit(); if (e.key === "Escape") onCancelEdit(); }}
            autoFocus
            className="w-full rounded border border-primary bg-card px-2 py-1 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {onRemoveOverride && (
          <button onClick={onRemoveOverride} className="mt-0.5 text-[10px] text-destructive hover:underline">
            Override entfernen
          </button>
        )}
      </td>
    );
  }

  const showAmount = amount !== 0;

  return (
    <td
      onClick={onStartEdit}
      className={`px-3 py-2 text-right tabular-nums cursor-pointer hover:bg-primary/5 ${
        isOverridden ? "bg-amber-50 dark:bg-amber-950/30 font-medium" : ""
      } ${!showAmount ? "text-muted-foreground/40" : ""}`}
      title={isOverridden ? "Manuell überschrieben – klicken zum Bearbeiten" : "Klicken zum Überschreiben"}
    >
      {showAmount ? formatCurrency(amount) : "—"}
      {isOverridden && <span className="ml-1 text-[10px] text-amber-600">●</span>}
    </td>
  );
}
