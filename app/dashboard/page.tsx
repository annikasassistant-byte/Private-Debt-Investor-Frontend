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
        title="Dashboard konnte nicht geladen werden"
        description="Prüfen Sie Ihre Verbindung und versuchen Sie es erneut."
        actionLabel="Erneut versuchen"
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
          title="Ihre Investition im Überblick"
          description="Überblick über Ihre Private-Debt-Allokation, Cashflows und anstehenden Verpflichtungen."
        />
        <EmptyState
          title="Noch keine Investition"
          description="Ihr Administrator hat Ihrem Konto noch keine Investition zugewiesen."
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
        title="Ihre Investition im Überblick"
        description="Überblick über Ihre Private-Debt-Allokation, Cashflows und anstehenden Verpflichtungen."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <MetricCard
          title="Investitionsbetrag"
          value={formatCurrency(investmentAmount)}
          icon={Wallet}
          delay={0}
        />
        <MetricCard
          title="Ausstehender Saldo"
          value={formatCurrency(outstandingBalance)}
          icon={CircleDollarSign}
          delay={0.05}
        />
        <MetricCard
          title="Verdiente Finanzierungsgebühr"
          value={formatCurrency(interestEarned)}
          icon={TrendingUp}
          delay={0.1}
        />
        <MetricCard
          title="Tilgung geleistet"
          value={formatCurrency(principalRepaid)}
          icon={PiggyBank}
          delay={0.15}
        />
        <MetricCard
          title="Gesamtrückzahlungen"
          value={formatCurrency(totalRepaid)}
          icon={Calendar}
          subtitle={`${investments.length} Investition${investments.length === 1 ? "" : "en"}`}
          delay={0.2}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card
          className="rounded-2xl border-border/40 bg-card/80 shadow-none lg:col-span-1"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <CardHeader className="border-b border-border/30 bg-muted/15">
            <CardTitle className="text-base font-semibold">Portfolioübersicht</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5 text-sm">
            {[
              ["Investitionen", String(stats?.investmentCount ?? investments.length)],
              ["Nächste Zahlung", formatCurrency(Number(nextPaymentAmount))],
              [
                "Fälligkeitsdatum",
                nextPaymentDate ? formatDate(String(nextPaymentDate)) : "—",
              ],
              [
                "Anstehende Zahlungen",
                String(stats?.upcomingPaymentCount ?? "—"),
              ],
              [
                "Fälligkeit",
                maturityDate ? formatDate(String(maturityDate)) : "—",
              ],
              ["Zurückgezahlter Betrag", formatCurrency(totalRepaid)],
            ].map(([label, val]) => (
              <div key={String(label)} className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium tabular-financial">{val}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
          <ChartCard title="Ausstehender Saldo" description="Portfolio-Saldoentwicklung im Zeitverlauf">
            <BalanceLineChart data={chartPayments} />
          </ChartCard>
        </div>
      </div>

      <div className="space-y-3">
        <SectionHeader
          title="Ihre Investitionen"
          description="Jede Position hat eigenen Plan, Zahlungen und Zeitachse."
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
                    <p className="text-muted-foreground">Rückzahlungsmodell</p>
                    <p className="font-medium">{formatRepaymentModel(inv.repaymentModel)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Finanzierungsgebühr</p>
                    <p className="font-medium">{inv.interestRate}% p.a.</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ausstehend</p>
                    <p className="font-medium tabular-financial">
                      {formatCurrency(inv.outstandingBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Nächste Zahlung</p>
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
        title="Tilgung vs. Finanzierungsgebühr"
        description="Monatliche Rückzahlungszusammensetzung"
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
              Letzte Zahlungen
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
                    Tilgung {formatCurrency(p.principal)} · Finanzierungsgebühr{" "}
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
          <SectionHeader title="Zeitachsen-Vorschau" description="Neueste Investitionsereignisse" />
          <div className="mt-6 max-h-[380px] overflow-auto pr-1">
            <Timeline events={timeline} />
          </div>
        </div>
      </div>
    </div>
  );
}
