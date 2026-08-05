"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/types";
import { formatCurrencyPrecise, formatDate } from "@/lib/format";
import {
  resolveTimelineDisplayStatus,
  timelineStatusLabel,
} from "@/lib/investment-status";
import {
  eventDay,
  localizeTimelineEvent,
  sortTimelineChronological,
  startOfLocalDay,
} from "@/lib/timeline-i18n";
import {
  AlertCircle,
  Banknote,
  CalendarClock,
  CheckCircle2,
  Circle,
  Landmark,
  Sparkles,
} from "lucide-react";

const statusStyles = {
  completed: {
    ring: "border-emerald-500/30 bg-emerald-500 shadow-emerald-500/25",
    badge: "bg-emerald-500/12 text-emerald-800 dark:text-emerald-300",
    line: "from-emerald-500",
  },
  upcoming: {
    ring: "border-blue-500/40 bg-blue-500 shadow-blue-500/30",
    badge: "bg-blue-500/12 text-blue-800 dark:text-blue-300",
    line: "from-blue-500",
  },
  future: {
    ring: "border-border bg-muted text-muted-foreground shadow-none",
    badge: "bg-muted text-muted-foreground",
    line: "from-border",
  },
  overdue: {
    ring: "border-red-500/40 bg-red-500 shadow-red-500/25",
    badge: "bg-red-500/12 text-red-800 dark:text-red-300",
    line: "from-red-500",
  },
};

const icons = {
  investment_started: Sparkles,
  loan_funded: Landmark,
  scheduled_payment: CalendarClock,
  completed_payment: CheckCircle2,
  interest_payment: Banknote,
  upcoming_payment: CalendarClock,
  overdue_payment: AlertCircle,
  loan_closed: Circle,
};

type TimelineItem =
  | { kind: "event"; event: TimelineEvent }
  | { kind: "heute" };

function isPaymentLike(event: TimelineEvent) {
  return (
    event.type.includes("payment") ||
    event.status === "upcoming" ||
    event.status === "overdue" ||
    event.status === "future"
  );
}

function buildItems(events: TimelineEvent[]): TimelineItem[] {
  const ordered = sortTimelineChronological(events);
  const today = startOfLocalDay();
  const items: TimelineItem[] = [];
  let heuteInserted = false;

  for (const event of ordered) {
    const day = eventDay(event.date);
    if (!heuteInserted && day.getTime() > today.getTime()) {
      items.push({ kind: "heute" });
      heuteInserted = true;
    }
    items.push({ kind: "event", event });
  }

  if (!heuteInserted && ordered.length > 0) {
    const last = eventDay(ordered[ordered.length - 1].date);
    if (last.getTime() <= today.getTime()) {
      items.push({ kind: "heute" });
    }
  }

  return items;
}

