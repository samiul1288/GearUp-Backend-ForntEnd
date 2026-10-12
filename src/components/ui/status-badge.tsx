const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  AVAILABLE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  COMPLETED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  APPROVED: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  CONFIRMED: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  RENTED: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  ACTIVE_RENTAL: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  SUSPENDED: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
  BLOCKED: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
  CANCELLED: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
  REJECTED: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
};

/** Colored pill for account/rental/gear statuses. Falls back to neutral. */
export function StatusBadge({ status }: { status: string }) {
  const key = String(status ?? "").toUpperCase();
  const style = STATUS_STYLES[key] ?? "border-border bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${style}`}
    >
      {status || "Unknown"}
    </span>
  );
}