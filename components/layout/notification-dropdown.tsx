"use client";

import { Bell } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useGetTimelineQuery } from "@/services/domainApi";
import { timelineToNotifications } from "@/lib/timeline-notifications";

export function NotificationDropdown() {
  const { data: timeline = [] } = useGetTimelineQuery();
  const notifications = timelineToNotifications(timeline, 8);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative rounded-xl")}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <Badge className="absolute -right-0.5 -top-0.5 h-5 min-w-5 justify-center rounded-full px-1 text-[10px]">
            {unread}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-xl">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <DropdownMenuItem disabled className="text-muted-foreground">
            No notifications yet
          </DropdownMenuItem>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 rounded-lg py-3">
              <span className="font-medium">{n.title}</span>
              <span className="line-clamp-2 text-xs text-muted-foreground">{n.message}</span>
              <span className="text-[10px] text-muted-foreground">{formatDateTime(n.createdAt)}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
