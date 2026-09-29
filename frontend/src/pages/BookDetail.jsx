import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { KondisiBadge, StatusBadge } from '../components/Badges';
import { showToast } from '../components/Toast';
import CoverImage from '../components/CoverImage';
import { DetailSkeleton } from '../components/Skeleton';

const FIELD_LABELS = {
  judul: 'Judul',
  penulis: 'Penulis',
  isbn: 'ISBN',
  penerbit: 'Penerbit',
  tahunTerbit: 'Tahun terbit',
  kategori: 'Kategori',
  jumlahEksemplar: 'Jumlah eksemplar',
  lokasiRak: 'Lokasi rak',
  kondisi: 'Kondisi',
  status: 'Status',
  deskripsi: 'Deskripsi',
  cover: 'Sampul',
  koleksi: 'Koleksi',
};

function formatWhen(iso) {
  try {
    return new Date(iso).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadState, setLoadState] = useState('loading');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');
    Promise.all([api.getBook(id), api.getBookHistory(id)])
      .then(([b, h]) => {
        if (cancelled) return;
        setBook(b);
        setHistory(Array.isArray(h) ? h : []);
        setLoadState('ok');
      })
      .catch(() => {
        if (cancelled) return;
        setBook(null);
        setHistory([]);
        setLoadState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!confirmDelete) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') setConfirmDelete(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [confirmDelete]);

  async function handleDelete() {
    try {
      await api.deleteBook(id);
      showToast('Buku dihapus dari inventaris');
      navigate('/koleksi');
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  if (loadState === 'loading') {
    return <DetailSkeleton />;
  }

  if (loadState === 'error' || !book) {
    return (
      <div className="elf-folio p-6 space-y-3 max-w-lg">
        <h2 className="font-display text-lg font-semibold text-folio-ink">Buku tidak ditemukan</h2>
        <p className="text-sm text-folio-muted">Entri ini mungkin sudah dihapus, atau server sedang tidak merespons.</p>
        <Link to="/koleksi" className="elf-btn inline-flex">
          Kembali ke koleksi
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/koleksi" className="elf-btn-ghost inline-flex text-sm">
        <i className="fa-solid fa-arrow-left text-nest-gold/80" /> Kembali ke koleksi
      </Link>

      <div className="elf-folio p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="relative inline-block mx-auto md:mx-0">
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-nest-gold/25 to-transparent blur-sm" />
              <CoverImage
                judul={book.judul}
                penulis={book.penulis}
                cover={book.cover}
                alt={book.judul}
                className="relative w-full max-w-[15rem] rounded-2xl shadow-folio border border-folio-line object-cover aspect-[3/4]"
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <KondisiBadge kondisi={book.kondisi} />
              <StatusBadge status={book.status} />
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div>
              <p className="elf-mark text-nest-warm text-sm italic mb-1">{book.kategori}</p>
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-folio-ink leading-tight">
                {book.judul}
              </h1>
              <p className="text-base text-folio-muted mt-2">
                oleh <span className="text-folio-ink font-medium">{book.penulis}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="elf-folio-inset p-4 space-y-2">
                <h2 className="text-xs font-semibold text-folio-ink border-b border-folio-line pb-2">
                  Bibliografi
                </h2>
                <ul className="text-xs space-y-1.5 text-folio-muted">
                  <li>ISBN <span className="text-folio-ink font-medium">{book.isbn}</span></li>
                  <li>Penerbit <span className="text-folio-ink font-medium">{book.penerbit}</span></li>
                  <li>Tahun <span className="text-folio-ink font-medium">{book.tahunTerbit}</span></li>
                </ul>
              </div>
              <div className="elf-folio-inset p-4 space-y-2">
                <h2 className="text-xs font-semibold text-folio-ink border-b border-folio-line pb-2">
                  Inventaris
                </h2>
                <ul className="text-xs space-y-1.5 text-folio-muted">
                  <li>Eksemplar <span className="text-folio-ink font-medium">{book.jumlahEksemplar}</span></li>
                  <li>Rak <span className="text-folio-ink font-medium">{book.lokasiRak}</span></li>
                  <li>Kondisi <span className="text-folio-ink font-medium">{book.kondisi}</span></li>
                  <li>Status <span className="text-folio-ink font-medium">{book.status}</span></li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold text-folio-ink mb-2">Deskripsi</h2>
              <p className="text-sm text-folio-muted leading-relaxed max-w-prose">
                {book.deskripsi || 'Tidak ada deskripsi tambahan untuk buku ini.'}
              </p>
            </div>

            <div className="pt-4 border-t border-folio-line flex flex-col-reverse sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-mist bg-nest-danger/90 hover:bg-nest-danger border border-white/10 min-h-[44px] w-full sm:w-auto"
              >
                <i className="fa-solid fa-trash-can" /> Hapus
              </button>
              <Link to={`/edit/${book.id}`} className="elf-btn w-full sm:w-auto justify-center">
                <i className="fa-solid fa-pen-to-square" /> Edit buku
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="elf-folio p-4 sm:p-6">
        <h2 className="font-display text-base font-semibold text-folio-ink mb-3">Riwayat perubahan</h2>
        {history.length === 0 ? (
          <p className="text-sm text-folio-muted">Belum ada perubahan tercatat untuk judul ini.</p>
        ) : (
          <ol className="space-y-3">
            {history.map((entry) => (
              <li key={entry.id} className="elf-folio-inset p-3 text-xs">
                <p className="font-semibold text-folio-ink">
                  {FIELD_LABELS[entry.field] || entry.field}
                </p>
                <p className="text-folio-muted mt-1">
                  {entry.oldValue ? (
                    <>
                      <span className="line-through opacity-70">{entry.oldValue}</span>
                      {' → '}
                    </>
                  ) : null}
                  <span className="text-folio-ink">{entry.newValue || '—'}</span>
                </p>
                <p className="text-[11px] text-folio-muted mt-1">{formatWhen(entry.createdAt)}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      {confirmDelete && (
        <div className="fixed inset-0 bg-nest-dark/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 safe-bottom">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="elf-folio max-w-md w-full p-5 sm:p-6 text-center space-y-4 rounded-b-none sm:rounded-b-2xl"
          >
            <div className="w-12 h-12 rounded-full bg-nest-danger/15 text-nest-danger flex items-center justify-center mx-auto text-xl">
              <i className="fa-solid fa-triangle-exclamation" />
            </div>
            <div>
              <h3 id="delete-title" className="font-display text-lg font-semibold text-folio-ink">
                Hapus dari arsip?
              </h3>
              <p className="text-xs text-folio-muted mt-2">
                <strong className="text-folio-ink">{book.judul}</strong> akan dihapus permanen dari inventaris.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button type="button" onClick={() => setConfirmDelete(false)} className="elf-btn-ghost text-folio-ink">
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-semibold text-mist bg-nest-danger rounded-xl"
              >
                Hapus permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
