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
    for (const inv of investments) {
      if (!map.has(inv.id) && inv.investorName) {
        map.set(inv.id, inv.investorName);
      }
    }
    return map;
  }, [loans, investments]);

  const columns: ColumnDef<Payment>[] = useMemo(
    () => [
      {
        id: "borrowerName",
        header: "Kreditnehmer",
        accessorFn: (row) => borrowerByInvestment.get(row.investmentId) || "—",
        cell: ({ row }) => borrowerByInvestment.get(row.original.investmentId) || "—",
      },
      {
        accessorKey: "dueDate",
        header: "Fälligkeitsdatum",
        cell: ({ row }) => formatDate(row.original.dueDate),
      },
      {
        accessorKey: "paymentDate",
        header: "Zahlungsdatum",
        cell: ({ row }) =>
          row.original.paymentDate ? formatDate(row.original.paymentDate) : "—",
      },
      {
        accessorKey: "principal",
        header: "Tilgung",
        cell: ({ row }) => formatCurrencyPrecise(row.original.principal),
      },
      {
        accessorKey: "interest",
        header: "Finanzierungsgebühr",
        cell: ({ row }) => formatCurrencyPrecise(row.original.interest),
      },
      {
        accessorKey: "total",
        header: "Gesamt",
        cell: ({ row }) => formatCurrencyPrecise(row.original.total),
      },
      {
        accessorKey: "remainingBalance",
        header: "Restsaldo",
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
                    toast.success("Zahlung bestätigt");
                  } catch (error) {
                    toast.error(getApiErrorMessage(error, "Konnte nicht bestätigt werden"));
                  }
                }}
              >
                Als bezahlt markieren
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  try {
                    await cancelPayment({ id: p.id }).unwrap();
                    toast.success("Zahlung storniert");
                  } catch (error) {
                    toast.error(getApiErrorMessage(error, "Konnte nicht storniert werden"));
                  }
                }}
              >
                Abbrechen
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
        title="Zahlungen konnten nicht geladen werden"
        description="Prüfen Sie Ihre Verbindung und versuchen Sie es erneut."
        actionLabel="Erneut versuchen"
        onAction={() => refetch()}
      />
    );
  }

  const upcoming = rows.find((p) => p.status === "upcoming" || p.status === "overdue");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Zahlungen</h1>
          <p className="text-sm text-muted-foreground">Investorenrückzahlungen bestätigen und abstimmen.</p>
        </div>
        <Button
          disabled={!upcoming || marking}
          onClick={async () => {
            if (!upcoming) return;
            try {
              await markPaid({ id: upcoming.id }).unwrap();
              toast.success("Zahlung bestätigt");
            } catch (error) {
              toast.error(getApiErrorMessage(error, "Zahlung konnte nicht bestätigt werden"));
            }
          }}
        >
          {marking ? "Wird bestätigt…" : "Nächste Zahlung bestätigen"}
        </Button>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="Keine Zahlungen" description="Legen Sie eine Investition an, um einen Tilgungsplan zu erzeugen." />
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
