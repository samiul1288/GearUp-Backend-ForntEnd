import Link from "next/link";
import { Compass } from "lucide-react";

/** 404 for unknown routes inside the /dashboard segment (notFound()). */
export default function DashboardNotFound() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center gap-4 p-8 text-center">
      <Compass className="h-10 w-10 text-primary" />
      <h1 className="text-2xl font-bold tracking-tight">Dashboard page not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The dashboard page you&apos;re looking for doesn&apos;t exist.
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