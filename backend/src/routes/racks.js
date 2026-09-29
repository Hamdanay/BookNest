import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT r.id, r.name,
        (SELECT COUNT(*) FROM books b WHERE b.lokasi_rak = r.name) as book_count
      FROM racks r
      ORDER BY r.name ASC`
    )
    .all();
  res.json(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      jumlahJudul: r.book_count,
    }))
  );
});

router.post('/', (req, res) => {
  const name = req.body.name?.trim();
  if (!name) return res.status(400).json({ error: 'Nama rak wajib diisi' });
  const exists = db.prepare('SELECT id FROM racks WHERE name = ?').get(name);
  if (exists) return res.status(409).json({ error: 'Rak sudah ada' });
  const id = uuidv4();
  db.prepare('INSERT INTO racks (id, name, created_at) VALUES (?, ?, ?)').run(
    id,
    name,
    new Date().toISOString()
  );
  res.status(201).json({ id, name, jumlahJudul: 0 });
});

router.put('/:id', (req, res) => {
  const rack = db.prepare('SELECT * FROM racks WHERE id = ?').get(req.params.id);
  if (!rack) return res.status(404).json({ error: 'Rak tidak ditemukan' });
  const newName = req.body.name?.trim();
  if (!newName) return res.status(400).json({ error: 'Nama rak wajib diisi' });
  const duplicate = db
    .prepare('SELECT id FROM racks WHERE name = ? AND id != ?')
    .get(newName, req.params.id);
  if (duplicate) return res.status(409).json({ error: 'Rak sudah ada' });
  db.prepare('UPDATE racks SET name = ? WHERE id = ?').run(newName, req.params.id);
  db.prepare('UPDATE books SET lokasi_rak = ? WHERE lokasi_rak = ?').run(newName, rack.name);
  const count = db.prepare('SELECT COUNT(*) as c FROM books WHERE lokasi_rak = ?').get(newName).c;
  res.json({ id: req.params.id, name: newName, jumlahJudul: count });
});

router.delete('/:id', (req, res) => {
  const rack = db.prepare('SELECT * FROM racks WHERE id = ?').get(req.params.id);
  if (!rack) return res.status(404).json({ error: 'Rak tidak ditemukan' });
  const inUse = db.prepare('SELECT COUNT(*) as c FROM books WHERE lokasi_rak = ?').get(rack.name).c;
  if (inUse > 0) {
    return res.status(400).json({ error: `Rak masih dipakai oleh ${inUse} judul buku` });
  }
  db.prepare('DELETE FROM racks WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

export default router;
