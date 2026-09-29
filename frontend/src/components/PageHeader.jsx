export default function PageHeader({ title, description, action }) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-5 pb-4 sm:pb-6">
      <div className="max-w-2xl min-w-0">
        <p className="elf-mark text-nest-gold/90 text-xs sm:text-sm mb-1 italic">Arsip koleksi · BookNest</p>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-mist tracking-tight leading-tight break-words">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-mist-dim leading-relaxed max-w-xl">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0 w-full sm:w-auto [&_.elf-btn]:w-full sm:[&_.elf-btn]:w-auto [&_a]:w-full sm:[&_a]:w-auto [&_button]:w-full sm:[&_button]:w-auto">
          {action}
        </div>
      )}
    </header>
  );
}
