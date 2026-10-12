import type { Metadata } from "next";
import { RoleGate } from "@/components/auth/role-gate";
import { CustomerDashboard } from "@/components/dashboard/customer-dashboard";

export const metadata: Metadata = { title: "Customer Dashboard" };

export default function CustomerDashboardPage() {
  return (
    <RoleGate role="CUSTOMER">
      <CustomerDashboard />
    </RoleGate>
  );
}
