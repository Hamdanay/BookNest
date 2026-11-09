import { useEffect, useState } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Book,
} from 'lucide-react';
import { api } from '../api/client';
import { showToast } from '../components/Toast';
import PageHeader from '../components/PageHeader';
import { DEMO_CATEGORIES } from '../lib/demoData';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  function load() {
    api
      .getCategories()
      .then(setCategories)
      .catch(() => setCategories(DEMO_CATEGORIES));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') setModalOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await api.createCategory(newName.trim());
      showToast('Tajuk klasifikasi baru telah ditanam');
      setNewName('');
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function saveEdit(id) {
    if (!editName.trim()) return;
    try {
      await api.updateCategory(id, editName.trim());
      showToast('Nama kategori diperbarui');
      setEditId(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function remove(id, name) {
    if (!window.confirm(`Hapus kategori "${name}"? Seluruh naskah terhubung akan dialihkan ke klasifikasi Umum.`)) return;
    try {
      await api.deleteCategory(id);
      showToast('Kategori telah dihapus');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <PageHeader
        badge="TAXONOMY CANOPY"
        title="Klasifikasi & Tajuk Subjek"
        description="Pohon taksonomi untuk memetakan rumpun ilmu dan tema naskah di perpustakaan hutan purba."
        action={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="sanctuary-btn-amber"
          >
            <Plus size={16} />
            <span>Tanam Kategori Baru</span>
          </button>
        }
      />

      <div className="sanctuary-card p-0 overflow-hidden">
        <div className="p-4 border-b border-forest-sage/15 flex items-center justify-between text-xs text-forest-sage">
          <div className="flex items-center gap-2">
            <FolderTree size={16} className="text-forest-amber" />
            <span className="font-serif font-bold text-forest-mist text-sm">Daftar Tajuk Terdaftar</span>
          </div>
          <span className="font-mono text-forest-amber">{categories.length} cabang</span>
        </div>

        <div className="divide-y divide-forest-sage/10">
          {categories.map((c) => (
            <div
              key={c.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-forest-moss/20 transition-colors"
            >
              <div className="flex-1 min-w-0">
                {editId === c.id ? (
                  <div className="flex items-center gap-2 max-w-md">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="sanctuary-input font-serif text-sm"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(c.id)}
                      className="p-2 rounded bg-forest-moss text-forest-amber hover:bg-forest-moss/80 transition-colors"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditId(null)}
                      className="p-2 rounded bg-[#101513] text-forest-sage hover:text-forest-mist transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="font-serif font-bold text-base text-forest-mist">{c.name}</span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-[#101513] text-forest-amber border border-forest-sage/15">
                      <Book size={11} />
                      <span>{c.jumlahJudul} naskah</span>
                    </span>
                  </div>
                )}
              </div>

              {editId !== c.id && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditId(c.id);
                      setEditName(c.name);
                    }}
                    className="p-2 rounded text-forest-sage hover:text-forest-amber transition-colors"
                    title="Sunting Tajuk"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(c.id, c.name)}
                    className="p-2 rounded text-forest-sage hover:text-rose-400 transition-colors"
                    title="Hapus Tajuk"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#101513]/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="sanctuary-card max-w-md w-full p-6 space-y-4 border-forest-amber/30 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-forest-sage/15">
              <h3 className="font-serif text-lg font-bold text-forest-mist">Tanam Kategori Baru</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded text-forest-sage hover:text-forest-mist"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-forest-sage mb-1.5">
                  Nama Tajuk Kategori
                </label>
                <input
                  type="text"
                  placeholder="Misal: Filsafat Kuno, Sejarah Rimba, Sains..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="sanctuary-input font-serif"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="sanctuary-btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="sanctuary-btn-amber">
                  Tanam Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
