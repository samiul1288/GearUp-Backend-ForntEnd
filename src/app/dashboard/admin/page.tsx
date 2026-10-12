import type { Metadata } from "next";
import { RoleGate } from "@/components/auth/role-gate";
import { AdminPanel } from "@/components/admin/admin-panel";

export const metadata: Metadata = { title: "Admin" };

export default function AdminDashboardPage() {
  return (
    <RoleGate role="ADMIN">
      <AdminPanel />
    </RoleGate>
  );
}