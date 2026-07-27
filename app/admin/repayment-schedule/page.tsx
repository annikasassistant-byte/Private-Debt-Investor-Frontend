"use client";

import { investorPayments } from "@/mock-data/payments";
import { DataTable } from "@/components/tables/data-table";
import { paymentColumns } from "@/features/payments/payment-columns";

export default function AdminRepaymentSchedulePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Repayment Schedule</h1>
        <p className="text-sm text-muted-foreground">Master amortization schedule across facilities.</p>
      </div>
      <DataTable columns={paymentColumns} data={investorPayments} />
    </div>
  );
}
