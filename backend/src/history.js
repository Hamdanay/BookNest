import { v4 as uuidv4 } from 'uuid';
import { db } from './db.js';

const TRACKED = [
  ['judul', 'judul'],
  ['penulis', 'penulis'],
  ['isbn', 'isbn'],
  ['penerbit', 'penerbit'],
  ['tahun_terbit', 'tahunTerbit'],
  ['kategori', 'kategori'],
  ['jumlah_eksemplar', 'jumlahEksemplar'],
  ['lokasi_rak', 'lokasiRak'],
  ['kondisi', 'kondisi'],
  ['status', 'status'],
  ['deskripsi', 'deskripsi'],
  ['cover', 'cover'],
];

export function recordHistory(bookId, field, oldValue, newValue) {
  const oldStr = oldValue == null ? '' : String(oldValue);
  const newStr = newValue == null ? '' : String(newValue);
  if (oldStr === newStr) return;
  db.prepare(
    `INSERT INTO book_history (id, book_id, field, old_value, new_value, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(uuidv4(), bookId, field, oldStr, newStr, new Date().toISOString());
}

export function recordCreated(bookId) {
  recordHistory(bookId, 'koleksi', '', 'ditambahkan');
}

export function recordBookUpdate(existingRow, nextValues) {
  for (const [dbField, key] of TRACKED) {
    recordHistory(existingRow.id, key, existingRow[dbField], nextValues[key]);
  }
}

export function listHistory(bookId) {
  return db
    .prepare(
      `SELECT id, field, old_value as oldValue, new_value as newValue, created_at as createdAt
       FROM book_history WHERE book_id = ? ORDER BY created_at DESC`
    )
    .all(bookId);
}
