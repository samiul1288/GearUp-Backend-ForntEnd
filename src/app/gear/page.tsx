import type { Metadata } from "next";
import { Suspense } from "react";
import { GearBrowser } from "@/components/gear/gear-browser";

export const metadata: Metadata = {
  title: "Browse Gear",
  description: "Find quality outdoor and adventure gear to rent from your community.",
};

function GearPageFallback() {
  return (
    <main>
      <div className="h-72 animate-pulse bg-slate-900" />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[240px_1fr]">
        <div className="h-72 animate-pulse rounded-xl bg-muted" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function GearPage() {
  return (
    <Suspense fallback={<GearPageFallback />}>
      <GearBrowser />
    </Suspense>
  );
}
