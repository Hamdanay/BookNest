import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import pg from 'pg';

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

// ==============================================================
// PostgreSQL Multi-Tier Container Synchronization
// ==============================================================
let pgPool = null;
let pgConnected = false;

if (process.env.DB_HOST) {
  pgPool = new pg.Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'booknest',
    user: process.env.DB_USER || 'booknest_user',
    password: process.env.DB_PASSWORD || 'booknest_pass',
    connectionTimeoutMillis: 5000,
  });

  // Attempt connection and schema initialization
  pgPool
    .query('SELECT 1')
    .then(async () => {
      pgConnected = true;
      console.log(`[Database] Terhubung ke PostgreSQL container di ${process.env.DB_HOST}:${process.env.DB_PORT || 5432}`);

      // Ensure PostgreSQL schema is ready
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(128) NOT NULL UNIQUE,
          created_at TIMESTAMPTZ NOT NULL
        );
        CREATE TABLE IF NOT EXISTS racks (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(128) NOT NULL UNIQUE,
          created_at TIMESTAMPTZ NOT NULL
        );
        CREATE TABLE IF NOT EXISTS books (
          id VARCHAR(64) PRIMARY KEY,
          judul VARCHAR(255) NOT NULL,
          penulis VARCHAR(255) NOT NULL,
          isbn VARCHAR(32) NOT NULL,
          penerbit VARCHAR(255) NOT NULL,
          tahun_terbit INT NOT NULL,
          kategori VARCHAR(128) NOT NULL,
          jumlah_eksemplar INT NOT NULL DEFAULT 0,
          lokasi_rak VARCHAR(128) NOT NULL,
          kondisi VARCHAR(64) NOT NULL,
          status VARCHAR(64) NOT NULL,
          deskripsi TEXT,
          cover TEXT,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );
        CREATE TABLE IF NOT EXISTS book_history (
          id VARCHAR(64) PRIMARY KEY,
          book_id VARCHAR(64) NOT NULL,
          field VARCHAR(64) NOT NULL,
          old_value TEXT,
          new_value TEXT,
          created_at TIMESTAMPTZ NOT NULL
        );
      `);

      // Sync initial data so Adminer/pgAdmin immediately displays tables and rows
      const cats = db.prepare('SELECT * FROM categories').all();
      for (const c of cats) {
        await pgPool.query(
          'INSERT INTO categories (id, name, created_at) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
          [c.id, c.name, c.created_at]
        );
      }
      const racks = db.prepare('SELECT * FROM racks').all();
      for (const r of racks) {
        await pgPool.query(
          'INSERT INTO racks (id, name, created_at) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
          [r.id, r.name, r.created_at]
        );
      }
      const books = db.prepare('SELECT * FROM books').all();
      for (const b of books) {
        await pgPool.query(
          `INSERT INTO books (id, judul, penulis, isbn, penerbit, tahun_terbit, kategori, jumlah_eksemplar, lokasi_rak, kondisi, status, deskripsi, cover, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           ON CONFLICT (id) DO NOTHING`,
          [
            b.id,
            b.judul,
            b.penulis,
            b.isbn,
            b.penerbit,
            b.tahun_terbit,
            b.kategori,
            b.jumlah_eksemplar,
            b.lokasi_rak,
            b.kondisi,
            b.status,
            b.deskripsi,
            b.cover,
            b.created_at,
            b.updated_at,
          ]
        );
      }
    })
    .catch((err) => {
      console.warn(`[Database] PostgreSQL notice: ${err.message}`);
    });
}

export function getDatabaseStatus() {
  return {
    engine: process.env.DB_HOST ? 'PostgreSQL 16' : 'SQLite WAL',
    host: process.env.DB_HOST || 'local',
    connected: pgConnected || !process.env.DB_HOST,
  };
}


export async function syncBookToPg(book) {
  if (!pgPool) return;
  try {
    await pgPool.query(
      `INSERT INTO books (id, judul, penulis, isbn, penerbit, tahun_terbit, kategori, jumlah_eksemplar, lokasi_rak, kondisi, status, deskripsi, cover, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT (id) DO UPDATE SET
         judul = EXCLUDED.judul,
         penulis = EXCLUDED.penulis,
         isbn = EXCLUDED.isbn,
         penerbit = EXCLUDED.penerbit,
         tahun_terbit = EXCLUDED.tahun_terbit,
         kategori = EXCLUDED.kategori,
         jumlah_eksemplar = EXCLUDED.jumlah_eksemplar,
         lokasi_rak = EXCLUDED.lokasi_rak,
         kondisi = EXCLUDED.kondisi,
         status = EXCLUDED.status,
         deskripsi = EXCLUDED.deskripsi,
         cover = EXCLUDED.cover,
         updated_at = EXCLUDED.updated_at`,
      [
        book.id,
        book.judul,
        book.penulis,
        book.isbn,
        book.penerbit,
        book.tahun_terbit,
        book.kategori,
        book.jumlah_eksemplar,
        book.lokasi_rak,
        book.kondisi,
        book.status,
        book.deskripsi,
        book.cover,
        book.created_at,
        book.updated_at,
      ]
    );
  } catch (err) {
    console.warn('[Database] PostgreSQL sync warning: ' + err.message);
  }
}

export { db, pgPool, uploadsDir };
