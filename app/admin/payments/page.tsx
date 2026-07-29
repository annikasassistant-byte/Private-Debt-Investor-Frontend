"use client";

import { DataTable } from "@/components/tables/data-table";
import { paymentColumns } from "@/features/payments/payment-columns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useGetPaymentsQuery,
  useMarkPaymentPaidMutation,
} from "@/services/domainApi";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { getApiErrorMessage } from "@/services/auth-mappers";

export default function AdminPaymentsPage() {
  const { data: rows = [], isLoading } = useGetPaymentsQuery();
  const [markPaid, { isLoading: marking }] = useMarkPaymentPaidMutation();

  if (isLoading) return <LoadingSkeleton variant="page" />;

  const upcoming = rows.find((p) => p.status === "upcoming" || p.status === "overdue");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground">Confirm and reconcile investor repayments.</p>
        </div>
        <Button
          disabled={!upcoming || marking}
          onClick={async () => {
            if (!upcoming) return;
            try {
              await markPaid({ id: upcoming.id }).unwrap();
              toast.success("Payment confirmed");
            } catch (error) {
              toast.error(getApiErrorMessage(error, "Unable to confirm payment"));
            }
          }}
        >
          {marking ? "Confirming…" : "Confirm next payment"}
        </Button>
      </div>
      <DataTable columns={paymentColumns} data={rows} searchKey="status" />
    </div>
  );
}
