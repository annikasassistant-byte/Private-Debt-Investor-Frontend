import type { Investment } from "@/types";
import { investorPayments } from "./payments";

const completed = investorPayments.filter((p) => p.status === "completed");
const principalRepaid = completed.reduce((s, p) => s + p.principal, 0);
const interestEarned = completed.reduce((s, p) => s + p.interest, 0);
const lastCompleted = completed[completed.length - 1];
const upcoming = investorPayments.find((p) => p.status === "upcoming");

export const michaelInvestment: Investment = {
  id: "invst-1",
  investorId: "inv-1",
  investorName: "Michael Thompson",
  principal: 100000,
  interestRate: 8,
  termMonths: 24,
  monthlyPayment: investorPayments[0]?.total ?? 4515,
  outstandingBalance: lastCompleted?.remainingBalance ?? 62500,
  interestEarned: Math.round(interestEarned),
  principalRepaid: Math.round(principalRepaid),
  status: "active",
  startDate: "2024-02-01",
  maturityDate: "2026-02-01",
  nextPaymentDate: upcoming?.dueDate ?? "2026-07-01",
  nextPaymentAmount: upcoming?.total ?? 4515,
};

export const mockInvestments: Investment[] = [
  michaelInvestment,
  {
    id: "invst-2",
    investorId: "inv-2",
    investorName: "Elena Richter",
    principal: 250000,
    interestRate: 7.5,
    termMonths: 36,
    monthlyPayment: 7780,
    outstandingBalance: 180000,
    interestEarned: 42000,
    principalRepaid: 70000,
    status: "active",
    startDate: "2023-07-01",
    maturityDate: "2026-07-01",
    nextPaymentDate: "2026-07-15",
    nextPaymentAmount: 7780,
  },
  {
    id: "invst-3",
    investorId: "inv-3",
    investorName: "James Walsh",
    principal: 500000,
    interestRate: 9,
    termMonths: 48,
    monthlyPayment: 12450,
    outstandingBalance: 320000,
    interestEarned: 98000,
    principalRepaid: 180000,
    status: "active",
    startDate: "2022-12-01",
    maturityDate: "2026-12-01",
    nextPaymentDate: "2026-07-01",
    nextPaymentAmount: 12450,
  },
];
