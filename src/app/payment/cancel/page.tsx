import type { Metadata } from "next";
import Link from "next/link";
import { XCircle } from "lucide-react";

export const metadata: Metadata = { title: "Payment cancelled" };

export default function PaymentCancelPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6">
      <span className="rounded-full bg-amber-100 p-4 text-amber-700">
        <XCircle className="h-9 w-9" aria-hidden />
      </span>
      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-amber-700">
        Payment not completed
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Your payment was cancelled</h1>
      <p className="mt-3 text-muted-foreground">
        No payment confirmation was received. Your rental remains available in your dashboard;
        you can try again when it is confirmed.
      </p>
      <Link href="/dashboard/customer" className="mt-7 rounded-md bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:opacity-90">
        Return to my rentals
      </Link>
    </main>
  );
}
