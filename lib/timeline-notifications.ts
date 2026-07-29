import type { Notification, TimelineEvent } from "@/types";

/** Map portfolio timeline events into notification-shaped UI items. */
export function timelineToNotifications(events: TimelineEvent[], limit = 20): Notification[] {
  return events.slice(0, limit).map((e) => ({
    id: e.id,
    title: e.title,
    message: e.description,
    read: e.status === "completed",
    createdAt: e.date,
    type:
      e.type.includes("payment") || e.type.includes("overdue")
        ? ("payment" as const)
        : e.type.includes("report")
          ? ("report" as const)
          : e.status === "overdue"
            ? ("alert" as const)
            : ("system" as const),
  }));
}
