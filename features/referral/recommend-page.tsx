"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANDING_PAGE_URL } from "@/services/config";

export function RecommendPage() {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(LANDING_PAGE_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Landing-Page-Link kopieren:", LANDING_PAGE_URL);
    }
  }

  async function shareLink() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "BuyBack Capital",
          text: "BuyBack Capital – Working Capital Financing (Private Debt)",
          url: LANDING_PAGE_URL,
        });
        return;
      } catch {
        // user cancelled share sheet
      }
    }
    await copyLink();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Weiterempfehlen
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          BuyBack Capital empfehlen
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Du bist zufrieden mit unserer Zusammenarbeit und kennst weitere Unternehmer, die
          ebenfalls von BuyBack Capital profitieren könnten? Dann leite unsere Landing Page gerne
          weiter.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)]">
        <div className="grid md:grid-cols-2">
          <div className="space-y-6 p-8 md:p-10">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Bitte teile die öffentliche Landing Page — nicht das Investor-Dashboard. So bleibt
              der Einstieg für Interessenten klar und einfach weiterleitbar.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                size="lg"
                className="rounded-full px-5"
                onClick={() => window.open(LANDING_PAGE_URL, "_blank", "noopener,noreferrer")}
              >
                <ExternalLink data-icon="inline-start" />
                Landing Page öffnen
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="rounded-full px-5"
                onClick={shareLink}
              >
                <Share2 data-icon="inline-start" />
                Landing Page teilen
              </Button>
              <Button
                type="button"
                size="lg"
                variant="secondary"
                className="rounded-full px-5"
                onClick={copyLink}
              >
                {copied ? (
                  <Check data-icon="inline-start" className="text-primary" />
                ) : (
                  <Copy data-icon="inline-start" />
                )}
                {copied ? "Link kopiert" : "Link kopieren"}
              </Button>
            </div>

            <p className="break-all text-xs text-muted-foreground">{LANDING_PAGE_URL}</p>
          </div>

          <div className="flex flex-col justify-center bg-primary p-8 text-primary-foreground md:p-10">
            <p className="text-xs font-medium uppercase tracking-widest text-primary-foreground/70">
              BuyBack Capital
            </p>
            <p className="mt-4 text-2xl font-semibold leading-snug md:text-3xl">
              Der richtige Link für Interessenten.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-primary-foreground/80">
              Öffentliche Pitch-Seite mit Konditionen, Sicherheitsstruktur und Kontakt — ideal zum
              Weiterleiten.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
