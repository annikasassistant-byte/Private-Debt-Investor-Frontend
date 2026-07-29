"use client";

import { DocumentCard } from "@/components/documents/document-card";
import { useGetContractsQuery } from "@/services/domainApi";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { API_BASE_URL } from "@/services/config";

export default function InvestorContractsPage() {
  const { data: contracts = [], isLoading } = useGetContractsQuery();
  if (isLoading) return <LoadingSkeleton variant="page" />;
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Contracts</h1>
        <p className="text-sm text-muted-foreground">Agreements assigned to your account.</p>
      </div>
      {contracts.length === 0 ? (
        <EmptyState title="No contracts" description="Contracts assigned by your administrator will appear here." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {contracts.map((c) => (
            <DocumentCard
              key={c.id}
              title={c.title}
              meta={`Signed ${c.signedAt} · ${c.size}`}
              badge={c.type.replace(/_/g, " ")}
              href={c.fileUrl ? `${API_BASE_URL}${c.fileUrl}` : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
