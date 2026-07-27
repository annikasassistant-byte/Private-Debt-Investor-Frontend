"use client";

import { mockContracts } from "@/mock-data/contracts";
import { DocumentCard } from "@/components/documents/document-card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

export default function AdminContractsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contracts</h1>
          <p className="text-sm text-muted-foreground">Manage agreements and assign to investors.</p>
        </div>
        <Button onClick={() => toast.success("Contract uploaded (demo)")}>
          <Upload className="mr-2 h-4 w-4" />
          Upload contract
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mockContracts.map((c) => (
          <DocumentCard
            key={c.id}
            title={c.title}
            meta={`Signed ${c.signedAt} · ${c.size}`}
            badge={c.type.replace(/_/g, " ")}
          />
        ))}
      </div>
    </div>
  );
}
