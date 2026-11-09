import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  TreePine,
  Layers,
  Sparkles,
  AlertTriangle,
  Leaf,
  Plus,
  ShieldAlert,
  Rotate3D,
  Thermometer,
  Droplets,
  Wind,
  Scroll,
} from 'lucide-react';
import { api } from '../api/client';
import { DEMO_DASHBOARD } from '../lib/demoData';
import AncientPedestal3D from '../components/AncientPedestal3D';
import InteractiveBook3DModal from '../components/InteractiveBook3DModal';
import ForestAmbientBackground from '../components/ForestAmbientBackground';
import CanopyGrowthRings from '../components/CanopyGrowthRings';
import LendingLanterns from '../components/LendingLanterns';
import OrganicVineTracker from '../components/OrganicVineTracker';
import { KondisiBadge } from '../components/Badges';
import PageHeader from '../components/PageHeader';
import { DashboardSkeleton } from '../components/Skeleton';

function ForestStatPill({ label, value, hint, icon: Icon, glow = false }) {
  return (
    <div className="sanctuary-card brass-corner p-4 flex items-center justify-between group transition-all duration-300 hover:-translate-y-0.5">
      <div className="space-y-1 min-w-0">
        <span className="text-[10px] font-mono tracking-wider text-forest-sage uppercase">
          {label}
        </span>
        <div className="text-2xl font-serif font-bold text-forest-mist group-hover:text-forest-amber transition-colors">
          {value}
        </div>
        <p className="text-[11px] text-forest-dew/85 truncate">{hint}</p>
      </div>
      <div
        className={`h-11 w-11 rounded-xl flex items-center justify-center border shrink-0 transition-all duration-300 ${
          glow
            ? 'bg-forest-amber/15 border-forest-amber/40 text-forest-amber shadow-bioglow group-hover:scale-105'
            : 'bg-[#101513] border-forest-sage/20 text-forest-sage group-hover:border-forest-amber/40 group-hover:text-forest-amber'
        }`}
      >
        <Icon size={19} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loadState, setLoadState] = useState('loading');
  const [inspectingBook, setInspectingBook] = useState(null);

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
        setData(DEMO_DASHBOARD);
        setLoadState('demo');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadState === 'loading') {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="sanctuary-card p-8 max-w-lg mx-auto text-center space-y-4">
        <TreePine size={36} className="mx-auto text-forest-sage/60" />
        <h2 className="font-serif text-xl font-bold text-forest-mist">
          Sanctuary Terputus dari Akar
        </h2>
        <p className="text-xs text-forest-sage">
          Pastikan backend BookNest berjalan di port 3002 atau periksa koneksi jaringan.
        </p>
      </div>
    );
  }

  const stats = data.stats || {};
  const byCategory = data.byCategory || {};
  const recent = Array.isArray(data.recent) ? data.recent : [];
  const damaged = Array.isArray(data.damaged) ? data.damaged : [];
  const featuredBook = recent[0] || null;

  return (
    <div data-testid="sanctuary-dashboard" className="relative space-y-8 animate-fade-in">
      {/* Living Forest Ambient Particle & Mist Background */}
      <ForestAmbientBackground />

      {/* Offline Demo Simulation Notice */}
      {loadState === 'demo' && (
        <div className="p-3.5 rounded-xl bg-forest-amber/10 border border-forest-amber/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-forest-mist backdrop-blur-md shadow-bioglow">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-forest-amber animate-bio-pulse shrink-0" />
            <span>
              <strong className="text-forest-amber">Mode Pratinjau Kanopi:</strong> Backend belum aktif di port 3002. Sistem menampilkan data simulasi agar seluruh efek 3D, background gerak, dan kartu dapat dinikmati.
            </span>
          </div>
          <button
            onClick={() => {
              setLoadState('loading');
              api
                .getDashboard()
                .then((d) => {
                  setData(d);
                  setLoadState('ok');
                })
                .catch(() => {
                  setData(DEMO_DASHBOARD);
                  setLoadState('demo');
                });
            }}
            className="sanctuary-btn-secondary text-[11px] py-1 px-3 shrink-0 self-start sm:self-auto"
          >
            Hubungkan Ulang
          </button>
        </div>
      )}

      {/* Editorial Header */}
      <PageHeader
        badge="SANCTUARY OF THE LIVING ARCHIVE"
        title="Sanctuary Kanopi & Inventaris"
        description="Pusat konservasi bibliografi purba di bawah kanopi lumut. Menjaga integritas eksemplar fisik, sirkulasi lentera, dan pertumbuhan cincin perpustakaan."
        action={
          <div className="flex items-center gap-2">
            {featuredBook && (
              <button
                onClick={() => setInspectingBook(featuredBook)}
                className="sanctuary-btn-secondary"
                title="Buka Model 3D Interaktif"
              >
                <Rotate3D size={15} />
                <span>Inspeksi 3D</span>
              </button>
            )}
            <Link to="/tambah" className="sanctuary-btn-amber" title="Tambah Koleksi Buku Baru">
              <Plus size={16} />
              <span>Ukir / Tambah Buku</span>
            </Link>
          </div>
        }
      />

      {/* 3D WebGL Hero: Ancient Moss-Covered Tree Stump Pedestal with Gilded Book */}
      <AncientPedestal3D
        featuredBook={featuredBook}
        onInspect={(b) => setInspectingBook(b)}
      />

      {/* Quick Canopy Vital Statistics with Brass Filigree Corners */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <ForestStatPill
          label="Pohon Judul"
          value={stats.totalJudul ?? 0}
          hint="Entri bibliografi"
          icon={TreePine}
          glow={true}
        />
        <ForestStatPill
          label="Eksemplar"
          value={stats.totalEksemplar ?? 0}
          hint="Fisik di rak kayu"
          icon={Layers}
        />
        <ForestStatPill
          label="Klasifikasi"
          value={stats.jumlahKategori ?? 0}
          hint="Spesies kategori"
          icon={Leaf}
        />
        <ForestStatPill
          label="Siap Edar"
          value={stats.bukuTersedia ?? 0}
          hint="Kondisi prima"
          icon={Sparkles}
          glow={true}
        />
        <ForestStatPill
          label="Perlu Rawat"
          value={stats.bukuRusak ?? 0}
          hint="Daun jilid rapuh"
          icon={AlertTriangle}
        />
        <ForestStatPill
          label="Diarsipkan"
          value={stats.bukuDiarsipkan ?? 0}
          hint="Penyimpanan hening"
          icon={Compass}
        />
      </div>

      {/* Organic Vine Growth Progress Tracker */}
      <OrganicVineTracker
        totalCopies={stats.totalEksemplar || 48}
        availableCopies={stats.bukuTersedia || 38}
      />

      {/* Atmospheric Microclimate & Paper Preservation Overview */}
      <div className="sanctuary-card brass-corner p-5 border-forest-sage/20 bg-gradient-to-r from-[#141C18]/90 via-[#18231E]/80 to-[#121915]/90">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-forest-amber text-[10px] font-mono uppercase tracking-widest">
              <Scroll size={13} />
              <span>Mikroiklim Konservasi Lembaran Purba</span>
            </div>
            <h3 className="font-serif font-bold text-base text-forest-mist">
              Kondisi Atmosfer Ruang Baca Kanopi
            </h3>
            <p className="text-xs text-forest-sage max-w-xl">
              Sensor mikroklimat ruang preservasi aktif memastikan kelembaban dan sirkulasi udara optimal untuk mencegah peluruhan serat kertas bebas asam.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="p-2.5 rounded-lg bg-[#0E1412] border border-forest-sage/15 text-center">
              <div className="flex items-center justify-center gap-1 text-forest-amber mb-0.5">
                <Thermometer size={13} />
                <span className="font-mono text-xs font-bold">20.4°C</span>
              </div>
              <span className="text-[11px] font-mono text-forest-sage">Suhu Ruang</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0E1412] border border-forest-sage/15 text-center">
              <div className="flex items-center justify-center gap-1 text-forest-dew mb-0.5">
                <Droplets size={13} />
                <span className="font-mono text-xs font-bold">52% RH</span>
              </div>
              <span className="text-[11px] font-mono text-forest-sage">Kelembaban</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0E1412] border border-forest-sage/15 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
                <Wind size={13} />
                <span className="font-mono text-xs font-bold">Optimal</span>
              </div>
              <span className="text-[11px] font-mono text-forest-sage">Sirkulasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics: Tree Growth Rings & Circulation Lanterns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <CanopyGrowthRings
            byCategory={byCategory}
            totalBooks={stats.totalJudul}
            totalCopies={stats.totalEksemplar}
          />
        </div>
        <div className="lg:col-span-6">
          <LendingLanterns recentBooks={recent} />
        </div>
      </div>

      {/* Fragile Volumes & Repair Sanctuary */}
      {damaged.length > 0 && (
        <div className="sanctuary-card brass-corner p-6 space-y-4 border-forest-amber/25 bg-[#141C18]/80">
          <div className="flex items-center justify-between pb-3 border-b border-forest-sage/15">
            <div className="flex items-center gap-2.5 text-forest-amber">
              <ShieldAlert size={19} />
              <h3 className="font-serif font-bold text-base text-forest-mist">
                Konservasi & Pemulihan Fisik Buku ({damaged.length})
              </h3>
            </div>
            <span className="text-[11px] font-mono text-forest-sage">
              Prioritas Kurator
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {damaged.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-xl bg-[#101513]/85 border border-forest-sage/20 hover:border-forest-amber/40 transition-all flex items-center justify-between group"
              >
                <Link
                  to={`/koleksi/${b.id}`}
                  className="min-w-0 pr-2 flex-1"
                >
                  <h4 className="font-serif font-bold text-sm text-forest-mist group-hover:text-forest-amber truncate">
                    {b.judul}
                  </h4>
                  <p className="text-[11px] font-mono text-forest-sage mt-0.5">
                    {b.lokasiRak} • {b.jumlahEksemplar} eks.
                  </p>
                </Link>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setInspectingBook(b)}
                    className="p-1.5 rounded-lg bg-forest-moss/60 hover:bg-forest-amber/20 text-forest-sage hover:text-forest-amber border border-forest-sage/20 hover:border-forest-amber/40 transition-colors"
                    title="Inspeksi Jilid Fisik 3D"
                  >
                    <Rotate3D size={14} />
                  </button>
                  <KondisiBadge kondisi={b.kondisi} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive 3D Book Orbit & Inspection Modal */}
      {inspectingBook && (
        <InteractiveBook3DModal
          book={inspectingBook}
          onClose={() => setInspectingBook(null)}
        />
      )}
    </div>
  );
}
