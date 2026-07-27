import type { TimelineEvent } from "@/types";
import { investorPayments } from "./payments";

export const investorTimeline: TimelineEvent[] = [
  {
    id: "tl-1",
    type: "investment_started",
    title: "Investment Started",
    description: "Subscription agreement executed for €100,000 private debt allocation.",
    date: "2024-02-01",
    amount: 100000,
    status: "completed",
  },
  {
    id: "tl-2",
    type: "loan_funded",
    title: "Loan Funded",
    description: "Capital deployed to Nordic Retail Group GmbH senior secured note.",
    date: "2024-02-05",
    amount: 100000,
    status: "completed",
  },
  ...investorPayments.slice(0, 5).map((p, i) => ({
    id: `tl-pay-${i}`,
    type: "completed_payment" as const,
    title: "Completed Payment",
    description: `Monthly repayment received — principal €${p.principal.toFixed(0)}, interest €${p.interest.toFixed(0)}.`,
    date: p.paymentDate ?? p.dueDate,
    amount: p.total,
    status: "completed" as const,
  })),
  {
    id: "tl-upcoming",
    type: "upcoming_payment",
    title: "Upcoming Payment",
    description: "Next scheduled monthly repayment due.",
    date: investorPayments.find((p) => p.status === "upcoming")?.dueDate ?? "2026-07-01",
    amount: investorPayments.find((p) => p.status === "upcoming")?.total,
    status: "upcoming",
  },
  {
    id: "tl-future",
    type: "scheduled_payment",
    title: "Scheduled Payment",
    description: "Future installment on amortization schedule.",
    date: "2026-08-01",
    amount: 4515,
    status: "future",
  },
  {
    id: "tl-close",
    type: "loan_closed",
    title: "Loan Maturity",
    description: "Expected final payment and loan closure.",
    date: "2026-02-01",
    status: "future",
  },
];

export const adminTimeline: TimelineEvent[] = [
  ...investorTimeline,
  {
    id: "tl-admin-1",
    type: "interest_payment",
    title: "Interest Distribution",
    description: "Quarterly interest accrual posted across portfolio.",
    date: "2026-04-01",
    amount: 28500,
    status: "completed",
  },
  {
    id: "tl-admin-2",
    type: "overdue_payment",
    title: "Overdue Payment",
    description: "Payment reminder sent — Walsh portfolio tranche 2.",
    date: "2026-05-15",
    status: "overdue",
  },
];
