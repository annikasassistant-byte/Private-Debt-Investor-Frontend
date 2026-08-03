import type { Investment, Payment, PaymentStatus } from "@/types";

/** Client-brief investment display statuses */
export type InvestmentDisplayStatus =
  | "active"
  | "repayment_in_progress"
  | "fully_repaid"
  | "payment_due"
  | "overdue";

const DISPLAY_LABELS: Record<InvestmentDisplayStatus, string> = {
  active: "Aktiv",
  repayment_in_progress: "Rückzahlung läuft",
  fully_repaid: "Vollständig zurückgezahlt",
  payment_due: "Zahlung fällig",
  overdue: "Überfällig",
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

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  completed: "Bezahlt",
  paid: "Bezahlt",
  partially_paid: "Teilweise bezahlt",
  upcoming: "Bevorstehend",
  scheduled: "Geplant",
  future: "Zukünftig",
  overdue: "Überfällig",
  cancelled: "Storniert",
  pending: "Ausstehend",
  active: "Aktiv",
  inactive: "Inaktiv",
  matured: "Fällig gestellt",
  closed: "Geschlossen",
};

/** Map payment API status to German client vocabulary. */
export function paymentDisplayLabel(status: PaymentStatus | string): string {
  const key = String(status);
  if (PAYMENT_STATUS_LABELS[key]) return PAYMENT_STATUS_LABELS[key];
  return key.replace(/_/g, " ");
}
