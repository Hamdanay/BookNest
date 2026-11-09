const RACK_PALETTE = [
  '#f59e0b', // Amber
  '#38bdf8', // Sky
  '#10b981', // Emerald
  '#818cf8', // Indigo
  '#fb7185', // Rose
  '#a78bfa', // Violet
  '#34d399', // Mint
  '#94a3b8', // Slate
];

export function CategoryBarChart({ labels, values }) {
  const items = labels.map((label, i) => ({
    label,
    value: Number(values[i]) || 0,
  }));
  const max = Math.max(...items.map((i) => i.value), 1);
  const total = items.reduce((sum, i) => sum + i.value, 0);

  if (!items.length) {
    return (
      <div className="py-12 text-center text-xs text-slate-500">
        Belum ada data kategori yang tercatat.
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {items.map((item, idx) => {
        const pct = Math.round((item.value / (total || 1)) * 100);
        return (
          <div key={item.label} className="group">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-300 truncate group-hover:text-amber-400 transition-colors">
                {item.label}
              </span>
              <div className="flex items-center gap-2 font-mono text-slate-400">
                <span className="text-slate-200 font-semibold">{item.value}</span>
                <span className="text-[10px] text-slate-500">({pct}%)</span>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800/80 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500/80 transition-all duration-500 group-hover:bg-amber-400"
                style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RackDonutChart({ labels, values }) {
  const items = labels
    .map((label, i) => ({
      label,
      value: Number(values[i]) || 0,
      color: RACK_PALETTE[i % RACK_PALETTE.length],
    }))
    .filter((i) => i.value > 0);

  if (!items.length) {
    return (
      <div className="py-12 text-center text-xs text-slate-500">
        Belum ada data rak inventaris.
      </div>
    );
  }

  const total = items.reduce((sum, i) => sum + i.value, 0);
  let cursor = 0;
  const stops = items.map((item) => {
    const start = (cursor / total) * 360;
    cursor += item.value;
    const end = (cursor / total) * 360;
    return `${item.color} ${start}deg ${end}deg`;
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div
        className="w-36 h-36 rounded-full flex-shrink-0 relative shadow-md p-3.5"
        style={{
          background: `conic-gradient(${stops.join(', ')})`,
        }}
        aria-hidden
      >
        <div className="w-full h-full rounded-full bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
          <span className="text-xl font-bold font-mono text-slate-100 tabular-nums">
            {total}
          </span>
          <span className="text-[10px] font-medium text-slate-400">
            eksemplar
          </span>
        </div>
      </div>

      <div className="w-full space-y-2 min-w-0">
        {items.map((item) => {
          const pct = Math.round((item.value / total) * 100);
          return (
            <div
              key={item.label}
              className="flex items-center justify-between text-xs py-1 px-2 rounded-md hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-2 truncate min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ background: item.color }}
                />
                <span className="truncate text-slate-300 font-medium">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono tabular-nums text-slate-400 shrink-0">
                <span className="text-slate-200">{item.value}</span>
                <span className="text-[10px] text-slate-400">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
