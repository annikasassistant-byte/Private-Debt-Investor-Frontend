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
import { useGetAdminStatsQuery } from "@/services/domainApi";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import {
  useGetInvestmentsQuery,
  useGetLoansQuery,
  useGetPaymentsQuery,
  useGetTimelineQuery,
} from "@/services/domainApi";
import { timelineToNotifications } from "@/lib/timeline-notifications";
import { localizeTimelineEvent } from "@/lib/timeline-i18n";
import { EmptyState } from "@/components/shared/empty-state";
import { paymentsToChartSeries } from "@/lib/chart-series";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useGetAdminStatsQuery();
  const { data: payments = [] } = useGetPaymentsQuery();
  const { data: timeline = [] } = useGetTimelineQuery();
  const { data: investments = [] } = useGetInvestmentsQuery();
  const { data: loans = [] } = useGetLoansQuery();

  if (isLoading || !stats) return <LoadingSkeleton variant="page" />;

  const chartFromPayments = paymentsToChartSeries(payments, {
    limit: 12,
    anchorDates: [
      ...investments.map((inv) => inv.startDate),
      ...loans.map((loan) => loan.fundedAt),
    ].filter(Boolean),
    openingBalance: investments.reduce((sum, inv) => sum + (inv.principal || 0), 0),
  });

  const statusColors: Record<string, string> = {
    active: "var(--chart-1)",
    matured: "var(--chart-2)",
    closed: "var(--chart-3)",
    pending: "var(--chart-4)",
  };
  const statusLabels: Record<string, string> = {
    active: "Aktiv",
    matured: "Fällig gestellt",
    closed: "Geschlossen",
    pending: "Ausstehend",
  };
  const allocationByStatus = Object.entries(
    investments.reduce<Record<string, number>>((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + inv.principal;
      return acc;
    }, {})
  ).map(([name, value]) => ({
    name: statusLabels[name] || name,
    value,
    fill: statusColors[name] || "var(--chart-5)",
  }));

  const activities = timeline.slice(0, 6).map((t) => {
    const localized = localizeTimelineEvent(t);
    return {
      id: t.id,
      action: localized.title,
      subject: localized.description,
      user: "System",
      timestamp: t.date,
    };
  });
  const notifications = timelineToNotifications(timeline, 6);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Admin-Übersicht"
        description="Portfolioübersicht über Investoren, Kredite und Einzüge."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Aktive Investoren" value={String(stats.totalInvestors)} icon={Users} />
        <MetricCard
          title="Portfoliowert"
          value={formatCurrency(stats.portfolioValue)}
          icon={Wallet}
          subtitle={
            typeof stats.repaidSharePercent === "number" || typeof stats.portfolioGrowth === "number"
              ? `${stats.repaidSharePercent ?? stats.portfolioGrowth}% von Hauptsumme + Finanzierungsgebühr zurückgezahlt`
              : undefined
          }
        />
        <MetricCard
          title="Offener Saldo"
          value={formatCurrency(stats.outstanding)}
          icon={Building2}
        />
        <MetricCard
          title="Investitionen gesamt"
          value={String(stats.totalInvestments)}
          icon={TrendingUp}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Vereinnahmte Finanzierungsgebühr"
          value={formatCurrency(stats.interestEarned)}
          icon={Banknote}
        />
        <MetricCard
          title="Anstehende Zahlungen"
          value={String(stats.upcomingPayments)}
          icon={TrendingUp}
        />
        <MetricCard
          title="Überfällige Zahlungen"
          value={String(stats.overduePayments)}
          icon={AlertTriangle}
        />
        <MetricCard
          title="Einzugsquote"
          value={`${stats.collectionRate}%`}
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Portfoliowachstum" description="Entwicklung des Restsaldos">
          <PortfolioGrowthChart data={chartFromPayments} />
        </ChartCard>
        <ChartCard title="Investitionsallokation" description="Nach Status">
          <AllocationPieChart data={allocationByStatus} />
        </ChartCard>
      </div>

      <ChartCard title="Einnahmenentwicklung" description="Tilgung vs. Finanzierungsgebühr">
        <PrincipalInterestChart data={chartFromPayments} />
      </ChartCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/40 bg-card/80" style={{ boxShadow: "var(--shadow-card)" }}>
          <CardHeader className="border-b border-border/30 bg-muted/15">
            <CardTitle className="text-base font-semibold">Letzte Aktivitäten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4">
            {activities.length === 0 ? (
              <EmptyState title="Noch keine Aktivitäten" description="Zeitachsen-Ereignisse erscheinen hier." />
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
            <CardTitle className="text-base font-semibold">Benachrichtigungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4">
            {notifications.length === 0 ? (
              <EmptyState title="Keine Hinweise" description="Zahlungs- und Portfoliohinweise erscheinen hier." />
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
