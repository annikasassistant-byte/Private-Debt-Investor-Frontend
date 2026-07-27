"use client";

import { mockApi } from "@/mock-data";
import { DocumentCard } from "@/components/documents/document-card";

const typeLabels: Record<string, string> = {
  loan_agreement: "Loan Agreement",
  subordinated_loan: "Subordinated Loan",
  amendment: "Amendment",
  additional: "Additional Agreement",
};

export default function InvestorContractsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Contracts</h1>
        <p className="text-sm text-muted-foreground">
          Legal agreements and amendments related to your investment.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mockApi.investorContracts.map((c) => (
          <DocumentCard
            key={c.id}
            title={c.title}
            type={typeLabels[c.type]}
            meta={`Signed ${c.signedAt} · ${c.size}`}
            badge={c.type.replace(/_/g, " ")}
          />
        ))}
      </div>
    </div>
  );
}
