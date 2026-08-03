"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { paymentDisplayLabel } from "@/lib/investment-status";
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

function isPaymentLike(event: TimelineEvent) {
  return (
    event.type.includes("payment") ||
    event.status === "upcoming" ||
    event.status === "overdue" ||
    event.status === "future"
  );
}

export function Timeline({
  events,
  autoScrollToUpcoming = false,
}: {
  events: TimelineEvent[];
  /** Chronological order + scroll to next upcoming/overdue payment. */
  autoScrollToUpcoming?: boolean;
}) {
  const upcomingRef = useRef<HTMLLIElement | null>(null);

  const ordered = useMemo(() => {
    if (!autoScrollToUpcoming) return events;
    return [...events].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }, [events, autoScrollToUpcoming]);

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
    if (!autoScrollToUpcoming || !focusId) return;
    const timer = window.setTimeout(() => {
      upcomingRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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
        {ordered.map((event, index) => {
          const Icon = icons[event.type] ?? Circle;
          const styles = statusStyles[event.status];
          const isUpcoming = event.status === "upcoming" || event.id === focusId;
          const alignRight = index % 2 === 1;

          return (
            <motion.li
              key={event.id}
              ref={event.id === focusId ? upcomingRef : undefined}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
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
                    {paymentDisplayLabel(event.status)}
                  </span>
                </div>
                <h3 className="mt-2.5 text-base font-semibold tracking-tight">{event.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {event.description}
                </p>
                {event.amount !== undefined && (
                  <p className="mt-3 text-lg font-semibold tabular-financial text-foreground">
                    {formatCurrency(event.amount)}
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
