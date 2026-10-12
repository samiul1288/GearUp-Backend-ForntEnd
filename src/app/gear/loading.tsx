export default function GearLoading() {
  return (
    <main aria-label="Loading gear" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="h-64 animate-pulse rounded-xl bg-slate-900" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <div className="h-72 animate-pulse rounded-xl bg-muted" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-xl border border-border">
              <div className="aspect-[4/3] animate-pulse bg-muted" />
              <div className="space-y-3 p-4">
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
