"use client";

import { useCallback, useEffect, useState } from "react";
import { adminService } from "@/services/admin.service";
import { getApiErrorMessage } from "@/lib/api-client";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/ui/data-state";
import type { AdminRentalOrder } from "@/types";

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

/** GET /admin/rentals — every rental order placed on the platform. */
export function RentalsTable() {
  const [orders, setOrders] = useState<AdminRentalOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await adminService.getRentals());
    } catch (e) {
      setOrders(null);
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !orders) return <TableSkeleton rows={6} cols={6} />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!orders || orders.length === 0) return <EmptyState message="No rental orders found." />;

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Gear</th>
            <th className="px-4 py-3 font-medium">Period</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                {order.id.slice(0, 8)}…
              </td>
              <td className="px-4 py-3">{order.customer?.name ?? "—"}</td>
              <td className="px-4 py-3">{order.gear?.title ?? "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {order.startDate || order.endDate
                  ? `${formatDate(order.startDate)} – ${formatDate(order.endDate)}`
                  : "—"}
              </td>
              <td className="px-4 py-3">
                {typeof order.totalAmount === "number"
                  ? currencyFormat.format(order.totalAmount)
                  : "—"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}