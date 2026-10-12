"use client";

import Link from "next/link";
import { Bike } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { getHomeForRole } from "@/lib/auth";

export function Footer() {
  const { isAuthenticated, role } = useAuth();
  const year = new Date().getFullYear();

  // Footer links also adapt to auth status + role.
  const links: { href: string; label: string }[] = [{ href: "/", label: "Home" }];
  if (isAuthenticated && role) {
    links.push({ href: getHomeForRole(role), label: "Dashboard" });
    links.push(
      role === "CUSTOMER"
        ? { href: "/gear", label: "Browse Gear" }
        : { href: "/dashboard/provider", label: "Manage Gear" }
    );
  } else {
    links.push({ href: "/login", label: "Login" });
    links.push({ href: "/register", label: "Register" });
  }

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2 font-bold">
            <Bike className="h-6 w-6 text-primary" />
            <span>GearUp</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Rent, share, and manage gear with people near you. Built with the Next.js App Router
            and Tailwind CSS.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Quick links</h3>
          <ul className="mt-3 space-y-2">
            {links.map((l) => (
              <li key={`${l.href}-${l.label}`}>
                <Link
                  href={l.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
          © {year} GearUp. All rights reserved.
        </div>
      </div>
    </footer>
  );
}