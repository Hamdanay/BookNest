export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-forest-moss/40 border border-forest-sage/10 ${className}`}
      aria-hidden
    />
  );
}

export function FolioSkeleton({ lines = 4, className = '' }) {
  return (
    <div className={`sanctuary-card p-6 space-y-4 ${className}`}>
      <Skeleton className="h-6 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Memuat sanctuary dashboard">
      <div className="space-y-2 pb-6 border-b border-forest-sage/15">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="sanctuary-card p-4 min-h-[6rem] space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FolioSkeleton lines={5} />
        <FolioSkeleton lines={5} />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto" aria-busy="true" aria-label="Memuat naskah">
      <Skeleton className="h-8 w-40" />
      <div className="sanctuary-card p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4">
          <Skeleton className="aspect-[3/4] w-full max-w-[15rem] rounded-xl" />
        </div>
        <div className="md:col-span-8 space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
