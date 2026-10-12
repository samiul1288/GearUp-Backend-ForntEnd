export default function GearDetailLoading() {
  return (
    <main aria-label="Loading gear details" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 h-4 w-28 animate-pulse rounded bg-muted" />
      <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <div className="aspect-[4/3] animate-pulse rounded-2xl bg-muted" />
          <div className="mt-3 flex gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-20 w-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-52 animate-pulse rounded-xl bg-muted" />
          <div className="h-28 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </main>
  );
}
