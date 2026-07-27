"use client";

import { useQuery } from "@tanstack/react-query";
import { mockApi, getAdminStats } from "@/mock-data";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300));
      return getAdminStats();
    },
  });
}

export function useInvestorDashboard() {
  return useQuery({
    queryKey: ["investor-dashboard"],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300));
      return {
        investment: mockApi.michaelInvestment,
        payments: mockApi.investorPayments,
        timeline: mockApi.investorTimeline.slice(0, 6),
      };
    },
  });
}
