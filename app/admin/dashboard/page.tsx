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
import {
  allocationData,
  mockActivities,
  portfolioGrowthData,
  principalVsInterestData,
} from "@/mock-data/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockNotifications } from "@/mock-data/analytics";
import { PageHeader } from "@/components/shared/page-header";
import { kpiSparklines } from "@/lib/sparkline-presets";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading || !stats) return <LoadingSkeleton variant="page" />;

  return (
    <div className="space-y-10">
      <PageHeader
        hero
        eyebrow="Administration"
        title="Platform intelligence"
        description="Portfolio analytics, collections health, and operational signals across all investors."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Investors"
          value={String(stats.totalInvestors)}
          icon={Users}
          sparkline={kpiSparklines.growth}
          trend={3.2}
        />
        <MetricCard
          title="Total Investments"
          value={String(stats.totalInvestments)}
          icon={TrendingUp}
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
          trend={-0.5}
        />
        <MetricCard
          title="Collection Rate"
          value={`${stats.collectionRate}%`}
          icon={TrendingUp}
          trend={1.2}
          sparkline={kpiSparklines.growth}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Portfolio growth" description="Total AUM trend">
          <PortfolioGrowthChart data={portfolioGrowthData} />
        </ChartCard>
        <ChartCard title="Investment allocation" description="By strategy">
          <AllocationPieChart data={allocationData} />
        </ChartCard>
      </div>

      <ChartCard title="Revenue trends" description="Principal vs interest collections">
        <PrincipalInterestChart data={principalVsInterestData} />
      </ChartCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/40 bg-card/80" style={{ boxShadow: "var(--shadow-card)" }}>
          <CardHeader className="border-b border-border/30 bg-muted/15">
            <CardTitle className="text-base font-semibold">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4">
            {mockActivities.map((a) => (
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
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/40 bg-card/80" style={{ boxShadow: "var(--shadow-card)" }}>
          <CardHeader className="border-b border-border/30 bg-muted/15">
            <CardTitle className="text-base font-semibold">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4">
            {mockNotifications.map((n) => (
              <div
                key={n.id}
                className="rounded-xl border border-border/40 bg-muted/10 px-4 py-3 text-sm"
              >
                <p className="font-medium">{n.title}</p>
                <p className="text-muted-foreground">{n.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
