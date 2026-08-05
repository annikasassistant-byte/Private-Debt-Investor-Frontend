import type { TimelineEvent } from "@/types";
import { formatCurrencyPrecise } from "@/lib/format";

/**
 * Canonical German timeline labels by event type.
 * Used so Admin + Investor always render the same copy, even for legacy English DB rows.
 */
export function localizeTimelineEvent(event: TimelineEvent): {
  title: string;
  description: string;
} {
  const amount =
    event.amount !== undefined && event.amount !== null
      ? formatCurrencyPrecise(event.amount)
      : null;

  switch (event.type) {
    case "investment_started":
      return {
        title: "Investition gestartet",
        description: amount
          ? `Investition über ${amount} gestartet`
          : "Investition gestartet",
      };
    case "loan_funded":
      return {
        title: "Darlehen ausgezahlt",
        description: amount
          ? `Darlehen über ${amount} ausgezahlt`
          : "Darlehen ausgezahlt",
      };
    case "upcoming_payment":
      return {
        title: "Nächste Zahlung",
        description: amount
          ? `Nächste geplante Zahlung über ${amount}`
          : "Nächste geplante Zahlung",
      };
    case "scheduled_payment":
      return {
        title: "Geplante Zahlung",
        description: amount
          ? `Geplante Zahlung über ${amount}`
          : "Geplante Zahlung",
      };
    case "overdue_payment":
      return {
        title: "Überfällige Zahlung",
        description: amount
          ? `Überfällige Zahlung über ${amount}`
          : "Überfällige Zahlung",
      };
    case "completed_payment": {
      const blob = `${event.title || ""} ${event.description || ""}`;
      const isEarly = /vorzeitig|early\s*repay/i.test(blob);
      if (isEarly) {
        return {
          title: "Vorzeitige Rückzahlung",
          description: amount
            ? `Vorzeitige Rückzahlung über ${amount}`
            : "Vorzeitige Rückzahlung",
        };
      }
      return {
        title: "Zahlung erfolgt",
        description: amount
          ? `Zahlung über ${amount} erfolgt`
          : "Zahlung erfolgt",
      };
    }
    case "interest_payment":
      return {
        title: "Teilzahlung / Zinszahlung",
        description: amount
          ? `Teilzahlung über ${amount} erhalten`
          : "Teilzahlung erhalten",
      };
    case "loan_closed":
      return {
        title: "Vollständig zurückgezahlt",
        description: "Investition vollständig zurückgezahlt",
      };
    default:
      return {
        title: event.title || "Ereignis",
        description: event.description || "",
      };
  }
}

/** Sort key for same-day events so lifecycle order is stable. */
export function timelineTypeRank(type: string): number {
  const order: Record<string, number> = {
    investment_started: 0,
    loan_funded: 1,
    scheduled_payment: 2,
    upcoming_payment: 3,
    overdue_payment: 4,
    interest_payment: 5,
    completed_payment: 6,
    loan_closed: 7,
  };
  return order[type] ?? 50;
}

export function sortTimelineChronological(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => {
    const byDate = String(a.date).localeCompare(String(b.date));
    if (byDate !== 0) return byDate;
    return timelineTypeRank(a.type) - timelineTypeRank(b.type);
  });
}

/** Start-of-day local for "Heute" marker placement. */
export function startOfLocalDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function eventDay(date: string | Date): Date {
  const d = typeof date === "string" ? new Date(date) : new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  return d;
}
