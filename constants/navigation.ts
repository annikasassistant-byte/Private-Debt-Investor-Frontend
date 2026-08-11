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
  FolderOpen,
  Share2,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const adminNavGroups: NavGroup[] = [
  {
    items: [
      { title: "Übersicht", href: "/admin/dashboard", icon: LayoutDashboard },
      { title: "Investoren", href: "/admin/investors", icon: Users },
      { title: "Investitionen", href: "/admin/investments", icon: TrendingUp },
      { title: "Kredite", href: "/admin/loans", icon: Landmark },
      { title: "Zahlungen", href: "/admin/payments", icon: CreditCard },
      { title: "Rückzahlungsplan", href: "/admin/repayment-schedule", icon: Calendar },
      { title: "Zeitachse", href: "/admin/timeline", icon: Clock },
    ],
  },
  {
    label: "Berichte & Dokumente",
    items: [
      { title: "Finanzberichte", href: "/admin/reports", icon: FileText },
      { title: "Verträge", href: "/admin/contracts", icon: FileSignature },
    ],
  },
  {
    items: [
      { title: "Benachrichtigungen", href: "/admin/notifications", icon: Bell },
      { title: "Einstellungen", href: "/admin/settings", icon: Settings },
      { title: "Profil", href: "/admin/profile", icon: User },
    ],
  },
];

export const investorNavGroups: NavGroup[] = [
  {
    items: [
      { title: "Übersicht", href: "/dashboard", icon: LayoutDashboard },
      { title: "Meine Investitionen", href: "/dashboard/investment", icon: Wallet },
      { title: "Zahlungszeitachse", href: "/dashboard/timeline", icon: Clock },
      { title: "Zahlungsplan", href: "/dashboard/schedule", icon: Calendar },
    ],
  },
  {
    label: "Berichte & Dokumente",
    items: [
      { title: "Finanzberichte", href: "/dashboard/reports", icon: FileText },
      { title: "Verträge", href: "/dashboard/contracts", icon: FileSignature },
    ],
  },
  {
    items: [
      { title: "BuyBack Capital empfehlen", href: "/dashboard/empfehlen", icon: Share2 },
      { title: "Profil", href: "/dashboard/profile", icon: User },
      { title: "Einstellungen", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

/** Flat lists kept for callers that still expect NavItem[]. */
export const adminNav: NavItem[] = adminNavGroups.flatMap((g) => g.items);
export const investorNav: NavItem[] = investorNavGroups.flatMap((g) => g.items);

export { FolderOpen };
