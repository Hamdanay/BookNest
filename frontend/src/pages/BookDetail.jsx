import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Layers,
  Barcode,
  Building,
  History,
  AlertTriangle,
  BookOpen,
  Compass,
  Rotate3D,
} from 'lucide-react';
import { api } from '../api/client';
import { KondisiBadge, StatusBadge } from '../components/Badges';
import { showToast } from '../components/Toast';
import CoverImage from '../components/CoverImage';
import { DetailSkeleton } from '../components/Skeleton';
import InteractiveBook3DModal from '../components/InteractiveBook3DModal';

const FIELD_LABELS = {
  judul: 'Judul Naskah',
  penulis: 'Nama Pengarang',
  isbn: 'Nomor ISBN',
  penerbit: 'Penerbit',
  tahunTerbit: 'Tahun Cetak',
  kategori: 'Klasifikasi',
  jumlahEksemplar: 'Jumlah Eksemplar',
  lokasiRak: 'Lokasi Rak',
  kondisi: 'Kondisi Fisik',
  status: 'Status Ketersediaan',
  deskripsi: 'Deskripsi Naskah',
  cover: 'Sampul Buku',
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
  const [show3DModal, setShow3DModal] = useState(false);

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
    if (!confirmDelete) return;
    function onKey(e) {
      if (e.key === 'Escape') setConfirmDelete(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmDelete]);

  async function handleDelete() {
    try {
      await api.deleteBook(id);
      showToast('Naskah telah dikembalikan ke heningnya arsip (dihapus)');
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
      <div className="sanctuary-card p-10 max-w-lg mx-auto text-center space-y-4">
        <BookOpen size={40} className="mx-auto text-forest-sage/50" />
        <h2 className="font-serif text-xl font-bold text-forest-mist">Naskah Tidak Ditemukan</h2>
        <p className="text-xs text-forest-sage">
          Naskah ini mungkin telah dipindahkan atau koneksi ke akar basis data terputus.
        </p>
        <Link to="/koleksi" className="sanctuary-btn-secondary inline-flex text-xs">
          Kembali ke Sanctuary
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/koleksi"
          className="inline-flex items-center gap-2 text-xs font-mono text-forest-sage hover:text-forest-amber transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke The Living Archive</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <Link to={`/edit/${book.id}`} className="sanctuary-btn-secondary text-xs py-1.5 px-3">
            <Edit2 size={13} />
            <span>Ukir Suntingan</span>
          </Link>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="p-2 rounded-lg border border-rose-500/20 bg-rose-950/30 text-rose-300 hover:bg-rose-900/40 text-xs transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Main Bookbinding Sanctuary Card */}
      <div className="sanctuary-card p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Physical Hardcover Cover Preview */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start space-y-4">
            <div className="relative w-full max-w-[15rem] aspect-[3/4] rounded-xl overflow-hidden bg-[#101513] border border-forest-sage/30 shadow-2xl book-hardcover">
              {/* Spine crease shadow */}
              <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-gradient-to-r from-black/70 via-black/20 to-transparent z-10 pointer-events-none" />

              <CoverImage
                judul={book.judul}
                penulis={book.penulis}
                cover={book.cover}
                alt={book.judul}
                className="w-full h-full object-cover"
              />

              {/* Gold bookmark ribbon */}
              <div className="absolute top-0 right-4 w-3.5 h-10 bg-forest-amber rounded-b shadow-lg z-10" />
            </div>

            <div className="flex items-center gap-2">
              <KondisiBadge kondisi={book.kondisi} />
              <StatusBadge status={book.status} />
            </div>

            <button
              type="button"
              onClick={() => setShow3DModal(true)}
              className="sanctuary-btn-secondary w-full max-w-[15rem] py-2 text-xs text-forest-amber border-forest-amber/40 hover:bg-forest-amber/15"
            >
              <Rotate3D size={15} />
              <span>Inspeksi 3D (360°)</span>
            </button>
          </div>

          {/* Right Column: Title, Metadata, and Details */}
          <div className="md:col-span-8 space-y-6">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#101513] text-forest-amber font-mono text-[10px] tracking-widest uppercase border border-forest-amber/30 mb-2 shadow-bioglow">
                {book.kategori}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-forest-mist leading-tight">
                {book.judul}
              </h1>
              <p className="text-sm text-forest-sage mt-1 font-serif italic">
                Ditulis oleh <span className="text-forest-mist font-semibold not-italic">{book.penulis}</span>
              </p>
            </div>

            {/* Structured Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {/* Bibliografi Card */}
              <div className="p-4 rounded-xl bg-[#101513]/70 border border-forest-sage/15 space-y-2.5">
                <span className="text-[10px] font-mono tracking-wider text-forest-amber uppercase">
                  Data Bibliografi
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-forest-sage flex items-center gap-1.5 font-mono">
                      <Barcode size={13} className="text-forest-amber" />
                      ISBN
                    </span>
                    <span className="font-mono text-forest-mist">{book.isbn}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-forest-sage flex items-center gap-1.5 font-mono">
                      <Building size={13} className="text-forest-amber" />
                      Penerbit
                    </span>
                    <span className="text-forest-mist">{book.penerbit || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-forest-sage flex items-center gap-1.5 font-mono">
                      <Calendar size={13} className="text-forest-amber" />
                      Tahun Cetak
                    </span>
                    <span className="font-mono text-forest-amber">{book.tahunTerbit || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Inventaris Fisik Card */}
              <div className="p-4 rounded-xl bg-[#101513]/70 border border-forest-sage/15 space-y-2.5">
                <span className="text-[10px] font-mono tracking-wider text-forest-amber uppercase">
                  Fisik & Penempatan
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-forest-sage flex items-center gap-1.5 font-mono">
                      <Layers size={13} className="text-forest-amber" />
                      Eksemplar
                    </span>
                    <span className="font-mono text-forest-mist">{book.jumlahEksemplar} buku fisik</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-forest-sage flex items-center gap-1.5 font-mono">
                      <MapPin size={13} className="text-forest-amber" />
                      Lokasi Rak
                    </span>
                    <span className="font-mono text-forest-amber font-semibold">{book.lokasiRak}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-forest-sage font-mono">Kondisi</span>
                    <span className="text-forest-dew">{book.kondisi}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sinopsis / Deskripsi Naskah */}
            <div className="space-y-2 pt-2 border-t border-forest-sage/15">
              <h3 className="text-[10px] font-mono tracking-wider text-forest-amber uppercase">
                Catatan Naskah & Sinopsis
              </h3>
              <p className="text-xs sm:text-sm text-forest-dew leading-relaxed whitespace-pre-line font-sans">
                {book.deskripsi || 'Belum ada catatan atau ringkasan yang diukir untuk naskah ini.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Trail: Timeline Pohon Perubahan */}
      <div className="sanctuary-card p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-forest-sage/15 text-forest-mist">
          <History size={16} className="text-forest-amber" />
          <h3 className="font-serif font-bold text-base">
            Cincin Riwayat Mutasi Data
          </h3>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-forest-sage py-4 text-center">
            Naskah ini masih murni seperti saat pertama kali didaftarkan.
          </p>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-forest-sage/20">
            {history.map((entry) => (
              <div key={entry.id} className="relative group">
                <div className="absolute -left-[1.8rem] top-1.5 h-2 w-2 rounded-full bg-forest-amber shadow-bioglow" />
                <div className="p-3.5 rounded-lg bg-[#101513]/70 border border-forest-sage/15 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-serif font-bold text-forest-mist">
                      {FIELD_LABELS[entry.field] || entry.field}
                    </span>
                    <span className="font-mono text-[10px] text-forest-sage">
                      {formatWhen(entry.createdAt)}
                    </span>
                  </div>
                  <div className="text-xs text-forest-sage flex items-center gap-2 pt-1 font-mono">
                    {entry.oldValue ? (
                      <>
                        <span className="line-through text-forest-sage/60">{entry.oldValue}</span>
                        <span className="text-forest-amber">➔</span>
                      </>
                    ) : null}
                    <span className="text-forest-amber font-semibold">{entry.newValue || '-'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-[#101513]/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="sanctuary-card max-w-md w-full p-6 text-center space-y-4 border-rose-500/30 shadow-2xl">
            <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center justify-center mx-auto">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-forest-mist">
                Kembalikan Naskah ke Keheningan?
              </h3>
              <p className="text-xs text-forest-sage mt-2 leading-relaxed">
                Naskah <strong className="text-forest-mist">"{book.judul}"</strong> beserta seluruh eksemplarnya akan dihapus permanen dari basis data sanctuary.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="sanctuary-btn-secondary text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-rose-900/60 text-rose-200 border border-rose-500/30 text-xs font-semibold hover:bg-rose-900"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Interactive 3D Book Orbit & Inspection Modal */}
      {show3DModal && (
        <InteractiveBook3DModal
          book={book}
          onClose={() => setShow3DModal(false)}
        />
      )}
    </div>
  );
}
