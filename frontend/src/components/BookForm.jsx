import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

function Section({ title, children }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-base font-semibold text-folio-ink border-b border-folio-line pb-2">
        {title}
      </h2>
      {children}
    </section>
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
      showToast('Cover berhasil diunggah');
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
      showToast('Lokasi rak wajib diisi', 'error');
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
        showToast('Buku berhasil diperbarui');
        navigate(`/koleksi/${bookId}`);
      } else {
        const created = await api.createBook(payload);
        showToast('Buku baru berhasil ditambahkan');
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

  const title = bookId ? 'Edit data buku' : 'Tambah buku baru';
  const desc = bookId
    ? 'Perbarui entri di arsip koleksi.'
    : 'Catat judul baru ke dalam perpustakaan hutan.';
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
    <div className="space-y-4 sm:space-y-6 max-w-3xl w-full">
      <PageHeader title={title} description={desc} />

      <form onSubmit={handleSubmit} className="elf-folio p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        <Section title="Informasi bibliografi">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-folio-ink mb-1.5">Judul buku</label>
              <input required value={form.judul} onChange={(e) => setField('judul', e.target.value)} className="elf-input" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-folio-ink mb-1.5">Penulis</label>
              <input required value={form.penulis} onChange={(e) => setField('penulis', e.target.value)} className="elf-input" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-folio-ink mb-1.5" htmlFor="isbn-input">
                ISBN
              </label>
              <input
                id="isbn-input"
                required
                value={form.isbn}
                onChange={(e) => {
                  setField('isbn', e.target.value);
                  const d = e.target.value.replace(/[^0-9Xx]/g, '');
                  if (d.length === 10 || d.length === 13) setIsbnTouched(true);
                }}
                onBlur={() => setIsbnTouched(true)}
                aria-invalid={showIsbnError}
                aria-describedby="isbn-hint"
                className={`elf-input ${showIsbnError ? 'ring-2 ring-nest-danger/60' : ''}`}
                placeholder="978-... atau ISBN-10"
              />
              <p id="isbn-hint" className={`text-[11px] mt-1 ${showIsbnError ? 'text-nest-danger' : 'text-folio-muted'}`}>
                {showIsbnError
                  ? isbnResult.error
                  : isbnResult?.ok
                    ? `ISBN valid (${isbnResult.normalized.length} digit)`
                    : 'ISBN-10 atau ISBN-13 dengan angka periksa yang benar.'}
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-folio-ink mb-1.5">Penerbit</label>
              <input required value={form.penerbit} onChange={(e) => setField('penerbit', e.target.value)} className="elf-input" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-folio-ink mb-1.5">Tahun terbit</label>
              <input
                type="number"
                required
                min={1800}
                max={2030}
                value={form.tahunTerbit}
                onChange={(e) => setField('tahunTerbit', e.target.value)}
                className="elf-input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-folio-ink mb-1.5">Kategori</label>
              <select required value={form.kategori} onChange={(e) => setField('kategori', e.target.value)} className="elf-input">
                <option value="">Pilih kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </Section>

        <Section title="Informasi inventaris">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-folio-ink mb-1.5">Jumlah eksemplar</label>
              <input
                type="number"
                required
                min={0}
                value={form.jumlahEksemplar}
                onChange={(e) => setField('jumlahEksemplar', e.target.value)}
                className="elf-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-folio-ink mb-1.5">Lokasi rak</label>
              <select
                value={rackSelectValue}
                onChange={(e) => onRackSelect(e.target.value)}
                className="elf-input"
                required={!showCustomRack}
              >
                <option value="">Pilih rak</option>
                {racks.map((r) => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
                <option value={CUSTOM_RACK}>Rak baru...</option>
              </select>
              {showCustomRack && (
                <input
                  required
                  value={form.lokasiRak}
                  onChange={(e) => setField('lokasiRak', e.target.value)}
                  placeholder="Contoh: Rak Fiksi A"
                  className="elf-input mt-2"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-folio-ink mb-1.5">Kondisi buku</label>
              <select value={form.kondisi} onChange={(e) => setField('kondisi', e.target.value)} className="elf-input">
                {KONDISI.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-folio-ink mb-1.5">Status koleksi</label>
              <select
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
                className="elf-input"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {!pairResult.ok && (
                <p className="text-[11px] text-nest-danger mt-1">{pairResult.error}</p>
              )}
            </div>
          </div>
        </Section>

        <Section title="Informasi tambahan">
          <div>
            <label className="block text-xs font-semibold text-folio-ink mb-1.5">Deskripsi</label>
            <textarea
              rows={3}
              value={form.deskripsi}
              onChange={(e) => setField('deskripsi', e.target.value)}
              className="elf-input resize-y"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-folio-ink mb-1.5">Cover buku</label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <CoverImage
                judul={form.judul || 'Pratinjau sampul'}
                penulis={form.penulis}
                cover={form.cover}
                className="w-28 h-40 object-cover rounded-xl ring-1 ring-folio-line flex-shrink-0"
              />
              <div className="flex-1 w-full space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onCoverFile}
                  className="text-sm text-folio-muted file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-nest-secondary file:text-mist file:text-xs file:font-medium"
                />
                <input
                  value={form.cover}
                  onChange={(e) => setField('cover', e.target.value)}
                  placeholder="URL gambar sampul (opsional)"
                  className="elf-input"
                />
                <p className="text-[11px] text-folio-muted">
                  Jika URL kosong atau gagal dimuat, sampul digenerate dari judul.
                </p>
              </div>
            </div>
          </div>
        </Section>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-folio-line">
          <button
            type="button"
            onClick={() => navigate(bookId ? `/koleksi/${bookId}` : '/koleksi')}
            className="elf-btn-ghost text-folio-ink justify-center min-h-[44px]"
          >
            Batal
          </button>
          <button type="submit" disabled={saving} className="elf-btn disabled:opacity-50 justify-center w-full sm:w-auto">
            {saving ? 'Menyimpan...' : 'Simpan buku'}
          </button>
        </div>
      </form>
    </div>
  );
}
