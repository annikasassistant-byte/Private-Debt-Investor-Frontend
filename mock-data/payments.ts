import { addMonths, format } from "date-fns";
import type { Payment, PaymentStatus } from "@/types";

const INVESTOR_ID = "inv-1";
const INVESTMENT_ID = "invst-1";
const PRINCIPAL = 100000;
const ANNUAL_RATE = 0.08;
const TERM = 24;
const START = new Date("2024-02-01");

function monthlyPayment(principal: number, annualRate: number, months: number) {
  const r = annualRate / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

const paymentAmount = monthlyPayment(PRINCIPAL, ANNUAL_RATE, TERM);

function buildPayments(): Payment[] {
  const payments: Payment[] = [];
  let balance = PRINCIPAL;
  const monthlyRate = ANNUAL_RATE / 12;

  for (let i = 0; i < TERM; i++) {
    const due = addMonths(START, i + 1);
    const interest = balance * monthlyRate;
    const principal = paymentAmount - interest;
    balance = Math.max(0, balance - principal);

    const paidIndex = 7;
    const paymentStatus: PaymentStatus =
      i < paidIndex
        ? "completed"
        : i === paidIndex
          ? "upcoming"
          : "scheduled";

    payments.push({
      id: `pay-${i + 1}`,
      investmentId: INVESTMENT_ID,
      investorId: INVESTOR_ID,
      dueDate: format(due, "yyyy-MM-dd"),
      paymentDate:
        paymentStatus === "completed" ? format(due, "yyyy-MM-dd") : null,
      principal: Math.round(principal * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      total: Math.round(paymentAmount * 100) / 100,
      remainingBalance: Math.round(balance),
      status: paymentStatus,
    });
  }

  return payments;
}

export const mockPayments = buildPayments();

export const investorPayments = mockPayments.filter((p) => p.investorId === INVESTOR_ID);

export function getAllPayments(): Payment[] {
  return [
    ...mockPayments,
    ...mockPayments.map((p, i) => ({
      ...p,
      id: `pay-inv2-${i}`,
      investorId: "inv-2",
      investmentId: "invst-2",
    })),
  ];
}
