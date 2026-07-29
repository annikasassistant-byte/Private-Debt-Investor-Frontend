"use client";

import { DataTable } from "@/components/tables/data-table";
import { paymentColumns } from "@/features/payments/payment-columns";
import { useGetPaymentsQuery } from "@/services/domainApi";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function AdminRepaymentSchedulePage() {
  const { data: rows = [], isLoading } = useGetPaymentsQuery();
  if (isLoading) return <LoadingSkeleton variant="page" />;
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Repayment Schedule</h1>
        <p className="text-sm text-muted-foreground">Full schedule across investments.</p>
      </div>
      <DataTable columns={paymentColumns} data={rows} searchKey="status" />
    </div>
  );
}
