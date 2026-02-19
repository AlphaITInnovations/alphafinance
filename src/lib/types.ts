export type Area = "operations" | "solutions" | "alphaconsult";

export type PricingType = "fixed" | "per-user" | "per-device";

export type BillingInterval = "monthly" | "quarterly" | "yearly";

export interface Contract {
  id: string;
  area: Area;
  name: string;
  description?: string;
  vendor: string;
  company: string;
  costCenter: string;
  startDate: string; // YYYY-MM
  endDate?: string; // YYYY-MM — letzter Monat mit Kosten
  potentialEndDate?: string; // YYYY-MM — informativ
  cancellationPeriod?: string;
  billingInterval: BillingInterval;
  pricingType: PricingType;
  monthlyAmount?: number;
  costPerUnit?: number;
  defaultUnitCount?: number;
  monthlyUnits?: Record<string, number>;
}

export interface OneTimeCost {
  id: string;
  area: Area;
  name: string;
  description?: string;
  vendor: string;
  company: string;
  costCenter: string;
  date: string; // YYYY-MM
  amount: number;
}

export interface ConsultingCost {
  id: string;
  area: Area;
  name: string;
  description?: string;
  vendor: string;
  company: string;
  costCenter: string;
  monthlyAmounts: Record<string, number>; // YYYY-MM -> amount
}

export interface CostOverride {
  contractId: string;
  month: string; // YYYY-MM
  amount: number;
}

export interface CostVerification {
  entityId: string;  // contract or consulting cost id
  month: string;     // YYYY-MM
}

export interface AppData {
  contracts: Contract[];
  oneTimeCosts: OneTimeCost[];
  consultingCosts: ConsultingCost[];
  overrides: CostOverride[];
  verifications: CostVerification[];
}
