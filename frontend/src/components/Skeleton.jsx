export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-white/10 ${className}`} />;
}

export function FolioSkeleton({ lines = 4, className = '' }) {
  return (
    <div className={`elf-folio p-5 space-y-3 ${className}`}>
      <Skeleton className="h-5 w-1/3 bg-folio-ink/10" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full bg-folio-ink/10" />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Memuat dashboard">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 bg-white/10" />
        <Skeleton className="h-4 w-96 max-w-full bg-white/10" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="elf-folio p-4 min-h-[6.5rem] space-y-4">
            <Skeleton className="h-3 w-20 bg-folio-ink/10" />
            <Skeleton className="h-7 w-12 bg-folio-ink/10" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <FolioSkeleton lines={6} />
        <FolioSkeleton lines={6} />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Memuat detail buku">
      <Skeleton className="h-10 w-40 bg-white/10" />
      <div className="elf-folio p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <Skeleton className="aspect-[3/4] w-full max-w-[15rem] bg-folio-ink/10" />
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-8 w-3/4 bg-folio-ink/10" />
          <Skeleton className="h-4 w-1/2 bg-folio-ink/10" />
          <FolioSkeleton lines={4} />
        </div>
      </div>
    </div>
  );
}
