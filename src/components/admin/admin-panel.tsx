"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { UsersTable } from "@/components/admin/users-table";
import { GearTable } from "@/components/admin/gear-table";
import { RentalsTable } from "@/components/admin/rentals-table";

const TABS = [
  { id: "users", label: "Users" },
  { id: "gear", label: "Gear Listings" },
  { id: "rentals", label: "Rentals" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** Tabbed admin panel: users (suspend/activate), gear listings, rental orders. */
export function AdminPanel() {
  const [tab, setTab] = useState<TabId>("users");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage users, review gear listings, and inspect rental orders across GearUp.
          </p>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Admin sections"
        className="mt-6 flex items-center gap-1 overflow-x-auto border-b border-border"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <section className="mt-6">
        {tab === "users" && <UsersTable />}
        {tab === "gear" && <GearTable />}
        {tab === "rentals" && <RentalsTable />}
      </section>
    </main>
  );
}