export function Timeline({
  events,
  autoScrollToUpcoming = false,
  showHeute = true,
}: {
  events: TimelineEvent[];
  /** Chronological order + scroll to next upcoming/overdue payment. */
  autoScrollToUpcoming?: boolean;
  /** Visual "Heute" marker in the investment lifecycle. */
  showHeute?: boolean;
}) {
  const upcomingRef = useRef<HTMLLIElement | null>(null);
  const heuteRef = useRef<HTMLLIElement | null>(null);

  const ordered = useMemo(() => sortTimelineChronological(events), [events]);

  const items = useMemo(
    () => (showHeute ? buildItems(ordered) : ordered.map((event) => ({ kind: "event" as const, event }))),
    [ordered, showHeute]
  );

  const focusId = useMemo(() => {
    if (!autoScrollToUpcoming) return null;
    const overdue = ordered.find((e) => e.status === "overdue" && isPaymentLike(e));
    if (overdue) return overdue.id;
    const upcoming = ordered.find((e) => e.status === "upcoming" && isPaymentLike(e));
    if (upcoming) return upcoming.id;
    const scheduled = ordered.find(
      (e) =>
        (e.status === "future" ||
          e.type === "scheduled_payment" ||
          e.type === "upcoming_payment") &&
        isPaymentLike(e)
    );
    return scheduled?.id ?? null;
  }, [ordered, autoScrollToUpcoming]);

  useEffect(() => {
    if (!autoScrollToUpcoming) return;
    const timer = window.setTimeout(() => {
      if (focusId) {
        upcomingRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        heuteRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 120);
    return () => window.clearTimeout(timer);
  }, [autoScrollToUpcoming, focusId, ordered.length]);

  return (
    <div className="relative mx-auto max-w-3xl px-1 sm:px-0">
      <div
        className="absolute left-[22px] top-0 bottom-0 w-0.5 rounded-full bg-gradient-to-b from-primary/40 via-border to-transparent md:left-1/2 md:-translate-x-px"
        aria-hidden
      />

      <ul className="space-y-6 sm:space-y-10">
        {items.map((item, index) => {
          if (item.kind === "heute") {
            return (
              <motion.li
                key="heute-marker"
                ref={heuteRef}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35 }}
                className="relative flex items-center gap-4 md:justify-center"
                aria-label="Heute"
              >
                <div className="hidden flex-1 md:block" />
                <div className="relative z-10 flex w-full max-w-md items-center gap-3 md:max-w-none md:justify-center">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-amber-500/80 md:max-w-[120px]" />
                  <div className="flex shrink-0 items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800 dark:text-amber-200">
                      Heute
                    </span>
                    <time className="hidden text-[11px] font-medium text-amber-800/80 dark:text-amber-200/80 sm:inline">
                      {formatDate(new Date())}
                    </time>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-500/50 to-amber-500/80 md:max-w-[120px]" />
                </div>
                <div className="hidden flex-1 md:block" />
              </motion.li>
            );
          }

          const event = item.event;
          const localized = localizeTimelineEvent(event);
          const Icon = icons[event.type] ?? Circle;
          const displayStatus = resolveTimelineDisplayStatus(event);
          const styles = statusStyles[displayStatus];
          const isUpcoming = displayStatus === "upcoming" || event.id === focusId;
          const alignRight = index % 2 === 1;

          return (
            <motion.li
              key={event.id}
              ref={event.id === focusId ? upcomingRef : undefined}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: Math.min(index, 12) * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative flex gap-5 md:gap-0",
                alignRight ? "md:flex-row-reverse" : "md:flex-row"
              )}
            >
              <div className="hidden flex-1 md:block" />

              <motion.div
                className={cn(
                  "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-background text-white shadow-lg",
                  styles.ring,
                  isUpcoming && "ring-4 ring-blue-500/20"
                )}
                animate={isUpcoming ? { scale: [1, 1.06, 1] } : undefined}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                className={cn(
                  "flex-1 rounded-2xl border border-border/50 bg-card/90 p-4 shadow-sm backdrop-blur-md transition-shadow duration-300 hover:shadow-md sm:p-5 md:max-w-md",
                  isUpcoming && "border-blue-500/25 bg-gradient-to-br from-blue-500/[0.06] to-card/90",
                  alignRight ? "md:text-right" : ""
                )}
                style={{ boxShadow: isUpcoming ? "var(--shadow-float)" : "var(--shadow-card)" }}
              >
                <div
                  className={cn(
                    "flex flex-wrap items-center gap-2",
                    alignRight && "md:justify-end"
                  )}
                >
                  <time className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {formatDate(event.date)}
                  </time>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      styles.badge
                    )}
                  >
                    {timelineStatusLabel(event)}
                  </span>
                </div>
                <h3 className="mt-2.5 text-base font-semibold tracking-tight">{localized.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {localized.description}
                </p>
                {event.amount !== undefined && (
                  <p className="mt-3 text-lg font-semibold tabular-financial text-foreground">
                    {formatCurrencyPrecise(event.amount)}
                  </p>
                )}
              </motion.div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
