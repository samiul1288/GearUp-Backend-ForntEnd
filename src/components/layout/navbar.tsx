"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Bike, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { RoleBadge } from "@/components/ui/role-badge";
import { getHomeForRole } from "@/lib/auth";

interface NavLink {
  href: string;
  label: string;
}

export function Navbar() {
  const { status, user, role, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Navigation links change based on auth status + role.
  const links: NavLink[] = [
    { href: "/", label: "Home" },
    { href: "/gear", label: "Browse Gear" },
  ];
  if (isAuthenticated && role) {
    links.push({ href: getHomeForRole(role), label: "Dashboard" });
    if (role === "PROVIDER") links.push({ href: "/dashboard/provider", label: "Manage Gear" });
  }

  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    router.replace("/");
  };

  const linkClass = (href: string) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      pathname === href ||
      (href === "/gear" && pathname.startsWith("/gear/")) ||
      (href.startsWith("/dashboard/") && pathname.startsWith(href))
        ? "text-primary"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" onClick={close} className="flex items-center gap-2 font-bold">
          <Bike className="h-6 w-6 text-primary" />
          <span className="text-lg">GearUp</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={`${l.href}-${l.label}`} href={l.href} className={linkClass(l.href)}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth actions */}
        <div className="hidden items-center gap-3 md:flex">
          {status === "loading" ? (
            <div className="h-8 w-28 animate-pulse rounded-md bg-muted" aria-hidden />
          ) : isAuthenticated && user ? (
            <>
              <span className="max-w-[10rem] truncate text-sm font-medium">{user.name}</span>
              {role && <RoleBadge role={role} />}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border md:hidden">
          <div className="space-y-1 px-4 py-3">
            {links.map((l) => (
              <Link
                key={`${l.href}-${l.label}`}
                href={l.href}
                onClick={close}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${
                  pathname === l.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2">
              <hr className="mb-3" />
              {status === "loading" ? (
                <div className="h-8 w-28 animate-pulse rounded-md bg-muted" aria-hidden />
              ) : isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <span className="truncate text-sm font-medium">{user.name}</span>
                    {role && <RoleBadge role={role} />}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={close}
                    className="rounded-md border border-border px-3 py-2 text-center text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={close}
                    className="rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}