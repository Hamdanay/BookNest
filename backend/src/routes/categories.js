import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT c.id, c.name,
        (SELECT COUNT(*) FROM books b WHERE b.kategori = c.name) as book_count
      FROM categories c
      ORDER BY c.name ASC`
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
  if (!name) return res.status(400).json({ error: 'Nama kategori wajib diisi' });

  const exists = db.prepare('SELECT id FROM categories WHERE name = ?').get(name);
  if (exists) return res.status(409).json({ error: 'Kategori sudah ada' });

  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO categories (id, name, created_at) VALUES (?, ?, ?)').run(
    id,
    name,
    now
  );
  res.status(201).json({ id, name, jumlahJudul: 0 });
});

router.put('/:id', (req, res) => {
  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Kategori tidak ditemukan' });

  const newName = req.body.name?.trim();
  if (!newName) return res.status(400).json({ error: 'Nama kategori wajib diisi' });

  const duplicate = db
    .prepare('SELECT id FROM categories WHERE name = ? AND id != ?')
    .get(newName, req.params.id);
  if (duplicate) return res.status(409).json({ error: 'Kategori sudah ada' });

  db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(newName, req.params.id);
  db.prepare('UPDATE books SET kategori = ? WHERE kategori = ?').run(newName, cat.name);

  const count = db
    .prepare('SELECT COUNT(*) as c FROM books WHERE kategori = ?')
    .get(newName).c;

  res.json({ id: req.params.id, name: newName, jumlahJudul: count });
});

router.delete('/:id', (req, res) => {
  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Kategori tidak ditemukan' });

  const inUse = db
    .prepare('SELECT COUNT(*) as c FROM books WHERE kategori = ?')
    .get(cat.name).c;
  if (inUse > 0) {
    return res.status(400).json({
      error: `Kategori masih dipakai oleh ${inUse} judul buku`,
    });
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

export default router;
