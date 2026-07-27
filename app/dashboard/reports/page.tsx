"use client";

import { useMemo, useState } from "react";
import { mockApi } from "@/mock-data";
import { DocumentCard } from "@/components/documents/document-card";
import { SearchInput } from "@/components/shared/search-input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ReportCategory } from "@/types";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

const categories: { value: ReportCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
  { value: "kpi", label: "KPIs" },
  { value: "other", label: "Other" },
];

export default function InvestorReportsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ReportCategory | "all">("all");

  const filtered = useMemo(() => {
    return mockApi.investorReports.filter((r) => {
      const matchCat = category === "all" || r.category === category;
      const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, category]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Documents"
        title="Financial reports"
        description="Monthly, quarterly, and annual statements for your portfolio."
      />
      <div className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-muted/15 p-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Search reports..." />
        <Tabs value={category} onValueChange={(v) => setCategory(v as ReportCategory | "all")}>
          <TabsList className="flex h-auto flex-wrap rounded-xl bg-background/80">
            {categories.map((c) => (
              <TabsTrigger key={c.value} value={c.value} className="rounded-lg text-xs sm:text-sm">
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No reports found"
          description="Adjust your search or category filter to see available documents."
          actionLabel="Clear filters"
          onAction={() => {
            setSearch("");
            setCategory("all");
          }}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => (
            <DocumentCard
              key={r.id}
              title={r.title}
              meta={`${r.period} · ${r.size} · Uploaded ${r.uploadedAt}`}
              badge={r.category}
            />
          ))}
        </div>
      )}
    </div>
  );
}
