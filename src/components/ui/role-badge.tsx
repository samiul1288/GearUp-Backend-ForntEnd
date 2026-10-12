import { ROLE_META } from "@/lib/auth";
import type { Role } from "@/types";

/** Small pill that displays a user's role. */
export function RoleBadge({ role }: { role: Role }) {
  return (
    <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
      {ROLE_META[role].label}
    </span>
  );
}