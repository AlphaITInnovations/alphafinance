"use client";

import { useMemo } from "react";
import { useData } from "@/context/data-context";
import {
  formatCurrency,
  formatMonth,
  fiscalYearMonths,
  currentFiscalYear,
  fiscalYearLabel,
  calculateContractCost,
  nowMonth,
} from "@/lib/utils";

export default function DashboardPage() {
  const { contractsByArea, oneTimeCostsByArea, consultingCostsByArea, data } = useData();

  const contracts = contractsByArea("alphaconsult");
  const oneTime = oneTimeCostsByArea("alphaconsult");
  const consulting = consultingCostsByArea("alphaconsult");
  const overrides = data.overrides;

  const fy = currentFiscalYear();
  const months = fiscalYearMonths(fy);
  const current = nowMonth();

  // Compute monthly totals for the fiscal year
  const monthlyData = useMemo(() => {
    return months.map((m) => {
      let contractTotal = 0;
      let consultingTotal = 0;
      let oneTimeTotal = 0;

      contracts.forEach((c) => {
        contractTotal += calculateContractCost(c, m, overrides).amount;
      });
      consulting.forEach((cc) => {
        consultingTotal += cc.monthlyAmounts[m] ?? 0;
      });
      oneTime.forEach((ot) => {
        if (ot.date === m) oneTimeTotal += ot.amount;
      });

      return { month: m, contractTotal, consultingTotal, oneTimeTotal, total: contractTotal + consultingTotal + oneTimeTotal };
    });
  }, [contracts, consulting, oneTime, overrides, months]);

  const fyTotal = monthlyData.reduce((s, d) => s + d.total, 0);
  const fyContractTotal = monthlyData.reduce((s, d) => s + d.contractTotal, 0);
  const fyConsultingTotal = monthlyData.reduce((s, d) => s + d.consultingTotal, 0);
  const fyOneTimeTotal = monthlyData.reduce((s, d) => s + d.oneTimeTotal, 0);

  // Current month data
  const currentData = monthlyData.find((d) => d.month === current);
  const currentTotal = currentData?.total ?? 0;

  // Active contracts
  const activeContracts = contracts.filter((c) => {
    if (current < c.startDate) return false;
    if (c.endDate && current > c.endDate) return false;
    return true;
  });

  const cancelledContracts = contracts.filter((c) => c.endDate && current > c.endDate);

  // Max monthly cost (for bar chart)
  const maxMonthly = Math.max(...monthlyData.map((d) => d.total), 1);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Finanzübersicht — AlphaConsult Gruppe — {fiscalYearLabel(fy)}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Kosten aktueller Monat"
          value={formatCurrency(currentTotal)}
          subtitle={formatMonth(current)}
          color="primary"
        />
        <KPICard
          title={`Gesamtkosten ${fiscalYearLabel(fy)}`}
          value={formatCurrency(fyTotal)}
          subtitle={`${months.length} Monate`}
          color="petrol-dark"
        />
        <KPICard
          title="Aktive Verträge"
          value={String(activeContracts.length)}
          subtitle={cancelledContracts.length > 0 ? `${cancelledContracts.length} gekündigt` : "Alle aktiv"}
          color="success"
        />
        <KPICard
          title="Dienstleister"
          value={String(consulting.length)}
          subtitle={`${oneTime.length} einmalige Positionen`}
          color="warning"
        />
      </div>

      {/* Cost breakdown by category */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-muted-foreground">Verträge</h3>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(fyContractTotal)}</p>
          <div className="mt-3 space-y-2">
            {contracts.map((c) => {
              const total = months.reduce((s, m) => s + calculateContractCost(c, m, overrides).amount, 0);
              return (
                <div key={c.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{c.name}</span>
                  <span className={c.endDate && current > c.endDate ? "text-muted-foreground/50 line-through" : ""}>
                    {formatCurrency(total)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-muted-foreground">Consulting</h3>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(fyConsultingTotal)}</p>
          <div className="mt-3 space-y-2">
            {consulting.map((cc) => {
              const total = months.reduce((s, m) => s + (cc.monthlyAmounts[m] ?? 0), 0);
              return (
                <div key={cc.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{cc.name}</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-muted-foreground">Einmalige Kosten</h3>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(fyOneTimeTotal)}</p>
          <div className="mt-3 space-y-2">
            {oneTime.filter((ot) => months.includes(ot.date)).map((ot) => (
              <div key={ot.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{ot.name}</span>
                <span>{formatCurrency(ot.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="mt-6 rounded-xl border border-border/50 bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Monatliche Kosten — {fiscalYearLabel(fy)}</h3>
        <div className="flex items-end gap-1" style={{ height: 200 }}>
          {monthlyData.map((d) => {
            const h = d.total > 0 ? Math.max((d.total / maxMonthly) * 100, 2) : 0;
            const isCurrent = d.month === current;
            return (
              <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {d.total > 0 ? formatCurrency(d.total) : ""}
                </span>
                <div
                  className={`w-full rounded-t-sm transition-all ${
                    isCurrent ? "bg-primary" : "bg-petrol-light/60"
                  }`}
                  style={{ height: `${h}%` }}
                  title={`${formatMonth(d.month)}: ${formatCurrency(d.total)}`}
                />
                <span className={`text-[10px] ${isCurrent ? "font-bold text-primary" : "text-muted-foreground"}`}>
                  {formatMonth(d.month).split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, subtitle, color }: {
  title: string; value: string; subtitle: string; color: string;
}) {
  const colorMap: Record<string, string> = {
    primary: "text-primary bg-petrol-superlight",
    "petrol-dark": "text-petrol-dark bg-petrol-superlight",
    success: "text-success bg-green-50 dark:bg-green-950/30",
    warning: "text-warning bg-amber-50 dark:bg-amber-950/30",
  };
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-bold text-card-foreground">{value}</p>
      <p className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${colorMap[color] ?? ""}`}>
        {subtitle}
      </p>
    </div>
  );
}
