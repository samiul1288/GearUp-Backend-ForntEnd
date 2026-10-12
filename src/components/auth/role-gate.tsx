"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { getHomeForRole } from "@/lib/auth";
import type { Role } from "@/types";

/**
 * Client-side guard for role-protected pages.
 * - While auth is loading (or a wrong role is present) it shows a spinner.
 * - Unauthenticated users are redirected to /login.
 * - Authenticated users with the wrong role are sent to their own dashboard.
 */
export function RoleGate({ role, children }: { role: Role; children: React.ReactNode }) {
  const { status, role: actualRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && actualRole && actualRole !== role) {
      router.replace(getHomeForRole(actualRole));
    }
  }, [status, actualRole, role, router]);

  const blocked =
    status !== "authenticated" || (status === "authenticated" && actualRole !== role);

  if (blocked) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Loading" />
      </div>
    );
  }

  return <>{children}</>;
}