"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/tables/data-table";
import { paymentColumns } from "@/features/payments/payment-columns";
import { useGetInvestmentsQuery, useGetPaymentsQuery } from "@/services/domainApi";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { exportPaymentsFile } from "@/lib/download";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRepaymentModel } from "@/lib/repayment";
import { formatCurrency } from "@/lib/format";

export default function InvestorSchedulePage() {
  const { data: payments = [], isLoading, isError, refetch } = useGetPaymentsQuery();
  const { data: investments = [] } = useGetInvestmentsQuery();
  const [selectedId, setSelectedId] = useState<string>("");

  // Default to first investment so schedule is always model-specific when possible
  const effectiveId = selectedId || investments[0]?.id || "";

  const filteredPayments = useMemo(() => {
    if (!effectiveId) return payments;
    return payments.filter((p) => p.investmentId === effectiveId);
  }, [payments, effectiveId]);

  const selectedInvestment = investments.find((inv) => inv.id === effectiveId) || null;

  if (isLoading) return <LoadingSkeleton variant="page" />;
  if (isError) {
    return (
      <EmptyState
        title="Zahlungsplan konnte nicht geladen werden"
        description="Prüfen Sie Ihre Verbindung und versuchen Sie es erneut."
        actionLabel="Erneut versuchen"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Zahlungsplan</h1>
          <p className="text-sm text-muted-foreground">
            Rückzahlungskalender für die ausgewählte Investition.
          </p>
          {selectedInvestment ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Modell:{" "}
              <span className="font-medium text-foreground">
                {formatRepaymentModel(selectedInvestment.repaymentModel)}
              </span>
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {investments.length > 0 ? (
            <Select
              value={effectiveId}
              onValueChange={(v) => setSelectedId(v || investments[0]?.id || "")}
            >
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Investition wählen" />
              </SelectTrigger>
              <SelectContent>
                {investments.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id}>
                    {formatCurrency(inv.principal)} · {formatRepaymentModel(inv.repaymentModel)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          {(["csv", "pdf"] as const).map((format) => (
            <Button
              key={format}
              variant="outline"
              disabled={!effectiveId}
              onClick={async () => {
                if (!effectiveId) return;
                try {
                  await exportPaymentsFile(effectiveId, format);
                  toast.success(`${format.toUpperCase()} heruntergeladen`);
                } catch {
                  toast.error("Export fehlgeschlagen");
                }
              }}
            >
              {format.toUpperCase()} exportieren
            </Button>
          ))}
        </div>
      </div>
      {filteredPayments.length === 0 ? (
        <EmptyState
          title="Noch keine Zahlungen"
          description="Ihr Rückzahlungsplan erscheint hier."
        />
      ) : (
        <DataTable
          columns={paymentColumns}
          data={filteredPayments}
          searchKey="status"
          showExport={false}
          exportInvestmentId={effectiveId}
        />
      )}
    </div>
  );
}
