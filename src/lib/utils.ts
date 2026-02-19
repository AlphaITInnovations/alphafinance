import { Contract, CostOverride } from "./types";

// ── Fiscal year helpers ──
// Fiscal year: March → February.
// "GJ 2025" = March 2025 – February 2026.

export function currentFiscalYear(): number {
  const now = new Date();
  const month = now.getMonth(); // 0-based
  const year = now.getFullYear();
  return month < 2 ? year - 1 : year; // Jan/Feb → previous FY
}

export function fiscalYearMonths(fy: number): string[] {
  const months: string[] = [];
  for (let m = 3; m <= 12; m++) {
    months.push(`${fy}-${String(m).padStart(2, "0")}`);
  }
  months.push(`${fy + 1}-01`);
  months.push(`${fy + 1}-02`);
  return months;
}

export function calendarYearMonths(year: number): string[] {
  return Array.from({ length: 12 }, (_, i) =>
    `${year}-${String(i + 1).padStart(2, "0")}`
  );
}

export function fiscalYearLabel(fy: number): string {
  return `GJ ${fy}/${fy + 1}`;
}

// ── Formatting ──

const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
];

const MONTH_NAMES_LONG = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export function formatMonth(ym: string): string {
  const [y, m] = ym.split("-");
  return `${MONTH_NAMES_SHORT[parseInt(m, 10) - 1]} ${y.slice(2)}`;
}

export function formatMonthLong(ym: string): string {
  const [y, m] = ym.split("-");
  return `${MONTH_NAMES_LONG[parseInt(m, 10) - 1]} ${y}`;
}

export function formatCurrency(n: number): string {
  return n.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

export function nowMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ── Cost calculation ──

function isBillingMonth(contract: Contract, month: string): boolean {
  if (contract.billingInterval === "monthly") return true;
  const [sY, sM] = contract.startDate.split("-").map(Number);
  const [mY, mM] = month.split("-").map(Number);
  const diff = (mY - sY) * 12 + (mM - sM);
  if (diff < 0) return false;
  if (contract.billingInterval === "yearly") return diff % 12 === 0;
  if (contract.billingInterval === "quarterly") return diff % 3 === 0;
  return true;
}

export function calculateContractCost(
  contract: Contract,
  month: string,
  overrides: CostOverride[],
): { amount: number; isOverridden: boolean; isActive: boolean } {
  // Outside contract period
  if (month < contract.startDate)
    return { amount: 0, isOverridden: false, isActive: false };
  if (contract.endDate && month > contract.endDate)
    return { amount: 0, isOverridden: false, isActive: false };

  // Manual override
  const override = overrides.find(
    (o) => o.contractId === contract.id && o.month === month,
  );
  if (override)
    return { amount: override.amount, isOverridden: true, isActive: true };

  // Not a billing month → 0
  if (!isBillingMonth(contract, month))
    return { amount: 0, isOverridden: false, isActive: true };

  // Fixed pricing
  if (contract.pricingType === "fixed") {
    return {
      amount: contract.monthlyAmount ?? 0,
      isOverridden: false,
      isActive: true,
    };
  }

  // Per-user / per-device
  const units =
    contract.monthlyUnits?.[month] ?? contract.defaultUnitCount ?? 0;
  const costPerUnit = contract.costPerUnit ?? 0;
  return {
    amount: Math.round(units * costPerUnit * 100) / 100,
    isOverridden: false,
    isActive: true,
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}
