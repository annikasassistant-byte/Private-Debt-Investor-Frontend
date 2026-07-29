"use client";

import { DataTable } from "@/components/tables/data-table";
import { paymentColumns } from "@/features/payments/payment-columns";
import { useGetInvestmentsQuery, useGetPaymentsQuery } from "@/services/domainApi";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";

export default function AdminRepaymentSchedulePage() {
  const { data: rows = [], isLoading, isError, refetch } = useGetPaymentsQuery();
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Repayment Schedule</h1>
        <p className="text-sm text-muted-foreground">Full schedule across investments.</p>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No schedule rows" description="Schedules appear after investments are created." />
      ) : (
        <DataTable
          columns={paymentColumns}
          data={rows}
          searchKey="status"
          exportInvestmentId={investments[0]?.id || rows[0]?.investmentId}
        />
      )}
    </div>
  );
}
