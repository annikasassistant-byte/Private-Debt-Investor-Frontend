"use client";

import { DataTable } from "@/components/tables/data-table";
import { paymentColumns } from "@/features/payments/payment-columns";
import { useGetInvestmentsQuery, useGetPaymentsQuery } from "@/services/domainApi";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { exportPaymentsFile } from "@/lib/download";
import { toast } from "sonner";

export default function InvestorSchedulePage() {
  const { data: payments = [], isLoading, isError, refetch } = useGetPaymentsQuery();
  const { data: investments = [] } = useGetInvestmentsQuery();

  if (isLoading) return <LoadingSkeleton variant="page" />;
  if (isError) {
    return (
      <EmptyState
        title="Unable to load schedule"
        description="Check your connection and try again."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const investmentId = investments[0]?.id || payments[0]?.investmentId;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payment Schedule</h1>
          <p className="text-sm text-muted-foreground">Your full repayment calendar.</p>
        </div>
        <div className="flex gap-2">
          {(["csv", "pdf"] as const).map((format) => (
            <Button
              key={format}
              variant="outline"
              disabled={!investmentId}
              onClick={async () => {
                if (!investmentId) return;
                try {
                  await exportPaymentsFile(investmentId, format);
                  toast.success(`${format.toUpperCase()} downloaded`);
                } catch {
                  toast.error("Export failed");
                }
              }}
            >
              Export {format.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
      {payments.length === 0 ? (
        <EmptyState title="No payments yet" description="Your repayment schedule will appear here." />
      ) : (
        <DataTable
          columns={paymentColumns}
          data={payments}
          searchKey="status"
          showExport={false}
          exportInvestmentId={investmentId}
        />
      )}
    </div>
  );
}
