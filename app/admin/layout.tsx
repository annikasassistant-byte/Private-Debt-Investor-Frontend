"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { AppSidebar, DashboardShell } from "@/components/layout/app-sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";
import { adminNav } from "@/constants/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <DashboardShell
        sidebar={<AppSidebar items={adminNav} label="Administration" />}
        topbar={<TopNavbar profileHref="/admin/profile" />}
      >
        {children}
      </DashboardShell>
    </AuthGuard>
  );
}
