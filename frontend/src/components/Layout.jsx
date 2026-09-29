import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import { showToast } from './Toast';

const navClass = ({ isActive }) =>
  `elf-nav-link min-h-[44px] ${isActive ? 'elf-nav-active' : ''}`;

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [totalJudul, setTotalJudul] = useState(0);
  const [allowSeedReset, setAllowSeedReset] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const drawerRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    api.getDashboard().then((d) => setTotalJudul(d.stats.totalJudul)).catch(() => {});
    api.getMeta().then((m) => setAllowSeedReset(Boolean(m.allowSeedReset))).catch(() => setAllowSeedReset(false));
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = '';
      return undefined;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const drawer = drawerRef.current;
    const focusables = drawer?.querySelectorAll(FOCUSABLE);
    const first = focusables?.[0];
    first?.focus();

    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMobileOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !drawer) return;
      const items = [...drawer.querySelectorAll(FOCUSABLE)];
      if (!items.length) return;
      const head = items[0];
      const tail = items[items.length - 1];
      if (e.shiftKey && document.activeElement === head) {
        e.preventDefault();
        tail.focus();
      } else if (!e.shiftKey && document.activeElement === tail) {
        e.preventDefault();
        head.focus();
      }
    }

    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  const wasDrawerOpen = useRef(false);
  useEffect(() => {
    if (mobileOpen) {
      wasDrawerOpen.current = true;
      return;
    }
    if (wasDrawerOpen.current && window.matchMedia('(max-width: 767px)').matches) {
      menuButtonRef.current?.focus();
    }
    wasDrawerOpen.current = false;
  }, [mobileOpen]);

  const refreshBadge = () => {
    api.getDashboard().then((d) => setTotalJudul(d.stats.totalJudul)).catch(() => {});
  };

  async function handleReset() {
    if (!confirm('Reset data koleksi kembali ke sampel awal?')) return;
    try {
      await api.resetSeed();
      showToast('Data telah di-reset ke data sampel.', 'info');
      refreshBadge();
      navigate('/');
      window.location.reload();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col md:flex-row selection:bg-nest-gold/40 selection:text-mist">
      <header className="md:hidden elf-sidebar relative px-4 py-3 flex justify-between items-center sticky top-0 z-30 safe-top shrink-0">
        <div className="flex items-center gap-3 relative z-10 min-w-0">
          <div className="w-10 h-10 rounded-2xl border border-nest-gold/30 flex items-center justify-center bg-nest-secondary/50 text-nest-gold flex-shrink-0">
            <i className="fa-solid fa-tree text-lg" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display font-semibold text-base text-mist leading-none truncate">BookNest</h1>
            <p className="text-[10px] text-mist-dim truncate">Perpustakaan hutan</p>
          </div>
        </div>
        <button
          ref={menuButtonRef}
          type="button"
          className="p-3 text-mist-dim hover:text-mist relative z-10 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka menu"
          aria-expanded={mobileOpen}
          aria-controls="app-sidebar"
        >
          <i className="fa-solid fa-bars text-xl" />
        </button>
      </header>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-nest-dark/75 backdrop-blur-sm z-40 md:hidden"
          aria-label="Tutup menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        id="app-sidebar"
        ref={drawerRef}
        role={mobileOpen ? 'dialog' : undefined}
        aria-modal={mobileOpen ? true : undefined}
        aria-label="Navigasi BookNest"
        className={`elf-sidebar flex flex-col w-[17.5rem] max-w-[85vw] flex-shrink-0 overflow-y-auto md:sticky md:top-0 md:z-40 md:h-screen max-md:fixed max-md:top-0 max-md:left-0 max-md:z-50 max-md:h-[100dvh] max-md:transition-transform max-md:duration-300 ${
          mobileOpen ? 'max-md:flex' : 'max-md:hidden'
        }`}
      >
        <div className="p-5 border-b border-white/5 flex items-center justify-between gap-3 relative z-10 safe-top md:pt-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl border border-nest-gold/35 bg-gradient-to-br from-nest-warm/60 to-nest-secondary flex items-center justify-center text-nest-gold shadow-glow flex-shrink-0">
              <i className="fa-solid fa-book-open text-xl" />
            </div>
            <div className="min-w-0 hidden md:block">
              <h1 className="font-display font-semibold text-xl text-mist tracking-tight">BookNest</h1>
              <p className="text-xs text-mist-faint">Koleksi di bawah kanopi</p>
            </div>
            <div className="min-w-0 md:hidden">
              <h2 className="font-display font-semibold text-lg text-mist">Menu</h2>
            </div>
          </div>
          <button
            type="button"
            className="md:hidden p-2 rounded-xl text-mist-dim hover:text-mist min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup menu"
          >
            <i className="fa-solid fa-xmark text-xl" />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-3 relative z-10">
          <NavLink to="/" end className={navClass} onClick={() => setMobileOpen(false)}>
            <i className="fa-solid fa-moon w-5 text-center text-nest-gold/90 flex-shrink-0" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/koleksi" className={navClass} onClick={() => setMobileOpen(false)}>
            <i className="fa-solid fa-scroll w-5 text-center text-nest-gold/90 flex-shrink-0" />
            <span>Daftar Koleksi</span>
          </NavLink>
          <NavLink to="/tambah" className={navClass} onClick={() => setMobileOpen(false)}>
            <i className="fa-solid fa-feather-pointed w-5 text-center text-nest-gold/90 flex-shrink-0" />
            <span>Tambah Buku</span>
          </NavLink>
          <NavLink to="/kategori" className={navClass} onClick={() => setMobileOpen(false)}>
            <i className="fa-solid fa-leaf w-5 text-center text-nest-gold/90 flex-shrink-0" />
            <span>Kategori</span>
          </NavLink>
          <NavLink to="/rak" className={navClass} onClick={() => setMobileOpen(false)}>
            <i className="fa-solid fa-layer-group w-5 text-center text-nest-gold/90 flex-shrink-0" />
            <span>Rak</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-white/5 relative z-10 text-xs text-mist-faint safe-bottom">
          <div className="flex items-center justify-between mb-2 gap-2">
            <span className="text-nest-gold/90 font-medium">Arsip v1.0</span>
            <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-mist-dim whitespace-nowrap">
              {totalJudul} judul
            </span>
          </div>
          <p className="text-[11px] leading-relaxed opacity-80">
            Inventaris tanpa penjualan atau peminjaman. Alat administrasi lokal.
          </p>
          {allowSeedReset && (
            <button
              type="button"
              onClick={handleReset}
              className="mt-3 text-[11px] text-nest-gold/80 hover:text-nest-gold flex items-center gap-1.5 min-h-[44px]"
            >
              <i className="fa-solid fa-rotate-left" /> Pulihkan data sampel
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 w-full min-w-0 relative z-0 px-3 py-4 sm:px-4 sm:py-6 md:px-10 md:py-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L32 8 L30 16 L28 8 Z' fill='%23c9a962' fill-opacity='0.35'/%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div className="relative z-10 max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
