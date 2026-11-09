export default function PageHeader({ title, description, action, badge }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-forest-sage/15">
      <div className="space-y-2 max-w-2xl min-w-0">
        {badge && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#161B18] px-3.5 py-1 text-[11px] font-ancient tracking-widest text-forest-amber border border-forest-amber/35 shadow-bioglow uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-forest-amber animate-bio-pulse" />
            <span>{badge}</span>
          </div>
        )}
        <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-forest-mist leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-forest-sage leading-relaxed max-w-xl">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
