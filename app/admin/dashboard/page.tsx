"use client";

import {
  AlertTriangle,
  Banknote,
  Building2,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import {
  AllocationPieChart,
  PortfolioGrowthChart,
  PrincipalInterestChart,
} from "@/components/charts/dashboard-charts";
import { useAdminStats } from "@/hooks/use-mock-queries";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { kpiSparklines } from "@/lib/sparkline-presets";
import {
  useGetInvestmentsQuery,
  useGetPaymentsQuery,
  useGetTimelineQuery,
} from "@/services/domainApi";
import { timelineToNotifications } from "@/lib/timeline-notifications";
import { EmptyState } from "@/components/shared/empty-state";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStats();
  const { data: payments = [] } = useGetPaymentsQuery();
  const { data: timeline = [] } = useGetTimelineQuery();
  const { data: investments = [] } = useGetInvestmentsQuery();

  if (isLoading || !stats) return <LoadingSkeleton variant="page" />;

  const chartFromPayments = payments.slice(-12).map((p) => ({
    month: p.dueDate?.slice(0, 7) || "",
    principal: p.principal,
    interest: p.interest,
    value: p.remainingBalance,
  }));

  const statusColors: Record<string, string> = {
    active: "var(--chart-1)",
    matured: "var(--chart-2)",
    closed: "var(--chart-3)",
    pending: "var(--chart-4)",
  };
  const allocationByStatus = Object.entries(
    investments.reduce<Record<string, number>>((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + inv.principal;
      return acc;
    }, {}),
  ).map(([name, value]) => ({
    name,
    value,
    fill: statusColors[name] || "var(--chart-5)",
  }));

  const activities = timeline.slice(0, 6).map((t) => ({
    id: t.id,
    action: t.title,
    subject: t.description,
    user: "System",
    timestamp: t.date,
  }));
  const notifications = timelineToNotifications(timeline, 6);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Admin Dashboard"
        description="Portfolio overview across investors, loans, and collections."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Active Investors"
          value={String(stats.totalInvestors)}
          icon={Users}
          sparkline={kpiSparklines.stable}
        />
        <MetricCard
          title="Portfolio Value"
          value={formatCurrency(stats.portfolioValue)}
          icon={Wallet}
          sparkline={kpiSparklines.growth}
          trend={stats.portfolioGrowth}
        />
        <MetricCard
          title="Outstanding Balance"
          value={formatCurrency(stats.outstanding)}
          icon={Building2}
          sparkline={kpiSparklines.decline}
        />
        <MetricCard
          title="Total Investments"
          value={String(stats.totalInvestments)}
          icon={TrendingUp}
          sparkline={kpiSparklines.stable}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Interest Earned"
          value={formatCurrency(stats.interestEarned)}
          icon={Banknote}
          trend={stats.portfolioGrowth}
          sparkline={kpiSparklines.growth}
        />
        <MetricCard
          title="Upcoming Payments"
          value={String(stats.upcomingPayments)}
          icon={TrendingUp}
          sparkline={kpiSparklines.stable}
        />
        <MetricCard
          title="Overdue Payments"
          value={String(stats.overduePayments)}
          icon={AlertTriangle}
          sparkline={kpiSparklines.decline}
        />
        <MetricCard
          title="Collection Rate"
          value={`${stats.collectionRate}%`}
          icon={TrendingUp}
          sparkline={kpiSparklines.growth}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Portfolio growth" description="Remaining balance trend">
          <PortfolioGrowthChart data={chartFromPayments} />
        </ChartCard>
        <ChartCard title="Investment allocation" description="By status">
          <AllocationPieChart data={allocationByStatus} />
        </ChartCard>
      </div>

      <ChartCard title="Revenue trends" description="Principal vs interest collections">
        <PrincipalInterestChart data={chartFromPayments} />
      </ChartCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/40 bg-card/80" style={{ boxShadow: "var(--shadow-card)" }}>
          <CardHeader className="border-b border-border/30 bg-muted/15">
            <CardTitle className="text-base font-semibold">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4">
            {activities.length === 0 ? (
              <EmptyState title="No activity yet" description="Timeline events will appear here." />
            ) : (
              activities.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-border/40 bg-muted/10 px-4 py-3 text-sm transition-colors hover:bg-primary/[0.03]"
                >
                  <p className="font-medium">{a.action}</p>
                  <p className="text-muted-foreground">{a.subject}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {a.user} · {formatDateTime(a.timestamp)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/40 bg-card/80" style={{ boxShadow: "var(--shadow-card)" }}>
          <CardHeader className="border-b border-border/30 bg-muted/15">
            <CardTitle className="text-base font-semibold">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4">
            {notifications.length === 0 ? (
              <EmptyState title="No alerts" description="Payment and portfolio alerts will appear here." />
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="rounded-xl border border-border/40 bg-muted/10 px-4 py-3 text-sm"
                >
                  <p className="font-medium">{n.title}</p>
                  <p className="text-muted-foreground">{n.message}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
