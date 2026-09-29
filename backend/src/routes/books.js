import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { rowToBook } from '../book-mapper.js';
import { DEFAULT_COVER, KONDISI_OPTIONS, STATUS_OPTIONS } from '../seed-data.js';
import { digitsOnly, isbnDigitsSql, isbnLookupNeedle, validateIsbn } from '../isbn.js';
import { validateKondisiStatus } from '../inventory-rules.js';
import { listHistory, recordBookUpdate, recordCreated } from '../history.js';

const router = Router();

function isbnTaken(isbn, exceptId = null) {
  const needle = digitsOnly(isbn);
  const rows = db.prepare('SELECT id, isbn FROM books').all();
  return rows.some((row) => digitsOnly(row.isbn) === needle && row.id !== exceptId);
}

function buildBookQuery(filters) {
  const { search, kategori, kondisi, status, sort } = filters;
  const conditions = [];
  const params = [];

  if (search) {
    const term = `%${search.toLowerCase()}%`;
    const isbnNeedle = isbnLookupNeedle(search);
    if (isbnNeedle) {
      conditions.push(
        `(LOWER(judul) LIKE ? OR LOWER(penulis) LIKE ? OR LOWER(isbn) LIKE ? OR LOWER(penerbit) LIKE ? OR ${isbnDigitsSql()} LIKE ?)`
      );
      params.push(term, term, term, term, `%${isbnNeedle}%`);
    } else {
      conditions.push(
        '(LOWER(judul) LIKE ? OR LOWER(penulis) LIKE ? OR LOWER(isbn) LIKE ? OR LOWER(penerbit) LIKE ?)'
      );
      params.push(term, term, term, term);
    }
  }
  if (kategori) {
    conditions.push('kategori = ?');
    params.push(kategori);
  }
  if (kondisi) {
    conditions.push('kondisi = ?');
    params.push(kondisi);
  }
  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  let orderBy = 'judul ASC';
  switch (sort) {
    case 'judul-desc':
      orderBy = 'judul DESC';
      break;
    case 'tahun-desc':
      orderBy = 'tahun_terbit DESC';
      break;
    case 'tahun-asc':
      orderBy = 'tahun_terbit ASC';
      break;
    default:
      orderBy = 'judul ASC';
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params, orderBy };
}

function ensureRack(name) {
  const trimmed = name.trim();
  const exists = db.prepare('SELECT id FROM racks WHERE name = ?').get(trimmed);
  if (!exists) {
    db.prepare('INSERT INTO racks (id, name, created_at) VALUES (?, ?, ?)').run(
      uuidv4(),
      trimmed,
      new Date().toISOString()
    );
  }
  return trimmed;
}

function validatePayload(body, { partial = false } = {}) {
  if (!partial) {
    const required = [
      'judul',
      'penulis',
      'isbn',
      'penerbit',
      'tahunTerbit',
      'kategori',
      'jumlahEksemplar',
      'lokasiRak',
      'kondisi',
      'status',
    ];
    for (const field of required) {
      if (body[field] === undefined || body[field] === '') {
        return { error: `Field ${field} wajib diisi` };
      }
    }
  }
  if (body.kondisi && !KONDISI_OPTIONS.includes(body.kondisi)) {
    return { error: 'Kondisi tidak valid' };
  }
  if (body.status && !STATUS_OPTIONS.includes(body.status)) {
    return { error: 'Status tidak valid' };
  }
  if (body.kondisi && body.status) {
    const pair = validateKondisiStatus(body.kondisi, body.status);
    if (!pair.ok) return { error: pair.error };
  }
  if (body.isbn) {
    const check = validateIsbn(body.isbn.trim());
    if (!check.ok) return { error: check.error };
    body.isbn = check.normalized;
  }
  return {};
}

