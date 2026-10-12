import Link from "next/link";
import { Compass } from "lucide-react";

/** Root 404 page for unmatched routes. */
export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <Compass className="h-10 w-10 text-primary" />
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        This page could not be found. It may have been moved or deleted.
      </p>
      <Link
        href="/"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Back home
      </Link>
    </main>
  );
}