"use client";

import { DocumentCard } from "@/components/documents/document-card";
import { useGetReportsQuery } from "@/services/domainApi";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";

export default function InvestorReportsPage() {
  const { data: reports = [], isLoading, isError, refetch } = useGetReportsQuery();
  if (isLoading) return <LoadingSkeleton variant="page" />;
  if (isError) {
    return (
      <EmptyState
        title="Unable to load reports"
        description="Check your connection and try again."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">Documents assigned to your account.</p>
      </div>
      {reports.length === 0 ? (
        <EmptyState
          title="No reports"
          description="Reports assigned by your administrator will appear here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {reports.map((r) => (
            <DocumentCard
              key={r.id}
              title={r.title}
              meta={`${r.period || "—"} · ${r.size}`}
              badge={r.category}
              downloadPath={`/reports/${r.id}/download`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
