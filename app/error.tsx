"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mesh-background flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Fehler
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Etwas ist schiefgelaufen</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Die Anwendung konnte diese Aktion nicht ausführen. Bitte versuchen Sie es erneut.
      </p>
      <Button className="mt-8" onClick={() => reset()}>
        Erneut versuchen
      </Button>
    </div>
  );
}
