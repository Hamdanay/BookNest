import { useEffect, useState } from 'react';
import {
  Archive,
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
import { FolioSkeleton } from '../components/Skeleton';
import { DEMO_RACKS } from '../lib/demoData';

export default function Racks() {
  const [racks, setRacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  function load() {
    setLoading(true);
    api
      .getRacks()
      .then(setRacks)
      .catch(() => setRacks(DEMO_RACKS))
      .finally(() => setLoading(false));
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
      await api.createRack(newName.trim());
      showToast('Dahan rak baru telah terpasang');
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
      await api.updateRack(id, editName.trim());
      showToast('Kode rak diperbarui');
      setEditId(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function remove(id, name) {
    if (!window.confirm(`Hapus rak "${name}"? Pastikan tidak ada naskah yang masih bersandar di dahan ini.`)) return;
    try {
      await api.deleteRack(id);
      showToast('Rak telah dilepas');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <PageHeader
        badge="TIMBER RACKS"
        title="Pemetaan Rak & Dahan Fisik"
        description="Tata letak penempatan naskah pada lemari cedarwood dan rak kayu purba di seluruh penjuru sanctuary."
        action={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="sanctuary-btn-amber"
          >
            <Plus size={16} />
            <span>Pasang Rak Baru</span>
          </button>
        }
      />

      <div className="sanctuary-card p-0 overflow-hidden">
        <div className="p-4 border-b border-forest-sage/15 flex items-center justify-between text-xs text-forest-sage">
          <div className="flex items-center gap-2">
            <Archive size={16} className="text-forest-amber" />
            <span className="font-serif font-bold text-forest-mist text-sm">Daftar Rak Terpasang</span>
          </div>
          <span className="font-mono text-forest-amber">{racks.length} dahan</span>
        </div>

        {loading ? (
          <div className="p-4">
            <FolioSkeleton lines={4} />
          </div>
        ) : (
          <div className="divide-y divide-forest-sage/10">
            {racks.map((r) => (
              <div
                key={r.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-forest-moss/20 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  {editId === r.id ? (
                    <div className="flex items-center gap-2 max-w-md">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="sanctuary-input font-mono"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => saveEdit(r.id)}
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
                      <span className="font-mono font-bold text-sm text-forest-amber">{r.name}</span>
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-[#101513] text-forest-sage border border-forest-sage/15">
                        <Book size={11} />
                        <span>{r.jumlahJudul} naskah bersandar</span>
                      </span>
                    </div>
                  )}
                </div>

                {editId !== r.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditId(r.id);
                        setEditName(r.name);
                      }}
                      className="p-2 rounded text-forest-sage hover:text-forest-amber transition-colors"
                      title="Ubah Kode"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(r.id, r.name)}
                      className="p-2 rounded text-forest-sage hover:text-rose-400 transition-colors"
                      title="Lepas Rak"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#101513]/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="sanctuary-card max-w-md w-full p-6 space-y-4 border-forest-amber/30 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-forest-sage/15">
              <h3 className="font-serif text-lg font-bold text-forest-mist">Pasang Rak Cedarwood</h3>
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
                  Kode / Nama Rak
                </label>
                <input
                  type="text"
                  placeholder="Misal: RAK-A1, RAK-Filsafat-02..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="sanctuary-input font-mono"
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
                  Pasang Rak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
