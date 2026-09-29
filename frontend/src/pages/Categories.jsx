import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { showToast } from '../components/Toast';
import PageHeader from '../components/PageHeader';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  function load() {
    api.getCategories().then(setCategories).catch(() => setCategories([]));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.createCategory(newName.trim());
      showToast('Kategori ditambahkan');
      setNewName('');
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function saveEdit(id) {
    try {
      await api.updateCategory(id, editName.trim());
      showToast('Kategori diperbarui');
      setEditId(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function remove(id, name) {
    if (!confirm(`Hapus kategori "${name}"?`)) return;
    try {
      await api.deleteCategory(id);
      showToast('Kategori dihapus');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategori buku"
        description="Kelompokkan koleksi seperti rak-rak di perpustakaan hutan — fiksi, sejarah, dan seterusnya."
        action={
          <button type="button" onClick={() => setModalOpen(true)} className="elf-btn">
            <i className="fa-solid fa-leaf text-nest-gold" /> Tambah kategori
          </button>
        }
      />
      <div className="elf-divider" />

      <div className="md:hidden max-w-3xl space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="elf-folio p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              {editId === c.id ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="elf-input w-full"
                />
              ) : (
                <p className="font-display font-semibold text-folio-ink break-words">{c.name}</p>
              )}
              <p className="text-xs text-folio-muted mt-1">{c.jumlahJudul} judul</p>
            </div>
            <div className="flex gap-2 justify-end">
              {editId === c.id ? (
                <>
                  <button type="button" onClick={() => saveEdit(c.id)} className="elf-btn text-xs py-2 px-3">
                    Simpan
                  </button>
                  <button type="button" onClick={() => setEditId(null)} className="elf-btn-ghost text-folio-ink text-xs">
                    Batal
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditId(c.id);
                      setEditName(c.name);
                    }}
                    className="p-3 rounded-xl text-folio-muted hover:text-nest-gold hover:bg-white/40 min-w-[44px]"
                    title="Edit"
                  >
                    <i className="fa-solid fa-pen" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(c.id, c.name)}
                    className="p-3 rounded-xl text-folio-muted hover:text-nest-danger hover:bg-white/40 min-w-[44px]"
                    title="Hapus"
                  >
                    <i className="fa-solid fa-trash-can" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="elf-folio overflow-hidden max-w-3xl p-0 hidden md:block">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="elf-table-head">
              <th className="p-4 font-medium">Kategori</th>
              <th className="p-4 text-center font-medium">Jumlah judul</th>
              <th className="p-4 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm bg-white/20 divide-y divide-folio-line/80">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-white/30 transition-colors">
                <td className="p-4 font-medium text-folio-ink">
                  {editId === c.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="elf-input max-w-xs py-1.5"
                    />
                  ) : (
                    c.name
                  )}
                </td>
                <td className="p-4 text-center tabular-nums text-folio-muted">{c.jumlahJudul}</td>
                <td className="p-4 text-right space-x-2">
                  {editId === c.id ? (
                    <>
                      <button type="button" onClick={() => saveEdit(c.id)} className="text-nest-warm text-xs font-semibold">
                        Simpan
                      </button>
                      <button type="button" onClick={() => setEditId(null)} className="text-folio-muted text-xs">
                        Batal
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditId(c.id);
                          setEditName(c.name);
                        }}
                        className="p-2 rounded-lg text-folio-muted hover:text-nest-gold hover:bg-white/40"
                        title="Edit"
                      >
                        <i className="fa-solid fa-pen" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(c.id, c.name)}
                        className="p-2 rounded-lg text-folio-muted hover:text-nest-danger hover:bg-white/40"
                        title="Hapus"
                      >
                        <i className="fa-solid fa-trash-can" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-nest-dark/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 safe-bottom">
          <div className="elf-folio w-full max-w-md overflow-hidden max-h-[90dvh] overflow-y-auto rounded-b-none sm:rounded-b-2xl">
            <div className="px-5 py-4 border-b border-folio-line flex items-center justify-between bg-white/30">
              <h3 className="font-display font-semibold text-folio-ink">Kategori baru</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-folio-muted hover:text-folio-ink">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-folio-ink mb-1.5">Nama kategori</label>
                <input
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="elf-input"
                  placeholder="Contoh: Mitologi"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="elf-btn-ghost text-folio-ink">
                  Batal
                </button>
                <button type="submit" className="elf-btn text-sm py-2">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
