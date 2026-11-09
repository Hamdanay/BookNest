import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Book,
  Barcode,
  Layers,
  Upload,
  CheckCircle2,
  AlertCircle,
  Save,
  Feather,
} from 'lucide-react';
import { api } from '../api/client';
import { showToast } from './Toast';
import PageHeader from './PageHeader';
import CoverImage from './CoverImage';
import { FolioSkeleton } from './Skeleton';
import { validateIsbn } from '../lib/isbn';
import { allowedStatuses, suggestedStatus, validateKondisiStatus } from '../lib/inventory-rules';

const KONDISI = ['Baik', 'Cukup Baik', 'Rusak Ringan', 'Rusak Berat'];
const STATUS = ['Tersedia', 'Sebagian Rusak', 'Tidak Tersedia', 'Hilang', 'Diarsipkan'];
const CUSTOM_RACK = '__custom__';

const emptyForm = {
  judul: '',
  penulis: '',
  isbn: '',
  penerbit: '',
  tahunTerbit: '',
  kategori: '',
  jumlahEksemplar: '',
  lokasiRak: '',
  kondisi: 'Baik',
  status: 'Tersedia',
  deskripsi: '',
  cover: '',
};

function SanctuarySection({ title, icon: Icon, children }) {
  return (
    <div className="space-y-4 pt-3">
      <div className="flex items-center gap-2 pb-2.5 border-b border-forest-sage/15 text-forest-mist">
        <Icon size={16} className="text-forest-amber" />
        <h3 className="font-serif font-bold text-base tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function BookForm({ bookId = null }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [racks, setRacks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [rackMode, setRackMode] = useState('');
  const [loading, setLoading] = useState(!!bookId);
  const [saving, setSaving] = useState(false);
  const [isbnTouched, setIsbnTouched] = useState(false);

  const isbnResult = useMemo(() => {
    if (!form.isbn.trim()) return null;
    return validateIsbn(form.isbn);
  }, [form.isbn]);

  const statusOptions = useMemo(
    () => allowedStatuses(form.kondisi, STATUS),
    [form.kondisi]
  );
  const pairResult = validateKondisiStatus(form.kondisi, form.status);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => setCategories([]));
    api.getRacks().then(setRacks).catch(() => setRacks([]));
  }, []);

  useEffect(() => {
    if (!bookId) return;
    setLoading(true);
    api
      .getBook(bookId)
      .then((b) => {
        setForm({
          judul: b.judul,
          penulis: b.penulis,
          isbn: b.isbn,
          penerbit: b.penerbit,
          tahunTerbit: String(b.tahunTerbit),
          kategori: b.kategori,
          jumlahEksemplar: String(b.jumlahEksemplar),
          lokasiRak: b.lokasiRak,
          kondisi: b.kondisi,
          status: b.status,
          deskripsi: b.deskripsi || '',
          cover: b.cover || '',
        });
        setRackMode(b.lokasiRak);
      })
      .catch((e) => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [bookId]);

  function setField(name, value) {
    setForm((f) => {
      const next = { ...f, [name]: value };
      if (name === 'kondisi') {
        const allowed = allowedStatuses(value, STATUS);
        if (!allowed.includes(next.status)) {
          next.status = suggestedStatus(value);
        }
      }
      return next;
    });
  }

  function onRackSelect(value) {
    if (value === CUSTOM_RACK) {
      setRackMode(CUSTOM_RACK);
      setField('lokasiRak', '');
      return;
    }
    setRackMode(value);
    setField('lokasiRak', value);
  }

  async function onCoverFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await api.uploadCover(file);
      setField('cover', url);
      showToast('Gambar sampul tersimpan di naungan sanctuary');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsbnTouched(true);
    const isbnCheck = validateIsbn(form.isbn);
    if (!isbnCheck.ok) {
      showToast(isbnCheck.error, 'error');
      return;
    }
    const pair = validateKondisiStatus(form.kondisi, form.status);
    if (!pair.ok) {
      showToast(pair.error, 'error');
      return;
    }
    if (!form.lokasiRak.trim()) {
      showToast('Lokasi rak wajib ditentukan', 'error');
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      isbn: isbnCheck.normalized,
      lokasiRak: form.lokasiRak.trim(),
      tahunTerbit: parseInt(form.tahunTerbit, 10),
      jumlahEksemplar: parseInt(form.jumlahEksemplar, 10),
    };
    try {
      if (bookId) {
        await api.updateBook(bookId, payload);
        showToast('Naskah berhasil diperbarui di arsip');
        navigate(`/koleksi/${bookId}`);
      } else {
        const created = await api.createBook(payload);
        showToast('Naskah baru telah diukir ke perpustakaan');
        navigate(`/koleksi/${created.id}`);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <FolioSkeleton lines={8} />;
  }

  const isEdit = Boolean(bookId);
  const showIsbnError = isbnTouched && isbnResult && !isbnResult.ok;
  const rackNames = new Set(racks.map((r) => r.name));
  const rackSelectValue =
    rackMode === CUSTOM_RACK
      ? CUSTOM_RACK
      : rackNames.has(form.lokasiRak)
        ? form.lokasiRak
        : form.lokasiRak && racks.length > 0
          ? CUSTOM_RACK
          : rackMode || '';
  const showCustomRack = rackSelectValue === CUSTOM_RACK;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <PageHeader
        badge="SCRIBE SANCTUARY"
        title={isEdit ? 'Ukir Suntingan Naskah' : 'Pendaftaran Naskah Baru'}
        description={
          isEdit
            ? 'Perbarui metadata bibliografi atau mutasikan eksemplar ke dahan rak lain.'
            : 'Mencatatkan naskah fisik baru ke dalam sanctuary hidup di bawah kanopi.'
        }
      />

      <form onSubmit={handleSubmit} className="sanctuary-card p-6 md:p-8 space-y-6">
        {/* Bibliografi */}
        <SanctuarySection title="Metadata Bibliografi" icon={Barcode}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-forest-sage mb-1.5">
                Judul Lengkap Naskah <span className="text-forest-amber">*</span>
              </label>
              <input
                required
                value={form.judul}
                onChange={(e) => setField('judul', e.target.value)}
                placeholder="Contoh: Filosofi Teras"
                className="sanctuary-input font-serif text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-forest-sage mb-1.5">
                Penulis / Pengarang <span className="text-forest-amber">*</span>
              </label>
              <input
                required
                value={form.penulis}
                onChange={(e) => setField('penulis', e.target.value)}
                placeholder="Nama penulis"
                className="sanctuary-input"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-forest-sage mb-1.5">
                Nomor ISBN <span className="text-forest-amber">*</span>
              </label>
              <input
                required
                value={form.isbn}
                onChange={(e) => {
                  setField('isbn', e.target.value);
                  const d = e.target.value.replace(/[^0-9Xx]/g, '');
                  if (d.length === 10 || d.length === 13) setIsbnTouched(true);
                }}
                onBlur={() => setIsbnTouched(true)}
                placeholder="978-... atau 10 digit"
                className={`sanctuary-input font-mono ${
                  showIsbnError ? 'border-rose-500' : ''
                }`}
              />
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono">
                {showIsbnError ? (
                  <span className="text-rose-400 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {isbnResult.error}
                  </span>
                ) : isbnResult?.ok ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    ISBN valid ({isbnResult.normalized.length} digit)
                  </span>
                ) : (
                  <span className="text-forest-sage/60">
                    Format ISBN-10 / ISBN-13
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-forest-sage mb-1.5">
                Penerbit <span className="text-forest-amber">*</span>
              </label>
              <input
                required
                value={form.penerbit}
                onChange={(e) => setField('penerbit', e.target.value)}
                placeholder="Nama penerbit"
                className="sanctuary-input"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-forest-sage mb-1.5">
                Tahun Cetak <span className="text-forest-amber">*</span>
              </label>
              <input
                type="number"
                required
                min={1800}
                max={2030}
                value={form.tahunTerbit}
                onChange={(e) => setField('tahunTerbit', e.target.value)}
                placeholder="YYYY"
                className="sanctuary-input font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-forest-sage mb-1.5">
                Klasifikasi Kategori <span className="text-forest-amber">*</span>
              </label>
              <select
                required
                value={form.kategori}
                onChange={(e) => setField('kategori', e.target.value)}
                className="sanctuary-input"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name} className="bg-[#101513]">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </SanctuarySection>

        {/* Eksemplar Fisik & Rak */}
        <SanctuarySection title="Fisik & Penempatan Rak" icon={Layers}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-forest-sage mb-1.5">
                Jumlah Eksemplar <span className="text-forest-amber">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={form.jumlahEksemplar}
                onChange={(e) => setField('jumlahEksemplar', e.target.value)}
                placeholder="0"
                className="sanctuary-input font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-forest-sage mb-1.5">
                Lokasi Rak Kayu <span className="text-forest-amber">*</span>
              </label>
              <select
                value={rackSelectValue}
                onChange={(e) => onRackSelect(e.target.value)}
                className="sanctuary-input font-mono"
                required={!showCustomRack}
              >
                <option value="">Pilih Rak</option>
                {racks.map((r) => (
                  <option key={r.id} value={r.name} className="bg-[#101513]">
                    {r.name}
                  </option>
                ))}
                <option value={CUSTOM_RACK} className="bg-[#101513]">+ Ukir Rak Baru...</option>
              </select>
              {showCustomRack && (
                <input
                  required
                  value={form.lokasiRak}
                  onChange={(e) => setField('lokasiRak', e.target.value)}
                  placeholder="Ketik kode rak baru (misal: RAK-C3)"
                  className="sanctuary-input font-mono mt-2"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-mono text-forest-sage mb-1.5">
                Kondisi Fisik
              </label>
              <select
                value={form.kondisi}
                onChange={(e) => setField('kondisi', e.target.value)}
                className="sanctuary-input"
              >
                {KONDISI.map((k) => (
                  <option key={k} value={k} className="bg-[#101513]">
                    {k}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-forest-sage mb-1.5">
                Status Ketersediaan
              </label>
              <select
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
                className="sanctuary-input"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s} className="bg-[#101513]">
                    {s}
                  </option>
                ))}
              </select>
              {!pairResult.ok && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-mono">
                  <AlertCircle size={12} />
                  {pairResult.error}
                </p>
              )}
            </div>
          </div>
        </SanctuarySection>

        {/* Sampul & Deskripsi */}
        <SanctuarySection title="Sampul Hardcover & Sinopsis" icon={Feather}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-forest-sage mb-1.5">
                Sinopsis / Catatan Kurator
              </label>
              <textarea
                rows={3}
                value={form.deskripsi}
                onChange={(e) => setField('deskripsi', e.target.value)}
                placeholder="Deskripsi atau catatan tentang naskah ini..."
                className="sanctuary-input font-sans text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-forest-sage mb-1.5">
                Berkas Sampul
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start p-4 rounded-xl bg-[#101513]/70 border border-forest-sage/15">
                <CoverImage
                  judul={form.judul || 'Pratinjau Sampul'}
                  penulis={form.penulis}
                  cover={form.cover}
                  className="w-20 h-28 object-cover rounded-lg border border-forest-sage/20 shrink-0"
                />
                <div className="flex-1 w-full space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onCoverFile}
                    className="text-xs text-forest-sage file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-forest-moss file:text-forest-amber file:text-xs file:font-mono cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.cover}
                    onChange={(e) => setField('cover', e.target.value)}
                    placeholder="Atau tautan URL gambar sampul..."
                    className="sanctuary-input text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </SanctuarySection>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-forest-sage/15">
          <button
            type="button"
            onClick={() => navigate(bookId ? `/koleksi/${bookId}` : '/koleksi')}
            className="sanctuary-btn-secondary"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="sanctuary-btn-amber"
          >
            <Save size={15} />
            <span>{saving ? 'Mengukir ke Arsip...' : isEdit ? 'Simpan Suntingan' : 'Daftarkan Naskah'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
