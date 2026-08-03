"use client";

import { DocumentCard } from "@/components/documents/document-card";
import { useGetContractsQuery } from "@/services/domainApi";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";

export default function InvestorContractsPage() {
  const { data: contracts = [], isLoading, isError, refetch } = useGetContractsQuery();
  if (isLoading) return <LoadingSkeleton variant="page" />;
  if (isError) {
    return (
      <EmptyState
        title="Verträge konnten nicht geladen werden"
        description="Prüfen Sie Ihre Verbindung und versuchen Sie es erneut."
        actionLabel="Erneut versuchen"
        onAction={() => refetch()}
      />
    );
  }
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Verträge</h1>
        <p className="text-sm text-muted-foreground">Vereinbarungen, die Ihrem Konto zugewiesen sind.</p>
      </div>
      {contracts.length === 0 ? (
        <EmptyState
          title="Keine Verträge"
          description="Vom Administrator zugewiesene Verträge erscheinen hier."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {contracts.map((c) => (
            <DocumentCard
              key={c.id}
              title={c.title}
              meta={`Unterzeichnet ${c.signedAt} · ${c.size}`}
              badge={c.type.replace(/_/g, " ")}
              downloadPath={`/contracts/${c.id}/download`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
