"use client";

import { getAllPayments } from "@/mock-data/payments";
import { DataTable } from "@/components/tables/data-table";
import { paymentColumns } from "@/features/payments/payment-columns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground">Confirm and reconcile investor repayments.</p>
        </div>
        <Button onClick={() => toast.success("Payment confirmed (demo)")}>Confirm payment</Button>
      </div>
      <DataTable columns={paymentColumns} data={getAllPayments()} searchKey="status" />
    </div>
  );
}
