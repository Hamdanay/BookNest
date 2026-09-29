import { Router } from 'express';
import { db } from '../db.js';
import { rowToBook } from '../book-mapper.js';

const router = Router();

router.get('/stats', (_req, res) => {
  const books = db.prepare('SELECT * FROM books').all();
  const categoryCount = db.prepare('SELECT COUNT(*) as c FROM categories').get().c;

  const totalJudul = books.length;
  const totalEksemplar = books.reduce((acc, b) => acc + (b.jumlah_eksemplar || 0), 0);
  const bukuTersedia = books.filter((b) => b.status === 'Tersedia').length;
  const bukuRusak = books.filter(
    (b) => b.kondisi === 'Rusak Ringan' || b.kondisi === 'Rusak Berat'
  ).length;
  const bukuDiarsipkan = books.filter((b) => b.status === 'Diarsipkan').length;

  const byCategory = {};
  for (const b of books) {
    byCategory[b.kategori] = (byCategory[b.kategori] || 0) + 1;
  }

  const byRack = {};
  for (const b of books) {
    const rack = b.lokasi_rak || 'Lainnya';
    byRack[rack] = (byRack[rack] || 0) + (b.jumlah_eksemplar || 1);
  }

  const recent = [...books]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4)
    .map(rowToBook);

  const damaged = books
    .filter((b) => b.kondisi === 'Rusak Ringan' || b.kondisi === 'Rusak Berat')
    .map(rowToBook);

  res.json({
    stats: {
      totalJudul,
      totalEksemplar,
      jumlahKategori: categoryCount,
      bukuTersedia,
      bukuRusak,
      bukuDiarsipkan,
    },
    byCategory,
    byRack,
    recent,
    damaged,
  });
});

export default router;
