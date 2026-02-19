"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  AppData, Contract, OneTimeCost, ConsultingCost, CostOverride, Area,
} from "@/lib/types";
import { generateId } from "@/lib/utils";

const STORAGE_KEY = "alphafinance-data";

// ── Seed data ──

const SEED: AppData = {
  contracts: [
    {
      id: "timebutler-seed",
      area: "alphaconsult",
      name: "Timebutler",
      vendor: "Timebutler GmbH",
      company: "Dr. Overmann, Loh & Co. KG",
      costCenter: "8080",
      startDate: "2025-12",
      billingInterval: "monthly",
      pricingType: "per-user",
      costPerUnit: 18.267,
      defaultUnitCount: 30,
      monthlyUnits: { "2025-12": 30, "2026-01": 30, "2026-02": 30 },
    },
    {
      id: "codetwo-seed",
      area: "alphaconsult",
      name: "CodeTwo Subskription",
      vendor: "CodeTwo sp. z o.o. sp. k.",
      company: "Dr. Overmann, Loh & Co. KG",
      costCenter: "15",
      startDate: "2026-01",
      billingInterval: "yearly",
      pricingType: "fixed",
      monthlyAmount: 5867.0,
    },
    {
      id: "awork-seed",
      area: "alphaconsult",
      name: "awork",
      vendor: "awork GmbH",
      company: "Dr. Overmann, Loh & Co. KG",
      costCenter: "9",
      startDate: "2025-04",
      endDate: "2025-05",
      potentialEndDate: "2025-06",
      cancellationPeriod: "Gekündigt zum 11.06.2025",
      billingInterval: "monthly",
      pricingType: "fixed",
      monthlyAmount: 149.94,
    },
  ],
  oneTimeCosts: [
    {
      id: "lizenzdoc-seed",
      area: "alphaconsult",
      name: "Windows 11 Lizenzen",
      vendor: "Lizenzdoc UG (haftungsbeschränkt)",
      company: "Dr. Overmann, Loh & Co. KG",
      costCenter: "",
      date: "2026-01",
      amount: 89.0,
      description: "RE. 98688 für VK Bestell-Nr. 100434",
    },
  ],
  consultingCosts: [
    {
      id: "smoodi-seed",
      area: "alphaconsult",
      name: "Smoodi Consulting",
      vendor: "Smoodi.consulting GmbH",
      company: "Dr. Overmann, Loh & Co. KG",
      costCenter: "9",
      monthlyAmounts: { "2025-10": 148.75, "2026-01": 111.56 },
    },
  ],
  overrides: [
    { contractId: "timebutler-seed", month: "2025-12", amount: 71.34 },
    { contractId: "timebutler-seed", month: "2026-02", amount: 528.16 },
  ],
};

// ── Context ──

interface DataContextValue {
  data: AppData;
  loaded: boolean;
  addContract: (c: Omit<Contract, "id">) => Contract;
  updateContract: (c: Contract) => void;
  deleteContract: (id: string) => void;
  addOneTimeCost: (c: Omit<OneTimeCost, "id">) => OneTimeCost;
  updateOneTimeCost: (c: OneTimeCost) => void;
  deleteOneTimeCost: (id: string) => void;
  addConsultingCost: (c: Omit<ConsultingCost, "id">) => ConsultingCost;
  updateConsultingCost: (c: ConsultingCost) => void;
  deleteConsultingCost: (id: string) => void;
  setOverride: (contractId: string, month: string, amount: number) => void;
  removeOverride: (contractId: string, month: string) => void;
  contractsByArea: (area: Area) => Contract[];
  oneTimeCostsByArea: (area: Area) => OneTimeCost[];
  consultingCostsByArea: (area: Area) => ConsultingCost[];
}

const DataContext = createContext<DataContextValue>(null!);
export function useData() { return useContext(DataContext); }

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>({
    contracts: [], oneTimeCosts: [], consultingCosts: [], overrides: [],
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Ensure consultingCosts exists (migration)
        if (!parsed.consultingCosts) parsed.consultingCosts = [];
        setData(parsed);
      } else {
        setData(SEED);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
      }
    } catch { /* fallback */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, loaded]);

  const addContract = useCallback((c: Omit<Contract, "id">) => {
    const item: Contract = { ...c, id: generateId() };
    setData((d) => ({ ...d, contracts: [...d.contracts, item] }));
    return item;
  }, []);

  const updateContract = useCallback((c: Contract) => {
    setData((d) => ({ ...d, contracts: d.contracts.map((x) => x.id === c.id ? c : x) }));
  }, []);

  const deleteContract = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      contracts: d.contracts.filter((x) => x.id !== id),
      overrides: d.overrides.filter((o) => o.contractId !== id),
    }));
  }, []);

  const addOneTimeCost = useCallback((c: Omit<OneTimeCost, "id">) => {
    const item: OneTimeCost = { ...c, id: generateId() };
    setData((d) => ({ ...d, oneTimeCosts: [...d.oneTimeCosts, item] }));
    return item;
  }, []);

  const updateOneTimeCost = useCallback((c: OneTimeCost) => {
    setData((d) => ({ ...d, oneTimeCosts: d.oneTimeCosts.map((x) => x.id === c.id ? c : x) }));
  }, []);

  const deleteOneTimeCost = useCallback((id: string) => {
    setData((d) => ({ ...d, oneTimeCosts: d.oneTimeCosts.filter((x) => x.id !== id) }));
  }, []);

  const addConsultingCost = useCallback((c: Omit<ConsultingCost, "id">) => {
    const item: ConsultingCost = { ...c, id: generateId() };
    setData((d) => ({ ...d, consultingCosts: [...d.consultingCosts, item] }));
    return item;
  }, []);

  const updateConsultingCost = useCallback((c: ConsultingCost) => {
    setData((d) => ({ ...d, consultingCosts: d.consultingCosts.map((x) => x.id === c.id ? c : x) }));
  }, []);

  const deleteConsultingCost = useCallback((id: string) => {
    setData((d) => ({ ...d, consultingCosts: d.consultingCosts.filter((x) => x.id !== id) }));
  }, []);

  const setOverride = useCallback((contractId: string, month: string, amount: number) => {
    setData((d) => {
      const exists = d.overrides.find((o) => o.contractId === contractId && o.month === month);
      if (exists) {
        return { ...d, overrides: d.overrides.map((o) => o.contractId === contractId && o.month === month ? { ...o, amount } : o) };
      }
      return { ...d, overrides: [...d.overrides, { contractId, month, amount }] };
    });
  }, []);

  const removeOverride = useCallback((contractId: string, month: string) => {
    setData((d) => ({ ...d, overrides: d.overrides.filter((o) => !(o.contractId === contractId && o.month === month)) }));
  }, []);

  const contractsByArea = useCallback((area: Area) => data.contracts.filter((c) => c.area === area), [data.contracts]);
  const oneTimeCostsByArea = useCallback((area: Area) => data.oneTimeCosts.filter((c) => c.area === area), [data.oneTimeCosts]);
  const consultingCostsByArea = useCallback((area: Area) => data.consultingCosts.filter((c) => c.area === area), [data.consultingCosts]);

  return (
    <DataContext.Provider value={{
      data, loaded,
      addContract, updateContract, deleteContract,
      addOneTimeCost, updateOneTimeCost, deleteOneTimeCost,
      addConsultingCost, updateConsultingCost, deleteConsultingCost,
      setOverride, removeOverride,
      contractsByArea, oneTimeCostsByArea, consultingCostsByArea,
    }}>
      {children}
    </DataContext.Provider>
  );
}
