import type { Metadata } from "next";
import { RoleGate } from "@/components/auth/role-gate";
import { ProviderDashboard } from "@/components/dashboard/provider-dashboard";

export const metadata: Metadata = { title: "Provider Dashboard" };

export default function ProviderDashboardPage() {
  return (
    <RoleGate role="PROVIDER">
      <ProviderDashboard />
    </RoleGate>
  );
}
