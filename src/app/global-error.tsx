"use client";

/**
 * Global error boundary — replaces the root layout when it fails to render.
 * Must render its own <html> and <body>; styled with inline CSS because the
 * global stylesheet is not guaranteed to be loaded at this point.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
          background: "#fff",
          color: "#0f172a",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Something went very wrong</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>
            A critical error occurred while loading GearUp.
          </p>
          {error?.digest && (
            <p style={{ color: "#94a3b8", fontSize: "0.75rem" }}>Error reference: {error.digest}</p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              border: "none",
              background: "#2563eb",
              color: "#fff",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}