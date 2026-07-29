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
        <h1 className="text-2xl font-semibold tracking-tight">Timeline</h1>
        <p className="text-sm text-muted-foreground">Portfolio-wide events and milestones.</p>
      </div>
      {events.length === 0 ? (
        <EmptyState title="No timeline events" description="Events appear as investments and payments are recorded." />
      ) : (
        <Timeline events={events} />
      )}
    </div>
  );
}
