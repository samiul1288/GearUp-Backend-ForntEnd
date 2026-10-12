"use client";

import { useCallback, useEffect, useState } from "react";
import { adminService } from "@/services/admin.service";
import { getApiErrorMessage } from "@/lib/api-client";
import { StatusBadge } from "@/components/ui/status-badge";
import { getGearCategoryName } from "@/types/gear";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/ui/data-state";
import type { AdminGearItem } from "@/types";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date);
}

/** GET /admin/gear — all gear listings across every provider. */
export function GearTable() {
  const [items, setItems] = useState<AdminGearItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await adminService.getGear());
    } catch (e) {
      setItems(null);
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !items) return <TableSkeleton rows={6} cols={5} />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!items || items.length === 0) return <EmptyState message="No gear listings found." />;

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[680px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">Gear</th>
            <th className="px-4 py-3 font-medium">Provider</th>
            <th className="px-4 py-3 font-medium">Price / day</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Listed</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <div className="font-medium">{item.title}</div>
                {item.category && (
                  <div className="text-xs text-muted-foreground">
                    {getGearCategoryName(item.category)}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {item.provider?.name ?? item.owner?.name ?? "—"}
              </td>
              <td className="px-4 py-3">
                {typeof item.pricePerDay === "number"
                  ? currencyFormat.format(item.pricePerDay)
                  : "—"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge
                  status={item.status ?? (item.isAvailable ? "AVAILABLE" : "UNAVAILABLE")}
                />
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(item.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}