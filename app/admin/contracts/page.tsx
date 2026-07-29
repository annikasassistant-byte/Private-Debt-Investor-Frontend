"use client";

import { DocumentCard } from "@/components/documents/document-card";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useGetContractsQuery, useCreateContractMutation } from "@/services/domainApi";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { getApiErrorMessage } from "@/services/auth-mappers";
import { API_BASE_URL } from "@/services/config";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminContractsPage() {
  const { data: contracts = [], isLoading } = useGetContractsQuery();
  const [createContract, { isLoading: uploading }] = useCreateContractMutation();

  if (isLoading) return <LoadingSkeleton variant="page" />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contracts</h1>
          <p className="text-sm text-muted-foreground">Manage agreements and assign to investors.</p>
        </div>
        <label className={cn(buttonVariants(), "cursor-pointer", uploading && "pointer-events-none opacity-50")}>
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading…" : "Upload contract"}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const fd = new FormData();
              fd.append("title", file.name);
              fd.append("type", "loan_agreement");
              fd.append("file", file);
              try {
                await createContract(fd).unwrap();
                toast.success("Contract uploaded");
              } catch (error) {
                toast.error(getApiErrorMessage(error, "Upload failed"));
              }
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {contracts.length === 0 ? (
        <EmptyState title="No contracts" description="Upload the first contract." />
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
