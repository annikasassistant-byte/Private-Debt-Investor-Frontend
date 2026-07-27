"use client";

import { investorPayments } from "@/mock-data/payments";
import { DataTable } from "@/components/tables/data-table";
import { paymentColumns } from "@/features/payments/payment-columns";
import { PageHeader } from "@/components/shared/page-header";

export default function PaymentSchedulePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Amortization"
        title="Payment schedule"
        description="Full repayment calendar with search, sort, and export."
      />
      <DataTable
        columns={paymentColumns}
        data={investorPayments}
        searchKey="status"
        searchPlaceholder="Filter by status..."
      />
    </div>
  );
}
