"use client";

import { michaelInvestment } from "@/mock-data/investments";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Landmark, Percent, Timer } from "lucide-react";

export default function MyInvestmentPage() {
  const repaidPct = (michaelInvestment.principalRepaid / michaelInvestment.principal) * 100;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Investment</h1>
        <p className="text-sm text-muted-foreground">
          Detailed view of your €100,000 private debt allocation.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Original investment" value={formatCurrency(michaelInvestment.principal)} icon={Landmark} />
        <MetricCard title="Interest rate" value={`${michaelInvestment.interestRate}%`} icon={Percent} />
        <MetricCard title="Remaining term" value="17 months" icon={Timer} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Repayment progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>{formatCurrency(michaelInvestment.principalRepaid)} repaid</span>
            <span className="text-muted-foreground">{repaidPct.toFixed(1)}%</span>
          </div>
          <Progress value={repaidPct} className="h-2" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div>
              <p className="text-muted-foreground">Start date</p>
              <p className="font-medium">{formatDate(michaelInvestment.startDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Maturity</p>
              <p className="font-medium">{formatDate(michaelInvestment.maturityDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Monthly payment</p>
              <p className="font-medium">{formatCurrency(michaelInvestment.monthlyPayment)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <StatusBadge status={michaelInvestment.status} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
