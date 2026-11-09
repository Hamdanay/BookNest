import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Compass,
  BookOpen,
  FolderTree,
  Archive,
  Plus,
  Activity,
  Menu,
  X,
  RotateCcw,
  Sparkles,
  TreePine,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { api } from '../api/client';
import { showToast } from './Toast';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [totalJudul, setTotalJudul] = useState(0);
  const [allowSeedReset, setAllowSeedReset] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api
      .getDashboard()
      .then((d) => setTotalJudul(d.stats?.totalJudul || 0))
      .catch(() => {});

    api
      .getMeta()
      .then((m) => setAllowSeedReset(Boolean(m.allowSeedReset)))
      .catch(() => setAllowSeedReset(false));
  }, [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  async function handleReset() {
    if (!window.confirm('Reset data koleksi kembali ke bibit awal perpustakaan?')) return;
    try {
      await api.resetSeed();
      showToast('Data telah kembali ke benih awal perpustakaan.', 'info');
      navigate('/');
      window.location.reload();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  const navLinks = [
    {
      to: '/',
      label: 'Sanctuary Kanopi',
      subtitle: 'Overview & Vitalitas',
      icon: Compass,
    },
    {
      to: '/koleksi',
      label: 'The Living Archive',
      subtitle: `${totalJudul > 0 ? `${totalJudul} Judul` : 'Katalog Fisik'}`,
      icon: BookOpen,
      badge: totalJudul > 0 ? totalJudul : null,
    },
    {
      to: '/kategori',
      label: 'Klasifikasi Tajuk',
      subtitle: 'Spesies Taksonomi',
      icon: FolderTree,
    },
    {
      to: '/rak',
      label: 'Pohon & Rak Fisik',
      subtitle: 'Arsitektur Kayu Aras',
      icon: Archive,
    },
    {
      to: '/showcase',
      label: 'System & Docker',
      subtitle: 'Arsitektur & Kode',
      icon: Activity,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0C120F] text-forest-mist font-sans selection:bg-forest-amber/30 selection:text-forest-amber">
      {/* Mobile Top App Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#121915]/95 border-b border-forest-sage/20 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-b from-[#243431] to-[#121915] border border-forest-amber/40 flex items-center justify-center text-forest-amber font-serif font-bold text-sm shadow-debossed">
            BN
          </div>
          <div>
            <span className="font-serif font-bold text-forest-mist text-base tracking-tight block">
              BookNest Sanctuary
            </span>
            <span className="text-[10px] font-mono text-forest-amber flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-forest-amber animate-bio-pulse" />
              Kanopi Online
            </span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl text-forest-sage hover:text-forest-mist hover:bg-forest-moss/30 transition-colors"
          aria-label="Buka Menu Navigasi"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Desktop Handcrafted Carved Wooden Sanctuary Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 border-r border-forest-sage/15 bg-gradient-to-b from-[#141C18]/95 via-[#121815]/90 to-[#0F1412]/95 backdrop-blur-xl p-5 shrink-0 sticky top-0 h-screen justify-between z-30 shadow-2xl">
        {/* Top: Emblem, Title, Status & Quick Action */}
        <div className="space-y-6">
          {/* Sanctuary Brand Header */}
          <NavLink
            to="/"
            className="group flex items-center gap-3.5 p-2 rounded-xl border border-transparent hover:border-forest-amber/25 hover:bg-forest-moss/20 transition-all duration-300"
          >
            <div className="relative h-12 w-12 rounded-xl bg-gradient-to-b from-forest-moss to-forest-bark border border-forest-amber/40 shadow-debossed flex items-center justify-center text-forest-amber font-serif font-bold text-lg group-hover:border-forest-amber group-hover:shadow-bioglow transition-all duration-300 shrink-0">
              <span>BN</span>
              <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-forest-amber border-2 border-[#121915] animate-bio-pulse" />
            </div>
            <div className="min-w-0">
              <div className="font-serif font-bold text-base text-forest-mist group-hover:text-forest-amber transition-colors tracking-tight">
                BookNest
              </div>
              <div className="text-[10px] font-ancient tracking-widest text-forest-amber uppercase">
                Ancient Sanctuary
              </div>
            </div>
          </NavLink>

          {/* Quick Primary Action: Ukir / Tambah Buku */}
          <NavLink
            to="/tambah"
            title="Tambah Entri Koleksi Buku Baru"
            className="sanctuary-btn-amber w-full justify-center py-2.5 shadow-bioglow font-serif tracking-wider"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Ukir / Tambah Buku</span>
          </NavLink>

          {/* Navigation Menu */}
          <nav className="space-y-1.5 pt-2">
            <div className="px-3 pb-2 text-[10px] font-mono tracking-widest text-forest-sage/70 uppercase">
              Navigasi Kanopi
            </div>

            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all duration-300 ${
                      isActive
                        ? 'bg-forest-moss/80 text-forest-amber border border-forest-amber/40 shadow-debossed font-semibold'
                        : 'text-forest-sage hover:text-forest-mist hover:bg-forest-moss/30 border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-all ${
                            isActive
                              ? 'bg-forest-amber/15 border-forest-amber/40 text-forest-amber shadow-bioglow'
                              : 'bg-[#101513] border-forest-sage/20 text-forest-sage group-hover:border-forest-amber/30 group-hover:text-forest-amber'
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0 text-left">
                          <div className="font-serif text-sm truncate text-forest-mist group-hover:text-forest-amber transition-colors">
                            {item.label}
                          </div>
                          <div className="text-[10px] font-mono text-forest-sage/70 truncate">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      {item.badge ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-forest-amber/15 text-forest-amber border border-forest-amber/30">
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight
                          size={14}
                          className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                            isActive ? 'opacity-100 text-forest-amber' : 'text-forest-sage/50'
                          }`}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: Observability, Seed Reset & Sanctuary Telemetry */}
        <div className="space-y-3 pt-4 border-t border-forest-sage/15">
          {/* Micro Telemetry Pill */}
          <div className="p-3 rounded-xl bg-[#0F1512] border border-forest-sage/15 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-forest-sage flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-forest-amber" />
                Sanctuary v2.0
              </span>
              <span className="text-forest-amber text-[10px]">ORGANIC</span>
            </div>

            <div className="text-[10px] text-forest-dew/60 leading-tight">
              Arsitektur terdistribusi terhubung ke Prometheus & Grafana.
            </div>

            {/* Grafana Direct Trigger */}
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#141B18] text-[11px] font-mono text-forest-amber hover:bg-forest-amber/10 border border-forest-amber/30 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Activity size={13} className="animate-pulse" />
                <span>Grafana Monitor</span>
              </div>
              <span className="text-[10px] text-forest-sage">:3000</span>
            </a>
          </div>

          {/* Seed Reset Option */}
          {allowSeedReset && (
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[11px] font-mono text-forest-sage/70 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 transition-colors"
              title="Reset data koleksi ke kondisi bibit awal"
            >
              <RotateCcw size={13} />
              <span>Reset Benih Awal</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-[#0C120F]/95 backdrop-blur-xl flex flex-col justify-between p-6 animate-fade-in">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-forest-sage/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-forest-amber text-[#101513] font-serif font-bold text-lg flex items-center justify-center shadow-bioglow">
                  BN
                </div>
                <div>
                  <span className="font-serif font-bold text-lg text-forest-mist block">
                    BookNest Sanctuary
                  </span>
                  <span className="text-[10px] font-mono text-forest-amber">
                    Ancient Forest Sanctuary
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl text-forest-sage hover:text-forest-mist bg-forest-moss/40"
              >
                <X size={20} />
              </button>
            </div>

            <NavLink
              to="/tambah"
              onClick={() => setMobileOpen(false)}
              className="sanctuary-btn-amber w-full justify-center py-3 text-xs shadow-bioglow font-serif"
            >
              <Plus size={16} />
              <span>Ukir / Tambah Buku</span>
            </NavLink>

            <nav className="space-y-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-serif ${
                        isActive
                          ? 'bg-forest-moss text-forest-amber border border-forest-amber/40 font-bold'
                          : 'text-forest-sage hover:text-forest-mist hover:bg-forest-moss/30'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-forest-amber/20 text-forest-amber">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-forest-sage/20 space-y-3">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-[#141B18] text-xs font-mono text-forest-amber border border-forest-amber/30"
            >
              <div className="flex items-center gap-2">
                <Activity size={15} />
                <span>Monitoring Grafana</span>
              </div>
              <span>:3000</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Sanctuary Sanctuary Space */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0 page-leaf-enter">
        <Outlet />
      </main>
    </div>
  );
}
