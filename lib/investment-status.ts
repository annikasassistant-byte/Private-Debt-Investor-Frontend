import type { Investment, Payment, PaymentStatus } from "@/types";

/** Client-brief investment display statuses */
export type InvestmentDisplayStatus =
  | "active"
  | "repayment_in_progress"
  | "fully_repaid"
  | "payment_due"
  | "overdue";

const DISPLAY_LABELS: Record<InvestmentDisplayStatus, string> = {
  active: "Active",
  repayment_in_progress: "Repayment in Progress",
  fully_repaid: "Fully Repaid",
  payment_due: "Payment Due",
  overdue: "Overdue",
};

/**
 * Derive investor-facing investment status from investment + payment schedule.
 */
export function deriveInvestmentDisplayStatus(
  investment: Pick<Investment, "status" | "outstandingBalance" | "principalRepaid">,
  payments: Pick<Payment, "status">[] = []
): InvestmentDisplayStatus {
  if (
    investment.status === "closed" ||
    investment.status === "matured" ||
    (investment.outstandingBalance ?? 0) <= 0
  ) {
    return "fully_repaid";
  }

  if (payments.some((p) => p.status === "overdue")) {
    return "overdue";
  }

  if (payments.some((p) => p.status === "upcoming" || p.status === "scheduled")) {
    const hasPaid = payments.some(
      (p) => p.status === "completed" || p.status === "partially_paid"
    );
    if (hasPaid || (investment.principalRepaid ?? 0) > 0) {
      return "repayment_in_progress";
    }
    return "payment_due";
  }

  if ((investment.principalRepaid ?? 0) > 0) {
    return "repayment_in_progress";
  }

  return "active";
}

export function investmentDisplayLabel(status: InvestmentDisplayStatus): string {
  return DISPLAY_LABELS[status] || status;
}

/** Map payment API status to client vocabulary (Paid vs completed). */
export function paymentDisplayLabel(status: PaymentStatus | string): string {
  if (status === "completed") return "Paid";
  if (status === "partially_paid") return "Partially Paid";
  return String(status).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
