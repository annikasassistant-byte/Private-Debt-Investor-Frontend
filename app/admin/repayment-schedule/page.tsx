"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/tables/data-table";
import { paymentColumns } from "@/features/payments/payment-columns";
import { useGetInvestmentsQuery, useGetPaymentsQuery } from "@/services/domainApi";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRepaymentModel } from "@/lib/repayment";
import { formatCurrency } from "@/lib/format";

export default function AdminRepaymentSchedulePage() {
  const { data: rows = [], isLoading, isError, refetch } = useGetPaymentsQuery();
  const { data: investments = [] } = useGetInvestmentsQuery();
  const [selectedId, setSelectedId] = useState<string>("all");

  const filtered = useMemo(() => {
    if (selectedId === "all") return rows;
    return rows.filter((p) => p.investmentId === selectedId);
  }, [rows, selectedId]);

  const selectedInvestment =
    selectedId === "all" ? null : investments.find((inv) => inv.id === selectedId) || null;

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Repayment Schedule</h1>
          <p className="text-sm text-muted-foreground">
            Schedule rows follow each investment&apos;s repayment model.
          </p>
          {selectedInvestment ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Model:{" "}
              <span className="font-medium text-foreground">
                {formatRepaymentModel(selectedInvestment.repaymentModel)}
              </span>
            </p>
          ) : null}
        </div>
        {investments.length > 0 ? (
          <Select value={selectedId} onValueChange={(v) => setSelectedId(v || "all")}>
            <SelectTrigger className="w-[280px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All investments</SelectItem>
              {investments.map((inv) => (
                <SelectItem key={inv.id} value={inv.id}>
                  {inv.investorName || formatCurrency(inv.principal)} ·{" "}
                  {formatRepaymentModel(inv.repaymentModel)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No schedule rows"
          description="Schedules appear after investments are created."
        />
      ) : (
        <DataTable
          columns={paymentColumns}
          data={filtered}
          searchKey="status"
          exportInvestmentId={
            selectedId !== "all"
              ? selectedId
              : investments[0]?.id || rows[0]?.investmentId
          }
        />
      )}
    </div>
  );
}
