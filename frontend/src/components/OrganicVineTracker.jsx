import { useState } from 'react';
import { Leaf, Sparkles, Check, Flame } from 'lucide-react';

export default function OrganicVineTracker({ totalCopies = 48, availableCopies = 38 }) {
  const [targetGoal, setTargetGoal] = useState(50);
  const percent = Math.min(100, Math.round((availableCopies / Math.max(1, targetGoal)) * 100));

  // Determine stage of the vine
  const leafCount = Math.floor(percent / 12);
  const bloomsCount = Math.floor(percent / 25);

  return (
    <div className="sanctuary-card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-forest-sage/15">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#101513] border border-forest-amber/40 text-forest-amber">
            <Leaf size={18} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-forest-amber uppercase">
              Canopy Vine & Goals
            </span>
            <h3 className="font-serif text-lg font-bold text-forest-mist">
              Sulur Pertumbuhan Membaca
            </h3>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-serif font-bold text-forest-amber">{percent}%</span>
          <span className="text-[10px] font-mono text-forest-sage block">Kerapatan Sulur</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-forest-dew/90 leading-relaxed font-sans">
        Target keterbacaan naskah fisik diwujudkan sebagai sulur tanaman rambat. Setiap eksemplar yang aktif dibaca menumbuhkan tunas daun baru dan kuncup bunga amber.
      </p>

      {/* Organic Vine Interactive Path */}
      <div className="relative py-3 px-2 rounded-xl bg-[#101513]/70 border border-forest-sage/15 overflow-hidden">
        <svg viewBox="0 0 500 70" className="w-full h-16 overflow-visible">
          <defs>
            <linearGradient id="vineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2D443E" />
              <stop offset="50%" stopColor="#52796F" />
              <stop offset="100%" stopColor="#D4A373" />
            </linearGradient>
            <filter id="amberGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Stem Track (Dormant branch) */}
          <path
            d="M 10 35 Q 80 15, 150 40 T 290 30 T 430 45 T 490 35"
            fill="none"
            stroke="#1C2826"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Living Growing Vine Stem */}
          <path
            d="M 10 35 Q 80 15, 150 40 T 290 30 T 430 45 T 490 35"
            fill="none"
            stroke="url(#vineGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="500"
            strokeDashoffset={500 - (500 * percent) / 100}
            className="transition-all duration-1000 ease-out"
          />

          {/* Organic Leaf Nodes sprouting along the vine */}
          {[
            { x: 50, y: 25, r: 25 },
            { x: 110, y: 32, r: -35 },
            { x: 175, y: 36, r: 40 },
            { x: 230, y: 32, r: -25 },
            { x: 300, y: 34, r: 30 },
            { x: 365, y: 40, r: -40 },
            { x: 420, y: 43, r: 25 },
            { x: 475, y: 36, r: -30 },
          ].map((leaf, idx) => {
            const isSprouted = idx < leafCount;
            return (
              <g
                key={idx}
                transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.r}) scale(${isSprouted ? 1 : 0})`}
                className="transition-transform duration-700 ease-out"
                style={{ transformOrigin: `${leaf.x}px ${leaf.y}px` }}
              >
                <path
                  d="M 0 0 C 8 -12, 18 -8, 20 0 C 18 8, 8 12, 0 0"
                  fill={idx % 2 === 0 ? '#8FA294' : '#52796F'}
                  stroke="#2D443E"
                  strokeWidth="0.8"
                  opacity={isSprouted ? 0.9 : 0}
                />
              </g>
            );
          })}

          {/* Golden Amber Blossoms at major milestones */}
          {[
            { x: 150, y: 40, threshold: 25 },
            { x: 290, y: 30, threshold: 50 },
            { x: 430, y: 45, threshold: 75 },
            { x: 490, y: 35, threshold: 100 },
          ].map((blossom, bIdx) => {
            const isBloomed = percent >= blossom.threshold;
            return (
              <g
                key={bIdx}
                transform={`translate(${blossom.x}, ${blossom.y}) scale(${isBloomed ? 1 : 0.4})`}
                className="transition-all duration-700"
              >
                <circle
                  cx="0"
                  cy="0"
                  r={isBloomed ? '7' : '4'}
                  fill={isBloomed ? '#D4A373' : '#1C2826'}
                  stroke="#E9C46A"
                  strokeWidth="1.5"
                  filter={isBloomed ? 'url(#amberGlow)' : undefined}
                />
                {isBloomed && (
                  <circle cx="0" cy="0" r="2.5" fill="#FFF8E7" />
                )}
              </g>
            );
          })}
        </svg>

        {/* Status Milestones Bar underneath */}
        <div className="flex items-center justify-between pt-2 px-2 text-[10px] font-mono text-forest-sage">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-forest-sage" />
            Benih Awal
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-forest-amber" />
            25% Tunas
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-forest-amber" />
            50% Rimbun
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-forest-glow" />
            100% Mekar Penuh
          </span>
        </div>
      </div>

      {/* Target Adjuster & Metrics */}
      <div className="pt-2 border-t border-forest-sage/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-mono text-forest-dew">
          <span>Target Musim Ini:</span>
          <input
            type="number"
            min="10"
            max="200"
            value={targetGoal}
            onChange={(e) => setTargetGoal(Math.max(10, Number(e.target.value) || 10))}
            className="w-16 px-2 py-0.5 rounded bg-[#101513] border border-forest-sage/20 text-forest-amber text-center font-mono font-bold"
          />
          <span>eksemplar</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-forest-sage">
          <span>{leafCount * 2} Daun Tumbuh</span>
          <span>•</span>
          <span className="text-forest-amber font-semibold">{bloomsCount} Kuncup Mekar</span>
        </div>
      </div>
    </div>
  );
}
