const RACK_COLORS = ['#1a2822', '#2f4f40', '#4a6b58', '#c9a962', '#6b8f7a', '#9e4a4a', '#8a7b4a', '#5c4033'];

export function CategoryBarChart({ labels, values }) {
  const items = labels.map((label, i) => ({
    label,
    value: Number(values[i]) || 0,
  }));
  const max = Math.max(...items.map((i) => i.value), 1);

  if (!items.length) {
    return <p className="text-xs text-folio-muted text-center py-8">Belum ada data kategori.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <span className="text-xs font-medium text-folio-ink truncate">{item.label}</span>
            <span className="text-xs tabular-nums text-folio-muted flex-shrink-0">{item.value}</span>
          </div>
          <div className="h-2 rounded-full bg-folio-ink/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-nest-warm to-nest-olive"
              style={{ width: `${Math.max(6, (item.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function RackDonutChart({ labels, values }) {
  const items = labels
    .map((label, i) => ({
      label,
      value: Number(values[i]) || 0,
      color: RACK_COLORS[i % RACK_COLORS.length],
    }))
    .filter((i) => i.value > 0);

  if (!items.length) {
    return <p className="text-xs text-folio-muted text-center py-8">Belum ada data rak.</p>;
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
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div
        className="w-36 h-36 rounded-full flex-shrink-0 shadow-inner"
        style={{
          background: `conic-gradient(${stops.join(', ')})`,
        }}
        aria-hidden
      >
        <div className="w-full h-full p-8">
          <div className="w-full h-full rounded-full bg-nest-surface flex flex-col items-center justify-center">
            <span className="font-display text-lg font-semibold text-folio-ink tabular-nums">{total}</span>
            <span className="text-[10px] text-folio-muted">eksemplar</span>
          </div>
        </div>
      </div>
      <ul className="w-full space-y-1.5 min-w-0">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-xs text-folio-ink">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: item.color }} />
            <span className="truncate flex-1">{item.label}</span>
            <span className="tabular-nums text-folio-muted">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
