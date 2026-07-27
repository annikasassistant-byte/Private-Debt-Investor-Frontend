"use client";

import { mockNotifications } from "@/mock-data/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">System and portfolio alerts.</p>
      </div>
      <div className="space-y-3">
        {mockNotifications.map((n) => (
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
    </div>
  );
}
