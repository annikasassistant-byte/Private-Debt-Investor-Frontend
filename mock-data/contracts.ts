import type { Contract } from "@/types";

export const mockContracts: Contract[] = [
  {
    id: "ctr-1",
    title: "Private Debt Subscription Agreement",
    type: "loan_agreement",
    signedAt: "2024-01-28",
    size: "2.1 MB",
    investorId: "inv-1",
  },
  {
    id: "ctr-2",
    title: "Subordinated Loan Note — Tranche A",
    type: "subordinated_loan",
    signedAt: "2024-02-01",
    size: "1.8 MB",
    investorId: "inv-1",
  },
  {
    id: "ctr-3",
    title: "Amendment No. 1 — Payment Calendar",
    type: "amendment",
    signedAt: "2024-06-15",
    size: "420 KB",
    investorId: "inv-1",
  },
  {
    id: "ctr-4",
    title: "Side Letter — Information Rights",
    type: "additional",
    signedAt: "2024-01-28",
    size: "310 KB",
    investorId: "inv-1",
  },
  {
    id: "ctr-5",
    title: "Master Loan Agreement Template",
    type: "loan_agreement",
    signedAt: "2023-01-01",
    size: "2.5 MB",
  },
];
