import { useMemo } from 'react';

export default function CanopyGrowthRings({ byCategory = {}, totalBooks = 0, totalCopies = 0 }) {
  const categories = useMemo(() => {
    return Object.entries(byCategory).map(([name, count], idx) => ({
      name,
      count: Number(count) || 0,
      radius: 40 + idx * 16,
      strokeWidth: 4 + Math.min(count * 1.5, 12),
      opacity: 0.35 + (idx % 3) * 0.2,
      color: ['#D4A373', '#8FA294', '#E9C46A', '#52796F', '#C59B6D', '#748C7E'][idx % 6],
    }));
  }, [byCategory]);

  return (
    <div className="sanctuary-card p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-forest-sage/15">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-forest-amber uppercase">
            Canopy Velocity & Cycles
          </span>
          <h3 className="font-serif text-lg font-bold text-forest-mist">
            Lingkaran Tumbuh Arsip (Growth Rings)
          </h3>
        </div>
        <div className="text-right font-mono text-xs">
          <span className="text-forest-amber font-semibold">{totalCopies}</span>
          <span className="text-forest-sage text-[10px] block">Cincin Eksemplar</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center py-4">
        {/* SVG Concentric Tree Growth Rings */}
        <div className="sm:col-span-6 flex justify-center">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
            <svg viewBox="0 0 240 240" className="w-full h-full transform -rotate-90">
              {/* Outer Bark Rim */}
              <circle
                cx="120"
                cy="120"
                r="108"
                fill="none"
                stroke="#1B2824"
                strokeWidth="12"
                strokeDasharray="4 6"
              />

              {/* Concentric Annual Rings per Category */}
              {categories.map((cat, i) => (
                <g key={cat.name}>
                  <circle
                    cx="120"
                    cy="120"
                    r={36 + i * 14}
                    fill="none"
                    stroke={cat.color}
                    strokeWidth={cat.strokeWidth}
                    strokeOpacity={cat.opacity}
                    strokeDasharray={i % 2 === 0 ? 'none' : '3 2'}
                    className="transition-all duration-700 hover:stroke-forest-amber hover:opacity-100 cursor-pointer"
                  />
                </g>
              ))}

              {/* Tree Core Heartwood */}
              <circle
                cx="120"
                cy="120"
                r="22"
                fill="#243431"
                stroke="#D4A373"
                strokeWidth="2"
              />
            </svg>

            {/* Inner Core Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="font-serif text-lg font-bold text-forest-amber leading-none">
                {totalBooks}
              </span>
              <span className="text-[9px] font-mono tracking-wider text-forest-dew uppercase mt-0.5">
                Pohon Inti
              </span>
            </div>
          </div>
        </div>

        {/* Legend of Rings */}
        <div className="sm:col-span-6 space-y-2.5">
          <div className="text-[11px] font-mono text-forest-dew/90 pb-1">
            Ketebalan cincin merepresentasikan kerapatan judul di kanopi:
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-[#101513]/70 border border-forest-sage/15 hover:border-forest-amber/40 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: cat.color }}
                  />
                  <span className="text-forest-mist font-medium truncate">{cat.name}</span>
                </div>
                <span className="font-mono text-forest-amber text-xs tabular-nums font-semibold">
                  {cat.count} judul
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-forest-sage/15 flex items-center justify-between text-[11px] font-mono text-forest-sage font-medium">
        <span>Siklus Kanopi Aktif</span>
        <span className="text-forest-amber">Musim Semi • WAL Synchronized</span>
      </div>
    </div>
  );
}
