import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { KondisiBadge, StatusBadge } from '../components/Badges';
import PageHeader from '../components/PageHeader';
import CoverImage from '../components/CoverImage';
import { FolioSkeleton } from '../components/Skeleton';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

const KONDISI_OPTS = ['', 'Baik', 'Cukup Baik', 'Rusak Ringan', 'Rusak Berat'];
const STATUS_OPTS = ['', 'Tersedia', 'Sebagian Rusak', 'Tidak Tersedia', 'Hilang', 'Diarsipkan'];
const PAGE_SIZE = 8;

export default function Collection() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    kategori: '',
    kondisi: '',
    status: '',
    sort: 'judul-asc',
  });
  const search = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => setCategories([]));
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
        setBooks([]);
        setTotal(0);
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
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Koleksi buku"
        description="Kelola seluruh inventaris — cari, filter, dan telusuri setiap judul di arsip."
        action={
          <Link to="/tambah" className="elf-btn">
            <i className="fa-solid fa-feather-pointed text-nest-gold" /> Tambah buku
          </Link>
        }
      />
      <div className="elf-divider" />

      <div className="elf-folio p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:flex xl:flex-wrap gap-3">
        <input
          type="search"
          placeholder="Cari judul, penulis, ISBN, atau penerbit..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="elf-input sm:col-span-2 lg:flex-1 lg:min-w-[200px]"
        />
        <select
          value={filters.kategori}
          onChange={(e) => setFilters((f) => ({ ...f, kategori: e.target.value }))}
          className="elf-input w-full"
        >
          <option value="">Semua kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <select
          value={filters.kondisi}
          onChange={(e) => setFilters((f) => ({ ...f, kondisi: e.target.value }))}
          className="elf-input w-full"
        >
          {KONDISI_OPTS.map((k) => (
            <option key={k || 'all'} value={k}>{k || 'Semua kondisi'}</option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="elf-input w-full"
        >
          {STATUS_OPTS.map((s) => (
            <option key={s || 'all'} value={s}>{s || 'Semua status'}</option>
          ))}
        </select>
        <select
          value={filters.sort}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
          className="elf-input w-full sm:col-span-2 lg:w-auto lg:min-w-[160px]"
        >
          <option value="judul-asc">Judul A–Z</option>
          <option value="judul-desc">Judul Z–A</option>
          <option value="tahun-desc">Tahun terbaru</option>
          <option value="tahun-asc">Tahun terlama</option>
        </select>
        <button
          type="button"
          onClick={resetFilters}
          className="elf-btn-ghost text-folio-ink border-folio-line w-full sm:col-span-2 lg:w-auto min-h-[44px] justify-center"
        >
          Reset filter
        </button>
      </div>

      <p className="text-xs text-mist-dim pl-1" aria-live="polite">
        {loading ? 'Memuat koleksi...' : `Menampilkan ${from}–${to} dari ${total} judul`}
      </p>

      {loading ? (
        <div className="space-y-3">
          <FolioSkeleton />
          <FolioSkeleton className="hidden lg:block" />
        </div>
      ) : (
        <>
          <div className="lg:hidden space-y-3">
            {books.length === 0 ? (
              <div className="elf-folio p-8 text-center text-folio-muted text-sm">
                Tidak ada data yang sesuai dengan pencarian atau filter.
              </div>
            ) : (
              books.map((b) => (
                <article key={b.id} className="elf-folio p-4 flex gap-3">
                  <CoverImage
                    judul={b.judul}
                    penulis={b.penulis}
                    cover={b.cover}
                    className="w-14 h-[4.5rem] object-cover rounded-lg ring-1 ring-folio-line flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/koleksi/${b.id}`}
                      className="font-display font-semibold text-folio-ink text-base leading-snug hover:text-nest-warm block break-words"
                    >
                      {b.judul}
                    </Link>
                    <p className="text-xs text-folio-muted mt-0.5 truncate">{b.penulis}</p>
                    <p className="text-[11px] text-folio-muted truncate">ISBN {b.isbn}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2 items-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] border border-folio-line bg-white/40">
                        {b.kategori}
                      </span>
                      <span className="text-[11px] text-folio-muted">{b.lokasiRak}</span>
                      <span className="text-[11px] font-semibold tabular-nums">{b.jumlahEksemplar} eks.</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <KondisiBadge kondisi={b.kondisi} />
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Link to={`/koleksi/${b.id}`} className="elf-btn text-xs py-2 px-3 flex-1 min-h-[40px]">
                        Detail
                      </Link>
                      <Link
                        to={`/edit/${b.id}`}
                        className="elf-btn-ghost text-folio-ink flex-1 justify-center min-h-[40px] border border-folio-line"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="elf-folio overflow-hidden p-0 hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="elf-table-head">
                    <th className="p-3.5 font-medium">Judul</th>
                    <th className="p-3.5 font-medium">Penulis</th>
                    <th className="p-3.5 font-medium">Kategori</th>
                    <th className="p-3.5 text-center font-medium">Eksemplar</th>
                    <th className="p-3.5 font-medium">Lokasi</th>
                    <th className="p-3.5 font-medium">Kondisi</th>
                    <th className="p-3.5 font-medium">Status</th>
                    <th className="p-3.5 text-center font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm bg-white/20">
                  {books.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-10 text-center text-folio-muted">
                        Tidak ada data yang sesuai dengan pencarian atau filter.
                      </td>
                    </tr>
                  ) : (
                    books.map((b) => (
                      <tr key={b.id} className="border-t border-folio-line/80 hover:bg-white/35 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <CoverImage
                              judul={b.judul}
                              penulis={b.penulis}
                              cover={b.cover}
                              className="w-9 h-12 object-cover rounded-lg ring-1 ring-folio-line flex-shrink-0"
                            />
                            <div>
                              <Link
                                to={`/koleksi/${b.id}`}
                                className="font-semibold text-folio-ink hover:text-nest-warm transition-colors block"
                              >
                                {b.judul}
                              </Link>
                              <span className="text-[11px] text-folio-muted">ISBN {b.isbn}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-folio-ink">{b.penulis}</td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full text-xs border border-folio-line bg-white/40 text-folio-ink">
                            {b.kategori}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-semibold tabular-nums">{b.jumlahEksemplar}</td>
                        <td className="p-3.5 text-folio-muted">{b.lokasiRak}</td>
                        <td className="p-3.5"><KondisiBadge kondisi={b.kondisi} /></td>
                        <td className="p-3.5"><StatusBadge status={b.status} /></td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Link
                              to={`/koleksi/${b.id}`}
                              className="p-2 rounded-lg text-folio-muted hover:text-folio-ink hover:bg-white/50 min-w-[40px] min-h-[40px] flex items-center justify-center"
                              title="Detail"
                            >
                              <i className="fa-solid fa-eye" />
                            </Link>
                            <Link
                              to={`/edit/${b.id}`}
                              className="p-2 rounded-lg text-folio-muted hover:text-nest-gold hover:bg-white/50 min-w-[40px] min-h-[40px] flex items-center justify-center"
                              title="Edit"
                            >
                              <i className="fa-solid fa-pen-to-square" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {pageCount > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="elf-btn-ghost text-mist min-h-[44px] disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span className="text-xs text-mist-dim px-2">
                Halaman {page} / {pageCount}
              </span>
              <button
                type="button"
                disabled={page >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className="elf-btn-ghost text-mist min-h-[44px] disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
