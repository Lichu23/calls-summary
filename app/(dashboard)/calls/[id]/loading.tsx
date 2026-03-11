export default function CallDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button skeleton */}
      <div className="h-8 w-24 rounded-md bg-muted animate-pulse" />

      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-64 rounded-md bg-muted animate-pulse" />
      </div>

      {/* Content skeleton — two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border p-5 space-y-3">
          <div className="h-5 w-24 rounded-md bg-muted animate-pulse" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 rounded-md bg-muted animate-pulse" style={{ width: `${70 + (i % 3) * 10}%` }} />
            ))}
          </div>
        </div>
        <div className="rounded-lg border p-5 space-y-3">
          <div className="h-5 w-24 rounded-md bg-muted animate-pulse" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 rounded-md bg-muted animate-pulse" style={{ width: `${60 + (i % 4) * 10}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
