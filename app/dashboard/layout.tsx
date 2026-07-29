"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { AppSidebar, DashboardShell } from "@/components/layout/app-sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";
import { investorNavGroups } from "@/constants/navigation";

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["investor"]}>
      <DashboardShell
        sidebar={<AppSidebar groups={investorNavGroups} label="Investor Portal" />}
        topbar={<TopNavbar profileHref="/dashboard/profile" />}
      >
        {children}
      </DashboardShell>
    </AuthGuard>
  );
}
