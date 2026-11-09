-- Schema PostgreSQL BookNest
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

CREATE INDEX IF NOT EXISTS idx_books_judul ON books(judul);
CREATE INDEX IF NOT EXISTS idx_books_kategori ON books(kategori);
CREATE INDEX IF NOT EXISTS idx_history_book ON book_history(book_id, created_at);
