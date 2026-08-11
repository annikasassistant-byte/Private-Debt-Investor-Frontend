"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BrandedLoader } from "@/components/shared/branded-loader";
import { PageHeader } from "@/components/shared/page-header";
import {
  useGetBuybackCmsQuery,
  useResetBuybackCmsMutation,
  useUpdateBuybackCmsMutation,
} from "@/services/domainApi";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { key: "site", label: "Site / Brand / Kontakt" },
  { key: "chrome", label: "Header & Footer" },
  { key: "landing", label: "Landing Page" },
  { key: "dashboard", label: "Dashboard Page" },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

export function BuybackCmsPage() {
  const { data, isLoading, isError, refetch } = useGetBuybackCmsQuery();
  const [updateCms, { isLoading: saving }] = useUpdateBuybackCmsMutation();
  const [resetCms, { isLoading: resetting }] = useResetBuybackCmsMutation();

  const [active, setActive] = useState<SectionKey>("landing");
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [sectionJson, setSectionJson] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    if (data?.content && typeof data.content === "object") {
      setDraft(data.content as Record<string, unknown>);
    }
  }, [data]);

  useEffect(() => {
    if (!draft) return;
    const section = draft[active] ?? {};
    setSectionJson(JSON.stringify(section, null, 2));
    setParseError(null);
  }, [active, draft]);

  const versionLabel = useMemo(() => {
    if (!data) return "";
    return `v${data.version ?? 1}`;
  }, [data]);

  function applySectionJson() {
    if (!draft) return false;
    try {
      const parsed = JSON.parse(sectionJson);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Abschnitt muss ein JSON-Objekt sein");
      }
      setDraft({ ...draft, [active]: parsed });
      setParseError(null);
      return true;
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Ungültiges JSON");
      return false;
    }
  }

  async function handleSave() {
    if (!draft) return;
    if (!applySectionJson()) {
      toast.error("JSON im aktuellen Abschnitt korrigieren");
      return;
    }
    const next = { ...draft };
    try {
      const parsed = JSON.parse(sectionJson);
      next[active] = parsed;
    } catch {
      /* already handled */
      return;
    }

    try {
      await updateCms({ content: next }).unwrap();
      toast.success("BuyBack-Inhalte gespeichert");
    } catch (err: any) {
      toast.error(err?.data?.message || "Speichern fehlgeschlagen");
    }
  }

  async function handleReset() {
    if (!window.confirm("Alle BuyBack-Inhalte auf Standard zurücksetzen?")) return;
    try {
      await resetCms().unwrap();
      toast.success("Standard-Inhalte wiederhergestellt");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Reset fehlgeschlagen");
    }
  }

  if (isLoading || !draft) return <BrandedLoader />;
  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="BuyBack Landing CMS" description="Inhalte konnten nicht geladen werden." />
        <Button onClick={() => refetch()}>Erneut versuchen</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="BuyBack Landing CMS"
        description="Steuert die gesamte BuyBack Capital Landing Page und das öffentliche Investor-Dashboard (Header bis Footer)."
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/80 p-4">
        <div className="text-sm text-muted-foreground">
          Dokument <span className="font-medium text-foreground">{data?.key}</span> · {versionLabel}
          {data?.updatedAt ? ` · aktualisiert ${new Date(data.updatedAt).toLocaleString("de-DE")}` : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleReset} disabled={resetting || saving}>
            Auf Standard zurücksetzen
          </Button>
          <Button onClick={handleSave} disabled={saving || resetting}>
            {saving ? "Speichern…" : "Änderungen speichern"}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => {
              if (active !== section.key) applySectionJson();
              setActive(section.key);
            }}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition",
              active === section.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-4 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              {SECTIONS.find((s) => s.key === active)?.label}
            </h2>
            <p className="text-sm text-muted-foreground">
              Bearbeite den JSON-Abschnitt. Speichern übernimmt den gesamten Content für die
              Live-Website.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={applySectionJson}>
            Abschnitt prüfen
          </Button>
        </div>

        <Textarea
          value={sectionJson}
          onChange={(e) => setSectionJson(e.target.value)}
          className="min-h-[480px] font-mono text-xs leading-relaxed"
          spellCheck={false}
        />
        {parseError ? <p className="text-sm text-destructive">{parseError}</p> : null}
      </div>
    </div>
  );
}
