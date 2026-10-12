"use client";

import { User, Wrench } from "lucide-react";
import { ROLE_META } from "@/lib/auth";
import type { Role } from "@/types";

interface RoleSelectorProps {
  value: Role;
  onChange: (role: Role) => void;
  error?: string;
}

const OPTIONS: { role: Role; description: string; Icon: typeof User }[] = [
  { role: "CUSTOMER", description: "I want to find and book gear", Icon: User },
  { role: "PROVIDER", description: "I list and rent out my gear", Icon: Wrench },
];

/** Two-card toggle used to pick CUSTOMER vs PROVIDER on the register form. */
export function RoleSelector({ value, onChange, error }: RoleSelectorProps) {
  return (
    <div>
      <span className="block text-sm font-medium">I am a…</span>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {OPTIONS.map(({ role, description, Icon }) => {
          const active = value === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => onChange(role)}
              aria-pressed={active}
              className={`flex items-start gap-3 rounded-md border p-3 text-left transition-colors ${
                active
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <Icon className={`mt-0.5 h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
              <span>
                <span className="block text-sm font-semibold">{ROLE_META[role].label}</span>
                <span className="block text-xs text-muted-foreground">{description}</span>
              </span>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}