import type { Notification, TimelineEvent } from "@/types";
import { localizeTimelineEvent } from "@/lib/timeline-i18n";

/** Map portfolio timeline events into notification-shaped UI items. */
export function timelineToNotifications(events: TimelineEvent[], limit = 20): Notification[] {
  return events.slice(0, limit).map((e) => {
    const localized = localizeTimelineEvent(e);
    return {
      id: e.id,
      title: localized.title,
      message: localized.description,
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
    };
  });
}
