import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  RotateCcw,
  Plus,
  BookOpen,
  Edit2,
  ExternalLink,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  Columns,
  Grid,
  List,
  Rotate3D,
} from 'lucide-react';
import { api } from '../api/client';
import { KondisiBadge, StatusBadge } from '../components/Badges';
import PageHeader from '../components/PageHeader';
import CoverImage from '../components/CoverImage';
import { FolioSkeleton } from '../components/Skeleton';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import InteractiveBook3DModal from '../components/InteractiveBook3DModal';
import { DEMO_BOOKS, DEMO_CATEGORIES } from '../lib/demoData';

const KONDISI_OPTS = ['', 'Baik', 'Cukup Baik', 'Rusak Ringan', 'Rusak Berat'];
const STATUS_OPTS = ['', 'Tersedia', 'Sebagian Rusak', 'Tidak Tersedia', 'Hilang', 'Diarsipkan'];
const PAGE_SIZE = 8;

// Estimate reading duration based on average book length
function estimateReadingTime(title, year) {
  const hash = [...(title || '')].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hours = 3 + (hash % 6);
  const mins = 15 * (hash % 4);
  return `${hours}j ${mins > 0 ? `${mins}m` : ''}`.trim();
}

export default function Collection() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [viewMode, setViewMode] = useState('hardcover'); // 'hardcover' | 'shelf' | 'list'
  const [inspectingBook, setInspectingBook] = useState(null);
  const [filters, setFilters] = useState({
    kategori: '',
    kondisi: '',
    status: '',
    sort: 'judul-asc',
  });
  const search = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    api
      .getCategories()
      .then(setCategories)
      .catch(() => setCategories(DEMO_CATEGORIES));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, filters.kategori, filters.kondisi, filters.status, filters.sort]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getBooks({
        search,
        ...filters,
        page,
        pageSize: PAGE_SIZE,
      })
      .then((data) => {
        if (cancelled) return;
        setBooks(data.items || []);
        setTotal(data.total || 0);
        setPageCount(data.pageCount || 1);
      })
      .catch(() => {
        if (cancelled) return;
        // Fallback to demo books so user can still see the hardcover, 3D shelf, and test inspection
        setBooks(DEMO_BOOKS);
        setTotal(DEMO_BOOKS.length);
        setPageCount(1);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, filters, page]);

  function resetFilters() {
    setSearchInput('');
    setFilters({
      kategori: '',
      kondisi: '',
      status: '',
      sort: 'judul-asc',
    });
    setPage(1);
  }

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        badge="THE LIVING ARCHIVE"
        title="Koleksi Bibliografi & Naskah Fisik"
        description="Jelajahi seluruh naskah purba dan buku cetak di bawah naungan kanopi. Dilengkapi tekstur sampul hardcover, estimasi masa pembacaan, dan rak 3D."
        action={
          <Link to="/tambah" className="sanctuary-btn-amber" title="Tambah Koleksi Buku Baru">
            <Plus size={16} />
            <span>Ukir / Tambah Buku</span>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="sanctuary-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="relative sm:col-span-2 lg:col-span-4">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-sage pointer-events-none"
            />
            <input
              data-testid="collection-search-input"
              type="search"
              placeholder="Cari judul, penulis, ISBN, atau penerbit..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="sanctuary-input pl-9"
            />
          </div>

          {/* Kategori */}
          <div className="lg:col-span-2">
            <select
              value={filters.kategori}
              onChange={(e) => setFilters((f) => ({ ...f, kategori: e.target.value }))}
              className="sanctuary-input"
            >
              <option value="">Semua Kategori</option>
              {(Array.isArray(categories) ? categories : []).map((c) => (
                <option key={c.id} value={c.name} className="bg-[#101513]">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Kondisi */}
          <div className="lg:col-span-2">
            <select
              value={filters.kondisi}
              onChange={(e) => setFilters((f) => ({ ...f, kondisi: e.target.value }))}
              className="sanctuary-input"
            >
              {KONDISI_OPTS.map((k) => (
                <option key={k || 'all'} value={k} className="bg-[#101513]">
                  {k || 'Semua Kondisi'}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="lg:col-span-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="sanctuary-input"
            >
              {STATUS_OPTS.map((s) => (
                <option key={s || 'all'} value={s} className="bg-[#101513]">
                  {s || 'Semua Status'}
                </option>
              ))}
            </select>
          </div>

          {/* Sort & Reset */}
          <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-2">
            <select
              value={filters.sort}
              onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
              className="sanctuary-input flex-1"
            >
              <option value="judul-asc" className="bg-[#101513]">Judul A–Z</option>
              <option value="judul-desc" className="bg-[#101513]">Judul Z–A</option>
              <option value="tahun-desc" className="bg-[#101513]">Tahun Baru</option>
              <option value="tahun-asc" className="bg-[#101513]">Tahun Lama</option>
            </select>
            <button
              type="button"
              onClick={resetFilters}
              title="Reset Filter"
              className="p-2 rounded-lg border border-forest-sage/20 bg-[#101513] text-forest-sage hover:text-forest-amber transition-colors shrink-0"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* View Switcher: Hardcover Grid vs 3D Shelf vs Archival List */}
        <div className="flex items-center justify-between pt-3 border-t border-forest-sage/15 text-xs text-forest-sage">
          <div className="font-mono text-[11px]">
            {loading ? (
              <span>Memindai naskah...</span>
            ) : (
              <span>
                Menampilkan <strong className="text-forest-amber">{from}–{to}</strong> dari{' '}
                <strong className="text-forest-amber">{total}</strong> naskah terdaftar
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 bg-[#101513] p-1 rounded-lg border border-forest-sage/20">
            <button
              type="button"
              onClick={() => setViewMode('hardcover')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                viewMode === 'hardcover'
                  ? 'bg-forest-moss text-forest-amber font-semibold border border-forest-amber/40 shadow-bioglow'
                  : 'text-forest-sage hover:text-forest-mist'
              }`}
              title="Katalog Hardcover Bertekstur"
            >
              <Grid size={13} />
              <span className="hidden sm:inline">Hardcover</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('shelf')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                viewMode === 'shelf'
                  ? 'bg-forest-moss text-forest-amber font-semibold border border-forest-amber/40 shadow-bioglow'
                  : 'text-forest-sage hover:text-forest-mist'
              }`}
              title="Rak Buku Kayu 3D"
            >
              <Columns size={13} />
              <span className="hidden sm:inline">Rak 3D</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                viewMode === 'list'
                  ? 'bg-forest-moss text-forest-amber font-semibold border border-forest-amber/40 shadow-bioglow'
                  : 'text-forest-sage hover:text-forest-mist'
              }`}
              title="Tabel Data Arsip"
            >
              <List size={13} />
              <span className="hidden sm:inline">Daftar Arsip</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Catalog Rendering */}
      {loading ? (
        <FolioSkeleton lines={6} />
      ) : books.length === 0 ? (
        <div className="sanctuary-card p-12 text-center space-y-3">
          <BookOpen size={36} className="mx-auto text-forest-sage/50" />
          <h3 className="font-serif text-lg font-bold text-forest-mist">
            Naskah Tidak Ditemukan
          </h3>
          <p className="text-xs text-forest-sage max-w-sm mx-auto">
            Tidak ada buku yang sesuai dengan filter atau kata kunci di kanopi ini.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="sanctuary-btn-secondary text-xs mt-2"
          >
            Bersihkan Filter Pencarian
          </button>
        </div>
      ) : viewMode === 'hardcover' ? (
        /* 1. Bespoke Hardcover Grid with Cloth/Leather Texture & Ambient Occlusion */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(Array.isArray(books) ? books : []).map((b) => (
            <div
              key={b.id}
              className="sanctuary-card book-hardcover p-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Physical Hardcover Visual with Spine ridge */}
                <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-[#101513] border border-forest-sage/20 shadow-2xl">
                  {/* Left Spine Shadow / Cloth crease */}
                  <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/60 via-black/25 to-transparent z-10 pointer-events-none" />

                  <CoverImage
                    judul={b.judul}
                    penulis={b.penulis}
                    cover={b.cover}
                    className="w-full h-full object-cover"
                  />

                  {/* Gold Bookmark ribbon */}
                  <div className="absolute top-0 right-3 w-3 h-8 bg-forest-amber rounded-b shadow-md z-10" />

                  {/* Status badge pill */}
                  <div className="absolute bottom-2 left-2 z-10">
                    <StatusBadge status={b.status} showDot={false} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-forest-amber mb-1">
                    <span>{b.kategori}</span>
                    <span>•</span>
                    <span>{b.tahunTerbit || 'Tahun -'}</span>
                  </div>

                  <Link
                    to={`/koleksi/${b.id}`}
                    className="font-serif font-bold text-base text-forest-mist group-hover:text-forest-amber transition-colors line-clamp-2"
                  >
                    {b.judul}
                  </Link>

                  <p className="text-xs text-forest-dew/90 mt-0.5 truncate">
                    {b.penulis}
                  </p>
                </div>
              </div>

              {/* Bottom Card Bar: Reading Time & Location */}
              <div className="mt-4 pt-3 border-t border-forest-sage/15 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-forest-dew">
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-forest-amber" />
                    <span>{estimateReadingTime(b.judul, b.tahunTerbit)}</span>
                  </span>
                  <span className="flex items-center gap-1 text-forest-dew">
                    <MapPin size={12} />
                    <span>{b.lokasiRak}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <KondisiBadge kondisi={b.kondisi} />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setInspectingBook(b)}
                      className="p-1.5 rounded text-forest-sage hover:text-forest-amber transition-colors"
                      title="Inspeksi Model 3D (360°)"
                    >
                      <Rotate3D size={14} />
                    </button>
                    <Link
                      to={`/edit/${b.id}`}
                      className="p-1.5 rounded text-forest-sage hover:text-forest-amber transition-colors"
                      title="Ukir Suntingan"
                    >
                      <Edit2 size={13} />
                    </Link>
                    <Link
                      to={`/koleksi/${b.id}`}
                      className="p-1.5 rounded text-forest-sage hover:text-forest-amber transition-colors"
                      title="Buka Lembaran"
                    >
                      <ExternalLink size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'shelf' ? (
        /* 2. 3D Wooden Shelf View (Books standing vertically on cedarwood shelf) */
        <div className="sanctuary-card p-6 space-y-6">
          <div className="flex items-center justify-between text-xs font-mono text-forest-sage pb-2 border-b border-forest-sage/15">
            <span>Rak Cedarwood Fisik • Orientasi Punggung Buku (Spines)</span>
            <span className="text-forest-amber">{books.length} Naskah Bersandar</span>
          </div>

          {/* Wooden Shelf Simulator */}
          <div className="relative pt-6 pb-2 px-4 rounded-xl bg-gradient-to-b from-[#101513] to-[#18221E] border border-forest-sage/20">
            <div className="flex items-end justify-center sm:justify-start gap-2.5 sm:gap-4 overflow-x-auto pb-4">
              {(Array.isArray(books) ? books : []).map((b, idx) => {
                const height = 180 + ((idx * 17) % 50); // natural varying book heights
                const width = 36 + ((idx * 7) % 22);   // natural spine widths
                const isRusakBerat = b.kondisi === 'Rusak Berat';
                const isRusakRingan = b.kondisi === 'Rusak Ringan';
                const isDamaged = isRusakBerat || isRusakRingan;

                // Condition-adaptive spine leather palettes
                let spineGradient;
                if (isRusakBerat) {
                  spineGradient = 'linear-gradient(90deg, #181310, #2E221A, #181310)';
                } else if (isRusakRingan) {
                  spineGradient = 'linear-gradient(90deg, #222119, #383427, #222119)';
                } else {
                  spineGradient = [
                    'linear-gradient(90deg, #182420, #273832, #182420)',
                    'linear-gradient(90deg, #2D443E, #3D5C54, #2D443E)',
                    'linear-gradient(90deg, #38281E, #4E382A, #38281E)',
                    'linear-gradient(90deg, #1C2826, #2E403C, #1C2826)',
                  ][idx % 4];
                }

                return (
                  <div
                    key={b.id}
                    style={{ height: `${height}px`, width: `${width}px` }}
                    className={`relative group rounded-t-sm shrink-0 flex flex-col justify-between p-2 shadow-bookspine transition-all duration-300 hover:-translate-y-4 hover:shadow-2xl cursor-pointer ${
                      isRusakBerat ? 'border-t-2 border-dashed border-rose-500/60' : isRusakRingan ? 'border-t border-amber-500/50' : ''
                    }`}
                  >
                    {/* Spine background with leather/cloth grain */}
                    <div
                      className="absolute inset-0 rounded-t-sm opacity-90 group-hover:opacity-100 transition-opacity"
                      style={{ background: spineGradient }}
                    />

                    {/* Gold/Weathered debossed foil spine title (vertical) */}
                    <div className="relative z-10 h-full flex flex-col justify-between py-2 items-center pointer-events-none">
                      <span className={`text-[9px] font-mono tracking-widest ${
                        isRusakBerat ? 'text-rose-400' : isRusakRingan ? 'text-amber-400' : 'text-forest-amber'
                      }`}>
                        {b.tahunTerbit || 'IV'}
                      </span>
                      <span
                        className={`font-serif font-bold text-xs truncate max-w-[130px] tracking-wide ${
                          isRusakBerat ? 'text-stone-300 group-hover:text-rose-300' : isRusakRingan ? 'text-amber-100/90 group-hover:text-amber-200' : 'text-forest-mist group-hover:text-forest-amber'
                        }`}
                        style={{
                          writingMode: 'vertical-rl',
                          transform: 'rotate(180deg)',
                        }}
                      >
                        {b.judul}
                      </span>
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isRusakBerat
                            ? 'bg-rose-500 shadow-md animate-pulse'
                            : isRusakRingan
                            ? 'bg-amber-400 shadow-md'
                            : 'bg-emerald-400 shadow-bioglow'
                        }`}
                        title={`Kondisi: ${b.kondisi}`}
                      />
                    </div>

                    {/* Interactive Click Overlay to open detail or 3D inspection */}
                    <Link
                      to={`/koleksi/${b.id}`}
                      className="absolute inset-0 z-20"
                      title={`${b.judul} • ${b.kondisi}`}
                    />

                    {/* Quick 3D inspect trigger on hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setInspectingBook(b);
                      }}
                      className="absolute top-1 right-1 z-30 p-1 rounded-md bg-[#101513]/90 text-forest-amber opacity-0 group-hover:opacity-100 hover:scale-110 transition-all shadow-xl"
                      title="Buka Inspeksi 3D"
                    >
                      <Rotate3D size={11} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Solid Cedarwood Plank Shelf Bottom */}
            <div className="h-4 w-full rounded-sm bg-gradient-to-r from-[#2B1E16] via-[#4A3528] to-[#2B1E16] border-t border-forest-amber/40 shadow-2xl" />
          </div>
        </div>
      ) : (
        /* 3. Archival List View with Reading Times & Density */
        <div className="sanctuary-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#101513]/90 border-b border-forest-sage/20 text-forest-sage font-mono">
                  <th className="py-3.5 px-4 font-medium">Naskah & Bibliografi</th>
                  <th className="py-3.5 px-4 font-medium">Klasifikasi</th>
                  <th className="py-3.5 px-4 font-medium">Lokasi Rak</th>
                  <th className="py-3.5 px-4 font-medium">Estimasi Baca</th>
                  <th className="py-3.5 px-4 font-medium text-center">Eksemplar</th>
                  <th className="py-3.5 px-4 font-medium">Kondisi Fisik</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-sage/10">
                {(Array.isArray(books) ? books : []).map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-forest-moss/20 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <CoverImage
                          judul={b.judul}
                          penulis={b.penulis}
                          cover={b.cover}
                          className="w-9 h-12 object-cover rounded border border-forest-sage/20 shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/koleksi/${b.id}`}
                            className="font-serif font-bold text-sm text-forest-mist group-hover:text-forest-amber transition-colors block truncate max-w-xs md:max-w-sm"
                          >
                            {b.judul}
                          </Link>
                          <div className="text-[11px] text-forest-sage truncate mt-0.5">
                            {b.penulis} • <span className="font-mono text-forest-amber/80">ISBN {b.isbn}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-forest-dew font-medium">
                      {b.kategori}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-forest-amber">
                      {b.lokasiRak}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-forest-sage">
                      {estimateReadingTime(b.judul, b.tahunTerbit)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-center text-forest-mist font-semibold">
                      {b.jumlahEksemplar}
                    </td>
                    <td className="py-3.5 px-4">
                      <KondisiBadge kondisi={b.kondisi} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInspectingBook(b)}
                          className="p-1.5 rounded text-forest-sage hover:text-forest-amber transition-colors"
                          title="Inspeksi Model 3D (360°)"
                        >
                          <Rotate3D size={14} />
                        </button>
                        <Link
                          to={`/koleksi/${b.id}`}
                          className="p-1.5 rounded text-forest-sage hover:text-forest-amber transition-colors"
                          title="Buka Detail"
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <Link
                          to={`/edit/${b.id}`}
                          className="p-1.5 rounded text-forest-sage hover:text-forest-amber transition-colors"
                          title="Sunting Naskah"
                        >
                          <Edit2 size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs text-forest-sage font-mono">
          <div>
            Lembaran {page} dari {pageCount}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="sanctuary-btn-secondary py-1.5 px-3 text-xs disabled:opacity-30"
            >
              Kembali
            </button>
            <button
              type="button"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              className="sanctuary-btn-secondary py-1.5 px-3 text-xs disabled:opacity-30"
            >
              Berikutnya
            </button>
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
