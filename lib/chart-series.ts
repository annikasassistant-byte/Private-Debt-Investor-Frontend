/** Build chart points from the earliest dues so axes start at portfolio onset. */
export function paymentsToChartSeries(
  payments: Array<{
    dueDate: string;
    principal: number;
    interest: number;
    remainingBalance: number;
  }>,
  limit = 12
): Array<{ month: string; principal: number; interest: number; value: number }> {
  const sorted = [...payments].sort((a, b) =>
    String(a.dueDate || "").localeCompare(String(b.dueDate || ""))
  );
  return sorted.slice(0, limit).map((p) => ({
    month: p.dueDate?.slice(0, 7) || "",
    principal: p.principal,
    interest: p.interest,
    value: p.remainingBalance,
  }));
}