router.get('/', (req, res) => {
  const {
    search = '',
    kategori = '',
    kondisi = '',
    status = '',
    sort = 'judul-asc',
    page = '1',
    pageSize = '8',
  } = req.query;

  const { where, params, orderBy } = buildBookQuery({
    search: String(search).trim(),
    kategori: String(kategori),
    kondisi: String(kondisi),
    status: String(status),
    sort: String(sort),
  });

  const total = db.prepare(`SELECT COUNT(*) as c FROM books ${where}`).get(...params).c;
  const size = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 8));
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const offset = (pageNum - 1) * size;
  const rows = db
    .prepare(`SELECT * FROM books ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
    .all(...params, size, offset);

  res.json({
    items: rows.map(rowToBook),
    total,
    page: pageNum,
    pageSize: size,
    pageCount: Math.max(1, Math.ceil(total / size)),
  });
});

router.get('/:id/history', (req, res) => {
  const row = db.prepare('SELECT id FROM books WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Buku tidak ditemukan' });
  res.json(listHistory(req.params.id));
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Buku tidak ditemukan' });
  res.json(rowToBook(row));
});

router.post('/', (req, res) => {
  const body = { ...req.body };
  const invalid = validatePayload(body);
  if (invalid.error) return res.status(400).json({ error: invalid.error });
  if (isbnTaken(body.isbn)) {
    return res.status(409).json({ error: 'ISBN sudah terdaftar pada judul lain' });
  }

  const now = new Date().toISOString();
  const id = uuidv4();
  const cover = body.cover?.trim() || DEFAULT_COVER;
  const lokasiRak = ensureRack(body.lokasiRak);

  db.prepare(
    `INSERT INTO books (
      id, judul, penulis, isbn, penerbit, tahun_terbit, kategori,
      jumlah_eksemplar, lokasi_rak, kondisi, status, deskripsi, cover,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    body.judul.trim(),
    body.penulis.trim(),
    body.isbn.trim(),
    body.penerbit.trim(),
    Number(body.tahunTerbit),
    body.kategori,
    Number(body.jumlahEksemplar),
    lokasiRak,
    body.kondisi,
    body.status,
    body.deskripsi?.trim() ?? '',
    cover,
    now,
    now
  );

  recordCreated(id);
  const row = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
  res.status(201).json(rowToBook(row));
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Buku tidak ditemukan' });

  const body = { ...req.body };
  const merged = {
    judul: body.judul ?? existing.judul,
    penulis: body.penulis ?? existing.penulis,
    isbn: body.isbn ?? existing.isbn,
    penerbit: body.penerbit ?? existing.penerbit,
    tahunTerbit: body.tahunTerbit ?? existing.tahun_terbit,
    kategori: body.kategori ?? existing.kategori,
    jumlahEksemplar: body.jumlahEksemplar ?? existing.jumlah_eksemplar,
    lokasiRak: body.lokasiRak ?? existing.lokasi_rak,
    kondisi: body.kondisi ?? existing.kondisi,
    status: body.status ?? existing.status,
    deskripsi: body.deskripsi ?? existing.deskripsi,
    cover: body.cover ?? existing.cover,
  };
  const invalid = validatePayload(merged);
  if (invalid.error) return res.status(400).json({ error: invalid.error });
  if (isbnTaken(merged.isbn, req.params.id)) {
    return res.status(409).json({ error: 'ISBN sudah terdaftar pada judul lain' });
  }

  const now = new Date().toISOString();
  const lokasiRak = ensureRack(String(merged.lokasiRak));
  const next = {
    judul: String(merged.judul).trim(),
    penulis: String(merged.penulis).trim(),
    isbn: String(merged.isbn).trim(),
    penerbit: String(merged.penerbit).trim(),
    tahunTerbit: Number(merged.tahunTerbit),
    kategori: merged.kategori,
    jumlahEksemplar: Number(merged.jumlahEksemplar),
    lokasiRak,
    kondisi: merged.kondisi,
    status: merged.status,
    deskripsi: String(merged.deskripsi ?? '').trim(),
    cover: String(merged.cover ?? '').trim() || existing.cover || DEFAULT_COVER,
  };

  recordBookUpdate(existing, next);

  db.prepare(
    `UPDATE books SET
      judul = ?, penulis = ?, isbn = ?, penerbit = ?, tahun_terbit = ?,
      kategori = ?, jumlah_eksemplar = ?, lokasi_rak = ?, kondisi = ?,
      status = ?, deskripsi = ?, cover = ?, updated_at = ?
    WHERE id = ?`
  ).run(
    next.judul,
    next.penulis,
    next.isbn,
    next.penerbit,
    next.tahunTerbit,
    next.kategori,
    next.jumlahEksemplar,
    next.lokasiRak,
    next.kondisi,
    next.status,
    next.deskripsi,
    next.cover,
    now,
    req.params.id
  );

  const row = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  res.json(rowToBook(row));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Buku tidak ditemukan' });
  }
  db.prepare('DELETE FROM book_history WHERE book_id = ?').run(req.params.id);
  res.status(204).send();
});

export default router;
