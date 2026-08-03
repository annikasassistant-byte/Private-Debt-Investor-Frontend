"use client";

import { useGetInvestorDashboardQuery } from "@/services/domainApi";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { deriveInvestmentDisplayStatus } from "@/lib/investment-status";
import { formatRepaymentModel } from "@/lib/repayment";
import type { Investment } from "@/types";

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

  const investments = (data?.investments?.length
    ? data.investments
    : data?.investment
      ? [data.investment]
      : []) as Investment[];
  const payments = data?.payments || [];

  if (investments.length === 0) {
    return (
      <EmptyState title="No investment" description="No investment is linked to your account." />
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Investments</h1>
        <p className="text-sm text-muted-foreground">
          Details of each private debt allocation on your account.
        </p>
      </div>

      <div className="space-y-6">
        {investments.map((investment) => {
          const invPayments = payments.filter((p) => p.investmentId === investment.id);
          const displayStatus = deriveInvestmentDisplayStatus(investment, invPayments);
          const repaidPct = investment.principal
            ? Math.min(
                100,
                Math.round((investment.principalRepaid / investment.principal) * 100)
              )
            : 0;
          const totalRepaid =
            (investment.principalRepaid || 0) + (investment.interestEarned || 0);

          return (
            <Card key={investment.id}>
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
                    ["Financing Fee rate", `${investment.interestRate}% p.a.`],
                    ["Term", `${investment.termMonths} months`],
                    ["Repayment model", formatRepaymentModel(investment.repaymentModel)],
                    ["Monthly payment", formatCurrency(investment.monthlyPayment)],
                    ["Outstanding", formatCurrency(investment.outstandingBalance)],
                    ["Total repayments", formatCurrency(totalRepaid)],
                    ["Financing Fee earned", formatCurrency(investment.interestEarned)],
                    ["Principal repaid", formatCurrency(investment.principalRepaid)],
                    ["Next payment", formatCurrency(investment.nextPaymentAmount)],
                    ["Next due", formatDate(investment.nextPaymentDate)],
                    ["Maturity", formatDate(investment.maturityDate)],
                  ].map(([k, v]) => (
                    <div key={String(k)}>
                      <p className="text-muted-foreground">{k}</p>
                      <p className="font-semibold">{v}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
