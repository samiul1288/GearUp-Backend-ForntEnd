import type { Metadata } from "next";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Dashboard" },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <DashboardNav />
        </div>
      </div>
      {children}
    </div>
  );
}