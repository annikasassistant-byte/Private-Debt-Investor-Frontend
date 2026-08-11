"use client";

import { useEffect } from "react";

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
    <html lang="de">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: 24,
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 28, margin: 0 }}>Etwas ist schiefgelaufen</h1>
        <p style={{ marginTop: 12, color: "#666", maxWidth: 420 }}>
          Die Anwendung konnte diese Aktion nicht ausführen. Bitte versuchen Sie es erneut.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: 24,
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: "#6b3fa0",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Erneut versuchen
        </button>
      </body>
    </html>
  );
}
