const kondisiClass = {
  Baik: 'badge-baik',
  'Cukup Baik': 'badge-cukup',
  'Rusak Ringan': 'badge-rusak-ringan',
  'Rusak Berat': 'badge-rusak-berat',
};

const statusClass = {
  Tersedia: 'badge-tersedia',
  'Sebagian Rusak': 'badge-sebagian-rusak',
  'Tidak Tersedia': 'badge-tidak-tersedia',
  Hilang: 'badge-hilang',
  Diarsipkan: 'badge-diarsipkan',
};

export function KondisiBadge({ kondisi }) {
  const cls = kondisiClass[kondisi] || 'badge-baik';
  return (
    <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${cls}`}>{kondisi}</span>
  );
}

export function StatusBadge({ status }) {
  const cls = statusClass[status] || 'badge-tersedia';
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>
      {status}
    </span>
  );
}
