"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import { useGetTimelineQuery } from "@/services/domainApi";
import { timelineToNotifications } from "@/lib/timeline-notifications";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";

export default function AdminNotificationsPage() {
  const { data: timeline = [], isLoading } = useGetTimelineQuery();
  const notifications = timelineToNotifications(timeline);

  if (isLoading) return <LoadingSkeleton variant="page" />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">System and portfolio alerts from live timeline events.</p>
      </div>
      {notifications.length === 0 ? (
        <EmptyState title="No notifications" description="Alerts appear when payments and investments change." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">{n.title}</CardTitle>
                {!n.read && <Badge>New</Badge>}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
