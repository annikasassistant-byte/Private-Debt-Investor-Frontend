"use client";

import { Timeline } from "@/components/timeline/timeline";
import { useGetTimelineQuery } from "@/services/domainApi";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";

export default function AdminTimelinePage() {
  const { data: events = [], isLoading } = useGetTimelineQuery();

  if (isLoading) return <LoadingSkeleton variant="page" />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Zeitachse</h1>
        <p className="text-sm text-muted-foreground">Portfolioweite Ereignisse und Meilensteine.</p>
      </div>
      {events.length === 0 ? (
        <EmptyState
          title="Keine Zeitachsen-Ereignisse"
          description="Ereignisse erscheinen, sobald Investitionen und Zahlungen erfasst werden."
        />
      ) : (
        <Timeline events={events} autoScrollToUpcoming />
      )}
    </div>
  );
}
