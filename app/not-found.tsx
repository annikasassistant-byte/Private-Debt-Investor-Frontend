import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mesh-background flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Fehler 404
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Seite nicht gefunden</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Die angeforderte Seite existiert nicht oder wurde verschoben.
      </p>
      <Link
        href="/login"
        className="mt-8 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        Zur Anmeldung
      </Link>
    </div>
  );
}
