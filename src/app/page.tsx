"use client";

import Link from "next/link";
import { ArrowRight, Bike, ShieldCheck, Users, Wrench } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { getHomeForRole } from "@/lib/auth";

const FEATURES = [
  {
    icon: Users,
    title: "Community driven",
    description: "Connect with customers and providers in your area.",
  },
  {
    icon: Wrench,
    title: "Built for providers",
    description: "List your gear and earn on your own schedule.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & simple",
    description: "Secure authentication with role-based dashboards.",
  },
];

export default function HomePage() {
  const { isAuthenticated, role } = useAuth();

  return (
    <main>
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6">
        <div className="flex items-center gap-3">
          <Bike className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">GearUp</h1>
        </div>
        <p className="max-w-xl text-lg text-muted-foreground">
          The modern marketplace to rent, share, and manage gear — whether you&apos;re finding what
          you need or lending what you have.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {isAuthenticated && role ? (
            <Link
              href={getHomeForRole(role)}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 font-medium transition-colors hover:bg-muted"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 pb-20 sm:px-6 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-lg border border-border bg-card p-6">
            <Icon className="h-6 w-6 text-primary" />
            <h2 className="mt-3 font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
