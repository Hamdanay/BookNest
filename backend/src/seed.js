import { db } from './db.js';
import { INITIAL_BOOKS, INITIAL_CATEGORIES } from './seed-data.js';
import { v4 as uuidv4 } from 'uuid';
import { validateIsbn, withValidChecksum } from './isbn.js';
import { recordCreated } from './history.js';

export function seedDatabase(force = false) {
  const bookCount = db.prepare('SELECT COUNT(*) as c FROM books').get().c;
  if (bookCount > 0 && !force) {
    console.log('Database sudah berisi data. Gunakan force=true untuk reset.');
    return;
  }

  if (force) {
    db.exec('DELETE FROM book_history; DELETE FROM books; DELETE FROM categories; DELETE FROM racks;');
  }

  const insertCat = db.prepare(
    'INSERT INTO categories (id, name, created_at) VALUES (?, ?, ?)'
  );
  const now = new Date().toISOString();
  for (const name of INITIAL_CATEGORIES) {
    insertCat.run(uuidv4(), name, now);
  }

  const insertRack = db.prepare(
    'INSERT INTO racks (id, name, created_at) VALUES (?, ?, ?)'
  );
  const rackNames = [...new Set(INITIAL_BOOKS.map((b) => b.lokasiRak))];
  for (const name of rackNames) {
    insertRack.run(uuidv4(), name, now);
  }

  const insertBook = db.prepare(`
    INSERT INTO books (
      id, judul, penulis, isbn, penerbit, tahun_terbit, kategori,
      jumlah_eksemplar, lokasi_rak, kondisi, status, deskripsi, cover,
      created_at, updated_at
    ) VALUES (
      @id, @judul, @penulis, @isbn, @penerbit, @tahunTerbit, @kategori,
      @jumlahEksemplar, @lokasiRak, @kondisi, @status, @deskripsi, @cover,
      @createdAt, @updatedAt
    )
  `);

  for (const book of INITIAL_BOOKS) {
    const fixed = withValidChecksum(book.isbn);
    const check = validateIsbn(fixed);
    insertBook.run({ ...book, isbn: check.ok ? check.normalized : fixed });
    recordCreated(book.id);
  }

  console.log(
    `Seed selesai: ${INITIAL_CATEGORIES.length} kategori, ${rackNames.length} rak, ${INITIAL_BOOKS.length} buku.`
  );
}

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase(process.argv.includes('--force'));
}
