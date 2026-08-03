"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Payment } from "@/types";
import { DataTable } from "@/components/tables/data-table";
import { formatCurrencyPrecise, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useCancelPaymentMutation,
  useGetInvestmentsQuery,
  useGetLoansQuery,
  useGetPaymentsQuery,
  useMarkPaymentPaidMutation,
} from "@/services/domainApi";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { getApiErrorMessage } from "@/services/auth-mappers";
import { EmptyState } from "@/components/shared/empty-state";

export default function AdminPaymentsPage() {
  const { data: rows = [], isLoading, isError, refetch } = useGetPaymentsQuery();
  const { data: investments = [] } = useGetInvestmentsQuery();
  const { data: loans = [] } = useGetLoansQuery();
  const [markPaid, { isLoading: marking }] = useMarkPaymentPaidMutation();
  const [cancelPayment] = useCancelPaymentMutation();

  const borrowerByInvestment = useMemo(() => {
    const map = new Map<string, string>();
    for (const loan of loans) {
      if (loan.investmentId && loan.borrower) {
        map.set(loan.investmentId, loan.borrower);
      }
    }
    return map;
  }, [loans]);

  const columns: ColumnDef<Payment>[] = useMemo(
    () => [
      {
        id: "borrowerName",
        header: "Borrower Name",
        accessorFn: (row) => borrowerByInvestment.get(row.investmentId) || "—",
        cell: ({ row }) => borrowerByInvestment.get(row.original.investmentId) || "—",
      },
      {
        accessorKey: "dueDate",
        header: "Due Date",
        cell: ({ row }) => formatDate(row.original.dueDate),
      },
      {
        accessorKey: "paymentDate",
        header: "Payment Date",
        cell: ({ row }) =>
          row.original.paymentDate ? formatDate(row.original.paymentDate) : "—",
      },
      {
        accessorKey: "principal",
        header: "Principal",
        cell: ({ row }) => formatCurrencyPrecise(row.original.principal),
      },
      {
        accessorKey: "interest",
        header: "Financing Fee",
        cell: ({ row }) => formatCurrencyPrecise(row.original.interest),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => formatCurrencyPrecise(row.original.total),
      },
      {
        accessorKey: "remainingBalance",
        header: "Balance",
        cell: ({ row }) => formatCurrencyPrecise(row.original.remainingBalance),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const p = row.original;
          const canPay = !["completed", "cancelled"].includes(p.status);
          if (!canPay) return null;
          return (
            <div className="flex justify-end gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={marking}
                onClick={async () => {
                  try {
                    await markPaid({ id: p.id }).unwrap();
                    toast.success("Payment confirmed");
                  } catch (error) {
                    toast.error(getApiErrorMessage(error, "Unable to confirm"));
                  }
                }}
              >
                Mark paid
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  try {
                    await cancelPayment({ id: p.id }).unwrap();
                    toast.success("Payment cancelled");
                  } catch (error) {
                    toast.error(getApiErrorMessage(error, "Unable to cancel"));
                  }
                }}
              >
                Cancel
              </Button>
            </div>
          );
        },
      },
    ],
    [markPaid, cancelPayment, marking, borrowerByInvestment]
  );

  if (isLoading) return <LoadingSkeleton variant="page" />;
  if (isError) {
    return (
      <EmptyState
        title="Unable to load payments"
        description="Check your connection and try again."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

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
      {rows.length === 0 ? (
        <EmptyState title="No payments" description="Create an investment to generate a schedule." />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          searchKey="status"
          exportInvestmentId={investments[0]?.id || rows[0]?.investmentId}
        />
      )}
    </div>
  );
}
