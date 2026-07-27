import type { Notification, Activity, ChartPoint } from "@/types";

export const mockNotifications: Notification[] = [
  {
    id: "n-1",
    title: "Payment received",
    message: "€4,515 monthly repayment credited to your account.",
    read: false,
    createdAt: "2026-06-01T09:15:00Z",
    type: "payment",
  },
  {
    id: "n-2",
    title: "New report available",
    message: "June 2026 portfolio statement is ready to download.",
    read: false,
    createdAt: "2026-07-05T14:30:00Z",
    type: "report",
  },
  {
    id: "n-3",
    title: "Upcoming payment",
    message: "Your next payment is due on 1 Jul 2026.",
    read: true,
    createdAt: "2026-06-25T08:00:00Z",
    type: "alert",
  },
  {
    id: "n-4",
    title: "Platform maintenance",
    message: "Scheduled maintenance completed successfully.",
    read: true,
    createdAt: "2026-06-20T22:00:00Z",
    type: "system",
  },
];

export const mockActivities: Activity[] = [
  {
    id: "a-1",
    action: "Payment confirmed",
    subject: "Michael Thompson — €4,515",
    timestamp: "2026-06-01T10:22:00Z",
    user: "John Anderson",
  },
  {
    id: "a-2",
    action: "Report uploaded",
    subject: "June 2026 Consolidated Monthly",
    timestamp: "2026-07-05T15:01:00Z",
    user: "John Anderson",
  },
  {
    id: "a-3",
    action: "Investor updated",
    subject: "Elena Richter contact details",
    timestamp: "2026-06-28T11:45:00Z",
    user: "John Anderson",
  },
  {
    id: "a-4",
    action: "Contract assigned",
    subject: "Side Letter — James Walsh",
    timestamp: "2026-06-15T09:30:00Z",
    user: "John Anderson",
  },
];

export const portfolioGrowthData: ChartPoint[] = [
  { month: "Jan", value: 820000 },
  { month: "Feb", value: 835000 },
  { month: "Mar", value: 848000 },
  { month: "Apr", value: 862000 },
  { month: "May", value: 875000 },
  { month: "Jun", value: 890000 },
  { month: "Jul", value: 905000 },
];

export const principalVsInterestData: ChartPoint[] = [
  { month: "Feb", principal: 3200, interest: 1315 },
  { month: "Mar", principal: 3220, interest: 1295 },
  { month: "Apr", principal: 3240, interest: 1275 },
  { month: "May", principal: 3260, interest: 1255 },
  { month: "Jun", principal: 3280, interest: 1235 },
  { month: "Jul", principal: 3300, interest: 1215 },
];

export const outstandingBalanceData: ChartPoint[] = [
  { month: "Feb", value: 100000 },
  { month: "Mar", value: 96780 },
  { month: "Apr", value: 93560 },
  { month: "May", value: 90340 },
  { month: "Jun", value: 87120 },
  { month: "Jul", value: 83900 },
  { month: "Aug", value: 80680 },
];

export const allocationData = [
  { name: "Senior Secured", value: 45, fill: "var(--chart-1)" },
  { name: "Subordinated", value: 30, fill: "var(--chart-2)" },
  { name: "Mezzanine", value: 15, fill: "var(--chart-3)" },
  { name: "Revolver", value: 10, fill: "var(--chart-4)" },
];

export const repaymentProgressData = [
  { name: "Repaid", value: 37.5 },
  { name: "Outstanding", value: 62.5 },
];
