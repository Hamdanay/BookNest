import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Vercel set VERCEL=1; tanpa /tmp, SQLite di folder deploy (read-only) → function crash. */
const onVercel = Boolean(process.env.VERCEL);

/** Di Vercel filesystem hanya /tmp yang bisa ditulis (serverless). */
const dataDir = onVercel
  ? path.join('/tmp', 'booknest', 'data')
  : path.join(__dirname, '..', 'data');
const uploadsDir = onVercel
  ? path.join('/tmp', 'booknest', 'uploads')
  : path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const dbPath = path.join(dataDir, 'booknest.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS racks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    judul TEXT NOT NULL,
    penulis TEXT NOT NULL,
    isbn TEXT NOT NULL,
    penerbit TEXT NOT NULL,
    tahun_terbit INTEGER NOT NULL,
    kategori TEXT NOT NULL,
    jumlah_eksemplar INTEGER NOT NULL DEFAULT 0,
    lokasi_rak TEXT NOT NULL,
    kondisi TEXT NOT NULL,
    status TEXT NOT NULL,
    deskripsi TEXT,
    cover TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS book_history (
    id TEXT PRIMARY KEY,
    book_id TEXT NOT NULL,
    field TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_books_judul ON books(judul);
  CREATE INDEX IF NOT EXISTS idx_books_kategori ON books(kategori);
  CREATE INDEX IF NOT EXISTS idx_history_book ON book_history(book_id, created_at);
`);

try {
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn)');
} catch {
  // Index may fail if ada duplikat lama; unique tetap dicek di aplikasi.
}

const rackCount = db.prepare('SELECT COUNT(*) as c FROM racks').get().c;
if (rackCount === 0) {
  const names = db
    .prepare(
      `SELECT DISTINCT lokasi_rak as name FROM books
       WHERE lokasi_rak IS NOT NULL AND lokasi_rak != ''`
    )
    .all();
  const insertRack = db.prepare(
    'INSERT OR IGNORE INTO racks (id, name, created_at) VALUES (?, ?, ?)'
  );
  const now = new Date().toISOString();
  for (const row of names) {
    insertRack.run(crypto.randomUUID(), row.name, now);
  }
}

export { db, uploadsDir };
