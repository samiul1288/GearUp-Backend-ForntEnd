"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Ban, CheckCircle2, Loader2 } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { getApiErrorMessage } from "@/lib/api-client";
import { RoleBadge } from "@/components/ui/role-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/ui/data-state";
import type { AdminUser, UserStatus } from "@/types";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date);
}

/**
 * GET /admin/users — lists every user with suspend/activate actions
 * (PATCH /admin/users/:id).
 */
export function UsersTable() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await adminService.getUsers());
    } catch (e) {
      setUsers(null);
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleStatus = async (user: AdminUser) => {
    const next: UserStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setPendingId(user.id);
    try {
      await adminService.updateUserStatus(user.id, next);
      toast.success(`${user.name} is now ${next.toLowerCase()}.`);
      await load();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setPendingId(null);
    }
  };

  if (loading && !users) return <TableSkeleton rows={6} cols={5} />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!users || users.length === 0) return <EmptyState message="No users found." />;

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[680px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Joined</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const suspended = u.status !== "ACTIVE";
            const busy = pendingId === u.id;
            return (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={u.role} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={u.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleStatus(u)}
                    disabled={pendingId !== null}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${
                      suspended
                        ? "border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                        : "border-red-500/30 text-red-600 hover:bg-red-500/10 dark:text-red-400"
                    }`}
                  >
                    {busy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : suspended ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <Ban className="h-3.5 w-3.5" />
                    )}
                    {busy ? "Saving…" : suspended ? "Activate" : "Suspend"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}