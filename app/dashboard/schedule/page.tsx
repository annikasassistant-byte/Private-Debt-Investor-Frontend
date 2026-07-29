"use client";

import { DataTable } from "@/components/tables/data-table";
import { paymentColumns } from "@/features/payments/payment-columns";
import { useGetPaymentsQuery } from "@/services/domainApi";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { API_V1, getStoredAccessToken } from "@/services/config";
import { useGetInvestmentsQuery } from "@/services/domainApi";
import { toast } from "sonner";

export default function InvestorSchedulePage() {
  const { data: payments = [], isLoading } = useGetPaymentsQuery();
  const { data: investments = [] } = useGetInvestmentsQuery();

  if (isLoading) return <LoadingSkeleton variant="page" />;

  const investmentId = investments[0]?.id;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payment Schedule</h1>
          <p className="text-sm text-muted-foreground">Your full repayment calendar.</p>
        </div>
        <div className="flex gap-2">
          {(["csv", "pdf"] as const).map((format) => (
            <Button
              key={format}
              variant="outline"
              disabled={!investmentId}
              onClick={async () => {
                if (!investmentId) return;
                try {
                  const res = await fetch(
                    `${API_V1}/exports/payments/${investmentId}?format=${format}`,
                    {
                      headers: {
                        Authorization: `Bearer ${getStoredAccessToken() || ""}`,
                      },
                    }
                  );
                  if (!res.ok) throw new Error("Export failed");
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `payments.${format}`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success(`${format.toUpperCase()} downloaded`);
                } catch {
                  toast.error("Export failed");
                }
              }}
            >
              Export {format.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
      <DataTable columns={paymentColumns} data={payments} searchKey="status" />
    </div>
  );
}
