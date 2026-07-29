"use client";

import { useGetInvestorDashboardQuery } from "@/services/domainApi";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { deriveInvestmentDisplayStatus } from "@/lib/investment-status";

export default function InvestorInvestmentPage() {
  const { data, isLoading, isError, refetch } = useGetInvestorDashboardQuery();
  if (isLoading) return <LoadingSkeleton variant="page" />;
  if (isError) {
    return (
      <EmptyState
        title="Unable to load investment"
        description="Check your connection and try again."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }
  const investment = data?.investment;
  const payments = data?.payments || [];
  if (!investment) {
    return (
      <EmptyState title="No investment" description="No investment is linked to your account." />
    );
  }

  const displayStatus = deriveInvestmentDisplayStatus(investment, payments);
  const repaidPct = investment.principal
    ? Math.min(100, Math.round((investment.principalRepaid / investment.principal) * 100))
    : 0;
  const totalRepaid = (investment.principalRepaid || 0) + (investment.interestEarned || 0);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Investment</h1>
        <p className="text-sm text-muted-foreground">Details of your private debt allocation.</p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{formatCurrency(investment.principal)}</CardTitle>
          <StatusBadge status={displayStatus} />
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Principal repaid</span>
              <span className="font-medium">{repaidPct}%</span>
            </div>
            <Progress value={repaidPct} />
          </div>
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            {[
              ["Start date", formatDate(investment.startDate)],
              ["Interest rate", `${investment.interestRate}% p.a.`],
              ["Term", `${investment.termMonths} months`],
              ["Monthly payment", formatCurrency(investment.monthlyPayment)],
              ["Outstanding", formatCurrency(investment.outstandingBalance)],
              ["Total repayments", formatCurrency(totalRepaid)],
              ["Interest earned", formatCurrency(investment.interestEarned)],
              ["Principal repaid", formatCurrency(investment.principalRepaid)],
              ["Next payment", formatCurrency(investment.nextPaymentAmount)],
              ["Next due", formatDate(investment.nextPaymentDate)],
              ["Maturity", formatDate(investment.maturityDate)],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-muted-foreground">{k}</p>
                <p className="font-semibold">{v}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
