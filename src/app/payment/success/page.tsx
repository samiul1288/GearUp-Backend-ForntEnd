import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = { title: "Payment response" };

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { tran_id?: string; transactionId?: string };
}) {
  const transactionId = searchParams.tran_id ?? searchParams.transactionId;

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6">
      <span className="rounded-full bg-emerald-100 p-4 text-emerald-700">
        <CheckCircle2 className="h-9 w-9" aria-hidden />
      </span>
      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-emerald-700">
        Payment response received
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Thank you</h1>
      <p className="mt-3 text-muted-foreground">
        The payment gateway has returned you to GearUp. Payment status may take a moment to update;
        check your rentals dashboard for the latest status.
      </p>
      {transactionId && (
        <p className="mt-4 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          Transaction reference: <span className="font-medium text-foreground">{transactionId}</span>
        </p>
      )}
      <Link href="/dashboard/customer" className="mt-7 rounded-md bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:opacity-90">
        View my rentals
      </Link>
    </main>
  );
}
