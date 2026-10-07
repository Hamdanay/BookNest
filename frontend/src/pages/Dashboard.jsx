import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { KondisiBadge } from '../components/Badges';
import { CategoryBarChart, RackDonutChart } from '../components/ChartPanel';
import CoverImage from '../components/CoverImage';
import PageHeader from '../components/PageHeader';
import { DashboardSkeleton } from '../components/Skeleton';

function StatCard({ label, value, hint, icon }) {
  return (
    <div className="elf-folio p-3 sm:p-4 flex flex-col justify-between min-h-[6.5rem] sm:min-h-[7.5rem]">
      <div className="flex items-start justify-between gap-2 text-folio-muted mb-3">
        <span className="text-xs font-medium leading-snug">{label}</span>
        <i className={`fa-solid ${icon} text-nest-gold/80 text-base`} />
      </div>
      <div>
        <div className="font-display text-xl sm:text-2xl font-semibold text-folio-ink tabular-nums">{value}</div>
        <p className="text-[11px] text-folio-muted mt-1">{hint}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loadState, setLoadState] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');
    api
      .getDashboard()
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setLoadState('ok');
      })
      .catch(() => {
        if (cancelled) return;
        setData(null);
        setLoadState('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadState === 'loading') {
    return <DashboardSkeleton />;
  }

  if (loadState === 'error' || !data) {
    return (
      <div className="elf-folio p-6 space-y-3 max-w-lg">
        <h2 className="font-display text-lg font-semibold text-folio-ink">Tidak dapat memuat data</h2>
        <p className="text-sm text-folio-muted leading-relaxed">
          {import.meta.env.DEV ? (
            <>
              Pastikan backend BookNest berjalan di{' '}
              <strong className="text-folio-ink">http://localhost:3002</strong>, lalu refresh halaman ini.
            </>
          ) : (
            <>
              API tidak merespons. Cek{' '}
              <a href="/api/health" className="text-nest-gold underline underline-offset-2">
                /api/health
              </a>{' '}
              di tab baru (harus JSON, bukan halaman ini). Jika error 500, lihat log <strong>Functions</strong> di
              dashboard Vercel. Hapus env <code className="text-folio-ink">VITE_API_URL</code> jika masih mengarah ke
              localhost.
            </>
          )}
        </p>
      </div>
    );
  }

  const stats = data.stats || {};
  const byCategory = data.byCategory || {};
  const byRack = data.byRack || {};
  const recent = Array.isArray(data.recent) ? data.recent : [];
  const damaged = Array.isArray(data.damaged) ? data.damaged : [];

  const catLabels = Object.keys(byCategory).filter((k) => byCategory[k] > 0);
  const catData = catLabels.map((k) => Number(byCategory[k]) || 0);
  const rackLabels = Object.keys(byRack);
  const rackData = rackLabels.map((k) => Number(byRack[k]) || 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard inventaris"
        description="Ringkasan koleksi di bawah kanopi — statistik, kategori, dan kondisi fisik buku."
        action={
          <Link to="/tambah" className="elf-btn">
            <i className="fa-solid fa-feather-pointed text-nest-gold" /> Tambah buku
          </Link>
        }
      />
      <div className="elf-divider" />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        <StatCard label="Total judul" value={stats.totalJudul ?? 0} hint="Judul terdaftar" icon="fa-book" />
        <StatCard label="Total eksemplar" value={stats.totalEksemplar ?? 0} hint="Salinan fisik" icon="fa-copy" />
        <StatCard label="Kategori" value={stats.jumlahKategori ?? 0} hint="Klasifikasi" icon="fa-leaf" />
        <StatCard label="Tersedia" value={stats.bukuTersedia ?? 0} hint="Siap dipakai" icon="fa-circle-check" />
        <StatCard label="Rusak" value={stats.bukuRusak ?? 0} hint="Perlu perhatian" icon="fa-book-medical" />
        <StatCard label="Diarsipkan" value={stats.bukuDiarsipkan ?? 0} hint="Tidak aktif" icon="fa-box-archive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="elf-folio p-5 md:p-6">
          <h3 className="font-display text-base font-semibold text-folio-ink mb-4">Judul per kategori</h3>
          <CategoryBarChart labels={catLabels} values={catData} />
        </div>
        <div className="elf-folio p-5 md:p-6">
          <h3 className="font-display text-base font-semibold text-folio-ink mb-4">Eksemplar per rak</h3>
          <RackDonutChart labels={rackLabels} values={rackData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="elf-folio p-5 md:p-6">
          <h3 className="font-display text-base font-semibold text-folio-ink mb-3">Baru ditambahkan</h3>
          {recent.length === 0 ? (
            <p className="text-xs text-folio-muted p-4 text-center">Belum ada koleksi buku.</p>
          ) : (
            <ul className="space-y-1">
              {recent.map((b) => (
                <li key={b.id}>
                  <Link
                    to={`/koleksi/${b.id}`}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-white/40 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CoverImage
                        judul={b.judul}
                        penulis={b.penulis}
                        cover={b.cover}
                        className="w-10 h-14 object-cover rounded-lg shadow-sm ring-1 ring-folio-line"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-folio-ink truncate">{b.judul}</h4>
                        <p className="text-[11px] text-folio-muted truncate">
                          {b.penulis} · <span className="text-nest-warm">{b.kategori}</span>
                        </p>
                      </div>
                    </div>
                    <KondisiBadge kondisi={b.kondisi} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="elf-folio p-5 md:p-6">
          <h3 className="font-display text-base font-semibold text-folio-ink mb-3">Perlu perawatan</h3>
          {damaged.length === 0 ? (
            <p className="text-xs text-folio-muted p-4 text-center">
              <i className="fa-solid fa-seedling text-nest-olive mr-1" />
              Tidak ada buku berkondisi rusak saat ini.
            </p>
          ) : (
            <ul className="space-y-1">
              {damaged.map((b) => (
                <li key={b.id}>
                  <Link
                    to={`/koleksi/${b.id}`}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-white/40 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-nest-danger/10 text-nest-danger flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-book-medical text-sm" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-folio-ink truncate">{b.judul}</h4>
                        <p className="text-[11px] text-folio-muted">
                          {b.lokasiRak} · {b.jumlahEksemplar} eks.
                        </p>
                      </div>
                    </div>
                    <KondisiBadge kondisi={b.kondisi} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
