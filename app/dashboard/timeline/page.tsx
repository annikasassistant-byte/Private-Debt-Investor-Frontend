"use client";

import { Timeline } from "@/components/timeline/timeline";
import { useGetTimelineQuery } from "@/services/domainApi";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";

export default function InvestorTimelinePage() {
  const { data: events = [], isLoading } = useGetTimelineQuery();
  if (isLoading) return <LoadingSkeleton variant="page" />;
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payment Timeline</h1>
        <p className="text-sm text-muted-foreground">Chronological view of your investment events.</p>
      </div>
      {events.length === 0 ? (
        <EmptyState title="No events yet" description="Timeline updates as payments are scheduled and completed." />
      ) : (
        <Timeline events={events} />
      )}
    </div>
  );
}
