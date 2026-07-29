import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Landmark,
  CreditCard,
  Calendar,
  Clock,
  FileText,
  FileSignature,
  Bell,
  Settings,
  User,
  Wallet,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const adminNav: NavItem[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Investors", href: "/admin/investors", icon: Users },
  { title: "Investments", href: "/admin/investments", icon: TrendingUp },
  { title: "Loans", href: "/admin/loans", icon: Landmark },
  { title: "Payments", href: "/admin/payments", icon: CreditCard },
  { title: "Repayment Schedule", href: "/admin/repayment-schedule", icon: Calendar },
  { title: "Timeline", href: "/admin/timeline", icon: Clock },
  { title: "Financial Reports", href: "/admin/reports", icon: FileText },
  { title: "Contracts", href: "/admin/contracts", icon: FileSignature },
  { title: "Notifications", href: "/admin/notifications", icon: Bell },
  { title: "Settings", href: "/admin/settings", icon: Settings },
  { title: "Profile", href: "/admin/profile", icon: User },
];

export const investorNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Investment", href: "/dashboard/investment", icon: Wallet },
  { title: "Payment Timeline", href: "/dashboard/timeline", icon: Clock },
  { title: "Payment Schedule", href: "/dashboard/schedule", icon: Calendar },
  { title: "Reports", href: "/dashboard/reports", icon: FileText },
  { title: "Contracts", href: "/dashboard/contracts", icon: FileSignature },
  { title: "Profile", href: "/dashboard/profile", icon: User },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

