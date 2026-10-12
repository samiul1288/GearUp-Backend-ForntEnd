"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { getHomeForRole } from "@/lib/auth";

interface NavItem {
  href: string;
  label: string;
}

/**
 * Role-aware sub-navigation rendered inside the /dashboard layout.
 * Returns null until auth has hydrated to avoid SSR/client mismatches.
 */
export function DashboardNav() {
  const { role, isAuthenticated } = useAuth();
  const pathname = usePathname();

  if (!isAuthenticated || !role) return null;

  const items: NavItem[] = [
    {
      href: getHomeForRole(role),
      label: role === "ADMIN" ? "Admin Panel" : "My Dashboard",
    },
  ];
  if (role === "CUSTOMER") items.push({ href: "/gear", label: "Browse Gear" });

  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            pathname === item.href || pathname.startsWith(`${item.href}/`)
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}