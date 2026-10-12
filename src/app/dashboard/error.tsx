"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

/** Dashboard-segment error boundary (covers /dashboard/* layouts & pages). */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertTriangle className="h-10 w-10 text-red-500" />
      <h1 className="text-2xl font-bold tracking-tight">Dashboard error</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {process.env.NODE_ENV !== "production" && error?.message
          ? error.message
          : "We couldn't load this dashboard section. Please try again."}
      </p>
      {error?.digest && (
        <p className="text-xs text-muted-foreground">Error reference: {error.digest}</p>
      )}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <RotateCcw className="h-4 w-4" /> Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}