import type { Investment, Payment, PaymentStatus, TimelineEvent } from "@/types";

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

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dueKey(dueDate?: string | null): string {
  return String(dueDate || "").slice(0, 10);
}

/**
 * Derive investor-facing investment status from investment + payment schedule.
 * "Zahlung fällig" only when an unpaid installment is due today or earlier.
 */
export function deriveInvestmentDisplayStatus(
  investment: Pick<Investment, "status" | "outstandingBalance" | "principalRepaid">,
  payments: Pick<Payment, "status" | "dueDate">[] = []
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

  const today = todayKey();
  const hasPaid = payments.some(
    (p) => p.status === "completed" || p.status === "partially_paid"
  );
  const unpaidDue = payments.some(
    (p) =>
      (p.status === "upcoming" || p.status === "scheduled") &&
      dueKey(p.dueDate) &&
      dueKey(p.dueDate) <= today
  );

  if (unpaidDue) {
    return "payment_due";
  }

  if (hasPaid || (investment.principalRepaid ?? 0) > 0) {
    return "repayment_in_progress";
  }

  if (payments.some((p) => p.status === "upcoming" || p.status === "scheduled")) {
    return "active";
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

const LIFECYCLE_EVENT_TYPES = new Set([
  "investment_started",
  "loan_funded",
  "loan_closed",
]);

/** Visual status for timeline badges — future lifecycle events are not "completed/paid". */
export function resolveTimelineDisplayStatus(
  event: Pick<TimelineEvent, "type" | "status" | "date">
): TimelineEvent["status"] {
  if (!LIFECYCLE_EVENT_TYPES.has(event.type)) {
    return event.status;
  }
  const day = dueKey(event.date);
  if (!day) return event.status;
  const today = todayKey();
  if (day > today) return "future";
  if (day === today) return "upcoming";
  return event.status === "completed" ? "completed" : event.status;
}

/** German badge label for timeline events (not payment vocabulary for lifecycle). */
export function timelineStatusLabel(
  event: Pick<TimelineEvent, "type" | "status" | "date">
): string {
  const display = resolveTimelineDisplayStatus(event);

  if (event.type === "investment_started") {
    if (display === "future") return "Zukünftig";
    if (display === "upcoming") return "Bevorstehend";
    return "Gestartet";
  }
  if (event.type === "loan_funded") {
    if (display === "future") return "Zukünftig";
    if (display === "upcoming") return "Bevorstehend";
    return "Ausgezahlt";
  }
  if (event.type === "loan_closed") {
    if (display === "future") return "Zukünftig";
    return "Abgeschlossen";
  }

  return paymentDisplayLabel(display);
}

/** Collapse trailing “..” / multiple periods to a single final period. */
function normalizeNotePunctuation(note: string): string {
  return note
    .replace(/\.{2,}/g, ".")
    .replace(/\s+\./g, ".")
    .replace(/\.+$/g, ".")
    .trim();
}

/** Localize legacy English weekend/holiday adjustment notes for display. */
export function localizeDateAdjustmentNote(note?: string | null): string {
  if (!note) return "";
  let text = String(note).trim();

  const moved = text.match(
    /Moved from\s+(\S+?)\.?\s+\((weekend|holiday)\)\s+to next business day\s+(\S+?)\.?$/i
  );
  if (moved) {
    const reason = moved[2].toLowerCase() === "weekend" ? "Wochenende" : "Feiertag";
    text = `Verschoben von ${moved[1]} (${reason}) auf den nächsten Geschäftstag ${moved[3]}.`;
    return normalizeNotePunctuation(text);
  }

  const keep = text.match(
    /Contractual due date falls on a (weekend|holiday).*kept as agreed\.?$/i
  );
  if (keep) {
    const reason = keep[1].toLowerCase() === "weekend" ? "Wochenende" : "Feiertag";
    text = `Vertragliches Fälligkeitsdatum fällt auf einen ${reason}; Datum wie vereinbart beibehalten.`;
    return normalizeNotePunctuation(text);
  }

  if (!/verschoben|vertragliches|wochenende|feiertag/i.test(text)) {
    text = text
      .replace(/\bweekend\b/gi, "Wochenende")
      .replace(/\bholiday\b/gi, "Feiertag")
      .replace(/\bMoved from\b/gi, "Verschoben von")
      .replace(/\bto next business day\b/gi, "auf den nächsten Geschäftstag");
  }

  return normalizeNotePunctuation(text);
}
