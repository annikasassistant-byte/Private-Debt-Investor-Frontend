/** Build chart points from portfolio onset (investment/funding start), not first repayment only. */

export type ChartPayment = {
  dueDate: string;
  principal: number;
  interest: number;
  remainingBalance: number;
};

export type ChartPoint = {
  month: string;
  principal: number;
  interest: number;
  value: number;
};

function monthKey(iso?: string | null): string {
  return String(iso || "").slice(0, 7);
}

function addMonth(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Chart series starting at the earliest investment/funding month through payment months.
 * Prepends start months (with opening balance) when they precede the first repayment.
 */
export function paymentsToChartSeries(
  payments: ChartPayment[],
  limitOrOptions:
    | number
    | {
        limit?: number;
        /** ISO dates: investment start, loan fundedAt, etc. */
        anchorDates?: string[];
        /** Portfolio value at the earliest anchor (e.g. sum of principals). */
        openingBalance?: number;
      } = 12
): ChartPoint[] {
  const opts =
    typeof limitOrOptions === "number"
      ? { limit: limitOrOptions }
      : limitOrOptions || {};
  const limit = opts.limit ?? 12;

  const sorted = [...payments].sort((a, b) =>
    String(a.dueDate || "").localeCompare(String(b.dueDate || ""))
  );

  const byMonth = new Map<string, ChartPoint>();
  for (const p of sorted) {
    const month = monthKey(p.dueDate);
    if (!month) continue;
    const prev = byMonth.get(month);
    if (prev) {
      prev.principal += p.principal;
      prev.interest += p.interest;
      prev.value = p.remainingBalance;
    } else {
      byMonth.set(month, {
        month,
        principal: p.principal,
        interest: p.interest,
        value: p.remainingBalance,
      });
    }
  }

  const paymentMonths = [...byMonth.keys()].sort();
  const firstPaymentMonth = paymentMonths[0];
  const anchors = (opts.anchorDates || [])
    .map(monthKey)
    .filter(Boolean)
    .sort();
  const earliestAnchor = anchors[0];

  let opening =
    typeof opts.openingBalance === "number" && Number.isFinite(opts.openingBalance)
      ? opts.openingBalance
      : firstPaymentMonth
        ? (byMonth.get(firstPaymentMonth)?.value || 0) +
          (byMonth.get(firstPaymentMonth)?.principal || 0)
        : 0;

  if (earliestAnchor && (!firstPaymentMonth || earliestAnchor < firstPaymentMonth)) {
    // Fill months from investment/funding start through the month before first payment
    let cursor = earliestAnchor;
    const endExclusive = firstPaymentMonth || addMonth(earliestAnchor, 1);
    while (cursor < endExclusive) {
      if (!byMonth.has(cursor)) {
        byMonth.set(cursor, {
          month: cursor,
          principal: 0,
          interest: 0,
          value: opening,
        });
      }
      cursor = addMonth(cursor, 1);
      if (cursor > "2099-01") break;
    }
  }

  return [...byMonth.keys()]
    .sort()
    .slice(0, limit)
    .map((m) => byMonth.get(m)!);
}
