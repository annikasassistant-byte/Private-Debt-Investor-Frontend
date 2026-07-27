import type { Loan } from "@/types";

export const mockLoans: Loan[] = [
  {
    id: "loan-1",
    investmentId: "invst-1",
    borrower: "Nordic Retail Group GmbH",
    amount: 100000,
    rate: 8,
    status: "active",
    fundedAt: "2024-02-05",
  },
  {
    id: "loan-2",
    investmentId: "invst-2",
    borrower: "Alpine Logistics AG",
    amount: 250000,
    rate: 7.5,
    status: "active",
    fundedAt: "2023-07-10",
  },
  {
    id: "loan-3",
    investmentId: "invst-3",
    borrower: "Celtic Manufacturing Ltd",
    amount: 500000,
    rate: 9,
    status: "active",
    fundedAt: "2022-12-15",
  },
];
