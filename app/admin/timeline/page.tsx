"use client";

import { adminTimeline } from "@/mock-data/timeline";
import { Timeline } from "@/components/timeline/timeline";

export default function AdminTimelinePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Timeline</h1>
        <p className="text-sm text-muted-foreground">Portfolio-wide events and milestones.</p>
      </div>
      <Timeline events={adminTimeline} />
    </div>
  );
}
