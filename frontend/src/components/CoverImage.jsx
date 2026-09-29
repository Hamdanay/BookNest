import { useState } from 'react';

const THEMES = {
  'Filosofi Teras': { bg: '#C45C26', fg: '#F8E6D4', accent: '#F0C27A', motif: 'teras' },
  Bumi: { bg: '#2F4F40', fg: '#E8F0C8', accent: '#C9A962', motif: 'orb' },
  'Laskar Pelangi': { bg: '#1E4D7B', fg: '#F7E9C8', accent: '#E8A838', motif: 'arc' },
  'Sejarah Dunia yang Disembunyikan': { bg: '#3A2A1C', fg: '#E8D5B5', accent: '#A24B3A', motif: 'seal' },
  'Pemrograman Web Modern': { bg: '#12211C', fg: '#C8E6D4', accent: '#6B8F7A', motif: 'grid' },
  'Bumi Manusia': { bg: '#5C2E1A', fg: '#F3E2C8', accent: '#C99A5A', motif: 'line' },
  'Habibie & Ainun': { bg: '#4A2C40', fg: '#F6E4EC', accent: '#D4A0B8', motif: 'heart' },
  'Negeri 5 Menara': { bg: '#1F3A4C', fg: '#E4F0D8', accent: '#C9A962', motif: 'tower' },
  'Laut Bercerita': { bg: '#163A48', fg: '#D7E8EA', accent: '#7A4F3A', motif: 'wave' },
  'Cantik Itu Luka': { bg: '#6B2C3A', fg: '#F7E4DC', accent: '#C99A5A', motif: 'flower' },
  'Berani Tidak Disukai': { bg: '#2A3A2A', fg: '#E8F0D8', accent: '#C9A962', motif: 'orb' },
  'Si Kancil': { bg: '#4F7A3A', fg: '#F4F0D8', accent: '#E8C15A', motif: 'leaf' },
  'Si Juki': { bg: '#2A1F1B', fg: '#F4E4C4', accent: '#C86D3B', motif: 'grid' },
  'Kamus Istilah Pustaka': { bg: '#24352C', fg: '#E6EDE6', accent: '#C9A962', motif: 'line' },
  'Pengantar Pendidikan': { bg: '#3E4A28', fg: '#F0EAD0', accent: '#C9A962', motif: 'leaf' },
  'Gadis Kretek': { bg: '#5A3218', fg: '#F3E2C4', accent: '#C99A5A', motif: 'leaf' },
  'Algoritma dan Pemrograman': { bg: '#12211C', fg: '#C8E6D4', accent: '#6B8F7A', motif: 'grid' },
};

const FALLBACKS = [
  { bg: '#1E3329', fg: '#E8F0DC', accent: '#C9A962' },
  { bg: '#3E2A21', fg: '#F4E8D4', accent: '#C99A5A' },
  { bg: '#2A1F1B', fg: '#D8E4D8', accent: '#6C7A5A' },
  { bg: '#4A3A28', fg: '#F0E4CC', accent: '#A24B3A' },
];

function hashTitle(title) {
  return [...title].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

function themeFor(judul) {
  if (THEMES[judul]) return THEMES[judul];
  return { ...FALLBACKS[hashTitle(judul) % FALLBACKS.length], motif: 'line' };
}

function Motif({ motif, accent }) {
  if (motif === 'teras') {
    return (
      <g fill="none" stroke={accent} strokeWidth="3" opacity="0.85">
        <path d="M36 92 V148" />
        <path d="M64 92 V148" />
        <path d="M92 92 V148" />
        <path d="M120 92 V148" />
        <path d="M28 92 H128" />
        <path d="M28 148 H128" />
        <path d="M44 70 L78 48 L112 70" />
      </g>
    );
  }
  if (motif === 'orb') return <circle cx="78" cy="108" r="28" fill="none" stroke={accent} strokeWidth="3" />;
  if (motif === 'arc') return <path d="M28 130 Q78 70 128 130" fill="none" stroke={accent} strokeWidth="3" />;
  if (motif === 'wave') return <path d="M24 120 C48 100 60 140 84 120 S120 100 140 120" fill="none" stroke={accent} strokeWidth="3" />;
  if (motif === 'tower') return <path d="M78 50 L96 148 H60 Z" fill="none" stroke={accent} strokeWidth="3" />;
  if (motif === 'leaf') return <path d="M78 60 C110 90 110 130 78 150 C46 130 46 90 78 60" fill="none" stroke={accent} strokeWidth="3" />;
  if (motif === 'heart') return <path d="M78 136 C40 108 42 70 78 86 C114 70 116 108 78 136" fill="none" stroke={accent} strokeWidth="3" />;
  if (motif === 'flower') return <circle cx="78" cy="110" r="18" fill="none" stroke={accent} strokeWidth="3" />;
  if (motif === 'seal') return <circle cx="78" cy="112" r="22" fill="none" stroke={accent} strokeWidth="2.5" />;
  if (motif === 'grid') {
    return (
      <g stroke={accent} strokeWidth="1.5" opacity="0.7">
        <path d="M40 80 H116 M40 104 H116 M40 128 H116" />
      </g>
    );
  }
  return <path d="M36 150 H120" stroke={accent} strokeWidth="2" />;
}

export default function CoverImage({ judul = 'BookNest', penulis = '', cover = '', className = '', alt }) {
  const [failed, setFailed] = useState(false);
  const hasFile = Boolean(cover && (cover.startsWith('http') || cover.startsWith('/uploads')));

  if (hasFile && !failed) {
    return (
      <img
        src={cover}
        alt={alt || judul}
        className={className}
        onError={() => setFailed(true)}
      />
    );
  }

  const theme = themeFor(judul);
  const lines = judul.length > 18 ? [judul.slice(0, judul.lastIndexOf(' ', 16) || 16), judul.slice(judul.lastIndexOf(' ', 16) || 16).trim()] : [judul];

  return (
    <svg viewBox="0 0 156 220" className={className} role="img" aria-label={alt || judul}>
      <rect width="156" height="220" rx="8" fill={theme.bg} />
      <rect x="8" y="8" width="140" height="204" rx="4" fill="none" stroke={theme.accent} strokeOpacity="0.45" />
      <Motif motif={theme.motif} accent={theme.accent} />
      <text x="78" y="172" textAnchor="middle" fill={theme.fg} fontFamily="Georgia, serif" fontSize={judul === 'Filosofi Teras' ? '13' : '11'} fontWeight="700">
        {lines[0]}
      </text>
      {lines[1] && (
        <text x="78" y="186" textAnchor="middle" fill={theme.fg} fontFamily="Georgia, serif" fontSize="11" fontWeight="700">
          {lines[1]}
        </text>
      )}
      <text x="78" y="204" textAnchor="middle" fill={theme.accent} fontFamily="system-ui, sans-serif" fontSize="8">
        {penulis}
      </text>
    </svg>
  );
}
