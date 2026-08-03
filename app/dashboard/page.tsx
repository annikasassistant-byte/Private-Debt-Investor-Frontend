"use client";

import {
  Calendar,
  CircleDollarSign,
  PiggyBank,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import {
  BalanceLineChart,
  PrincipalInterestChart,
} from "@/components/charts/dashboard-charts";
import { useGetInvestorDashboardQuery } from "@/services/domainApi";
import { formatCurrency, formatDate } from "@/lib/format";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timeline } from "@/components/timeline/timeline";
import { SectionHeader } from "@/components/shared/section-header";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { deriveInvestmentDisplayStatus } from "@/lib/investment-status";
import { formatRepaymentModel } from "@/lib/repayment";
import type { Investment } from "@/types";

export default function InvestorDashboardPage() {
  const { data, isLoading, isError, refetch } = useGetInvestorDashboardQuery();

  if (isLoading || !data) return <LoadingSkeleton variant="page" />;
  if (isError) {
    return (
      <EmptyState
        title="Unable to load dashboard"
        description="Check your connection and try again."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const investments = (data.investments?.length
    ? data.investments
    : data.investment
      ? [data.investment]
      : []) as Investment[];
  const { payments = [], timeline = [], stats } = data;

  if (investments.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader
          hero
          eyebrow="Portfolio"
          title="Your investment at a glance"
          description="Overview of your private debt allocation, cash flows, and upcoming obligations."
        />
        <EmptyState
          title="No investment yet"
          description="Your administrator has not assigned an investment to your account."
        />
      </div>
    );
  }

  const investmentAmount =
    stats?.investmentAmount ?? investments.reduce((s, inv) => s + (inv.principal || 0), 0);
  const outstandingBalance =
    stats?.outstandingBalance ??
    investments.reduce((s, inv) => s + (inv.outstandingBalance || 0), 0);
  const interestEarned =
    stats?.interestEarned ?? investments.reduce((s, inv) => s + (inv.interestEarned || 0), 0);
  const principalRepaid =
    stats?.principalRepaid ?? investments.reduce((s, inv) => s + (inv.principalRepaid || 0), 0);
  const totalRepaid =
    stats?.returnedAmount ?? principalRepaid + interestEarned;
  const nextPaymentAmount = stats?.nextPaymentAmount ?? 0;
  const nextPaymentDate = stats?.nextPaymentDate ?? null;
  const maturityDate = stats?.maturityDate ?? investments[0]?.maturityDate;

  const recent = [...payments].reverse().slice(0, 5);
  const chartPayments = payments.slice(-12).map((p) => ({
    month: p.dueDate.slice(0, 7),
    principal: p.principal,
    interest: p.interest,
    value: p.remainingBalance,
  }));

  return (
    <div className="space-y-10">
      <PageHeader
        hero
        eyebrow="Portfolio"
        title="Your investment at a glance"
        description="Overview of your private debt allocation, cash flows, and upcoming obligations."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <MetricCard
          title="Investment Amount"
          value={formatCurrency(investmentAmount)}
          icon={Wallet}
          delay={0}
        />
        <MetricCard
          title="Outstanding Balance"
          value={formatCurrency(outstandingBalance)}
          icon={CircleDollarSign}
          delay={0.05}
        />
        <MetricCard
          title="Financing Fee Earned"
          value={formatCurrency(interestEarned)}
          icon={TrendingUp}
          delay={0.1}
        />
        <MetricCard
          title="Principal Repaid"
          value={formatCurrency(principalRepaid)}
          icon={PiggyBank}
          delay={0.15}
        />
        <MetricCard
          title="Total Repayments"
          value={formatCurrency(totalRepaid)}
          icon={Calendar}
          subtitle={`${investments.length} investment${investments.length === 1 ? "" : "s"}`}
          delay={0.2}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card
          className="rounded-2xl border-border/40 bg-card/80 shadow-none lg:col-span-1"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <CardHeader className="border-b border-border/30 bg-muted/15">
            <CardTitle className="text-base font-semibold">Portfolio summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5 text-sm">
            {[
              ["Investments", String(stats?.investmentCount ?? investments.length)],
              ["Next payment", formatCurrency(Number(nextPaymentAmount))],
              [
                "Due date",
                nextPaymentDate ? formatDate(String(nextPaymentDate)) : "—",
              ],
              [
                "Upcoming payments",
                String(stats?.upcomingPaymentCount ?? "—"),
              ],
              [
                "Maturity",
                maturityDate ? formatDate(String(maturityDate)) : "—",
              ],
              ["Returned amount", formatCurrency(totalRepaid)],
            ].map(([label, val]) => (
              <div key={String(label)} className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium tabular-financial">{val}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
          <ChartCard title="Outstanding balance" description="Portfolio balance trend over time">
            <BalanceLineChart data={chartPayments} />
          </ChartCard>
        </div>
      </div>

      <div className="space-y-3">
        <SectionHeader
          title="Your investments"
          description="Each position has its own schedule, payments, and timeline."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {investments.map((inv) => {
            const invPayments = payments.filter((p) => p.investmentId === inv.id);
            const displayStatus = deriveInvestmentDisplayStatus(inv, invPayments);
            return (
              <Card
                key={inv.id}
                className="rounded-2xl border-border/40 bg-card/80"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 bg-muted/15">
                  <CardTitle className="text-base font-semibold">
                    {formatCurrency(inv.principal)}
                  </CardTitle>
                  <StatusBadge status={displayStatus} />
                </CardHeader>
                <CardContent className="grid gap-2 p-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground">Repayment model</p>
                    <p className="font-medium">{formatRepaymentModel(inv.repaymentModel)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Financing Fee</p>
                    <p className="font-medium">{inv.interestRate}% p.a.</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Outstanding</p>
                    <p className="font-medium tabular-financial">
                      {formatCurrency(inv.outstandingBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Next payment</p>
                    <p className="font-medium tabular-financial">
                      {formatCurrency(inv.nextPaymentAmount)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <ChartCard
        title="Principal vs financing fee"
        description="Monthly repayment composition"
        delay={0.1}
      >
        <PrincipalInterestChart data={chartPayments} />
      </ChartCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card
          className="rounded-2xl border-border/40 bg-card/80"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <CardHeader className="border-b border-border/30 bg-muted/15">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Calendar className="h-4 w-4 text-primary" />
              Recent payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4">
            {recent.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/10 px-4 py-3 text-sm transition-colors hover:bg-primary/[0.03]"
              >
                <div>
                  <p className="font-medium">{formatDate(p.dueDate)}</p>
                  <p className="text-xs text-muted-foreground">
                    Principal {formatCurrency(p.principal)} · Financing Fee{" "}
                    {formatCurrency(p.interest)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-financial">{formatCurrency(p.total)}</p>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <div
          className="rounded-2xl border border-border/40 bg-card/50 p-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <SectionHeader title="Timeline preview" description="Latest investment events" />
          <div className="mt-6 max-h-[380px] overflow-auto pr-1">
            <Timeline events={timeline} />
          </div>
        </div>
      </div>
    </div>
  );
}
