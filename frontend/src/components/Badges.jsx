const kondisiStyles = {
  Baik: {
    bg: 'bg-[#182622] text-[#81B29A] border-[#81B29A]/30',
    dot: 'bg-[#81B29A]',
  },
  'Cukup Baik': {
    bg: 'bg-[#2A231C] text-[#D4A373] border-[#D4A373]/30',
    dot: 'bg-[#D4A373]',
  },
  'Rusak Ringan': {
    bg: 'bg-[#2E1F1A] text-[#E07A5F] border-[#E07A5F]/30',
    dot: 'bg-[#E07A5F]',
  },
  'Rusak Berat': {
    bg: 'bg-[#381A1E] text-[#F28482] border-[#F28482]/30',
    dot: 'bg-[#F28482]',
  },
};

const statusStyles = {
  Tersedia: {
    bg: 'bg-[#182622] text-[#81B29A] border-[#81B29A]/30',
    dot: 'bg-[#81B29A]',
  },
  'Sebagian Rusak': {
    bg: 'bg-[#2A231C] text-[#D4A373] border-[#D4A373]/30',
    dot: 'bg-[#D4A373]',
  },
  'Tidak Tersedia': {
    bg: 'bg-[#381A1E] text-[#F28482] border-[#F28482]/30',
    dot: 'bg-[#F28482]',
  },
  Hilang: {
    bg: 'bg-[#1C2024] text-[#9A8C98] border-[#9A8C98]/30',
    dot: 'bg-[#9A8C98]',
  },
  Diarsipkan: {
    bg: 'bg-[#161B18] text-[#8FA294]/70 border-[#8FA294]/20',
    dot: 'bg-[#8FA294]/60',
  },
};

export function KondisiBadge({ kondisi, showDot = true }) {
  const style = kondisiStyles[kondisi] || {
    bg: 'bg-[#182622] text-[#81B29A] border-[#81B29A]/30',
    dot: 'bg-[#81B29A]',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-mono tracking-wide border ${style.bg}`}>
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden />}
      {kondisi}
    </span>
  );
}

export function StatusBadge({ status, showDot = true }) {
  const style = statusStyles[status] || {
    bg: 'bg-[#182622] text-[#81B29A] border-[#81B29A]/30',
    dot: 'bg-[#81B29A]',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded px-2.5 py-0.5 text-[11px] font-mono tracking-wide border ${style.bg}`}>
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden />}
      {status}
    </span>
  );
}
