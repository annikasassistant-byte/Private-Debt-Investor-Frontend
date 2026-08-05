"use client";

import { useMemo, useState } from "react";
import { Timeline } from "@/components/timeline/timeline";
import {
  useGetInvestmentsQuery,
  useGetTimelineQuery,
} from "@/services/domainApi";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRepaymentModel } from "@/lib/repayment";
import { formatCurrency } from "@/lib/format";

export default function InvestorTimelinePage() {
  const { data: events = [], isLoading } = useGetTimelineQuery();
  const { data: investments = [] } = useGetInvestmentsQuery();
  const [selectedId, setSelectedId] = useState<string>("all");

  const filtered = useMemo(() => {
    if (selectedId === "all") return events;
    return events.filter((e) => e.investmentId === selectedId);
  }, [events, selectedId]);

  if (isLoading) return <LoadingSkeleton variant="page" />;
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Zahlungszeitachse</h1>
          <p className="text-sm text-muted-foreground">
            Chronologische Ansicht Ihrer Investitionsereignisse.
          </p>
        </div>
        {investments.length > 1 ? (
          <Select
            value={selectedId}
            onValueChange={(v) => setSelectedId(v || "all")}
            items={{
              all: "Alle Investitionen",
              ...Object.fromEntries(
                investments.map((inv) => [
                  inv.id,
                  `${formatCurrency(inv.principal)} · ${formatRepaymentModel(inv.repaymentModel)}`,
                ])
              ),
            }}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Investition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Investitionen</SelectItem>
              {investments.map((inv) => (
                <SelectItem key={inv.id} value={inv.id}>
                  {formatCurrency(inv.principal)} · {formatRepaymentModel(inv.repaymentModel)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="Noch keine Ereignisse"
          description="Die Zeitachse aktualisiert sich, wenn Zahlungen geplant und abgeschlossen werden."
        />
      ) : (
        <Timeline events={filtered} autoScrollToUpcoming />
      )}
    </div>
  );
}
