import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from './server.js';

test('Integration Test: GET /api/health mengembalikan status 200 dan format ok', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.service, 'BookNest Rusak');
});

test('Integration Test: GET /api/meta mengembalikan metadata layanan', async () => {
  const res = await request(app).get('/api/meta');
  assert.equal(res.status, 200);
  assert.equal(res.body.service, 'BookNest API');
  assert.equal(typeof res.body.allowSeedReset, 'boolean');
});

test('Integration Test: GET /api/categories mengembalikan daftar kategori berupa array', async () => {
  const res = await request(app).get('/api/categories');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length > 0);
  assert.ok(res.body[0].name);
});

test('Integration Test: GET /api/racks mengembalikan daftar rak berupa array', async () => {
  const res = await request(app).get('/api/racks');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length > 0);
  assert.ok(res.body[0].name);
});

test('Integration Test: GET /api/dashboard/stats mengembalikan ringkasan statistik inventaris', async () => {
  const res = await request(app).get('/api/dashboard/stats');
  assert.equal(res.status, 200);
  assert.ok(res.body.stats);
  assert.equal(typeof res.body.stats.totalJudul, 'number');
  assert.equal(typeof res.body.stats.totalEksemplar, 'number');
  assert.ok(res.body.byCategory);
  assert.ok(res.body.byRack);
});

test('Integration Test: GET /api/books mengembalikan data terpaginasi yang valid', async () => {
  const res = await request(app).get('/api/books?page=1&pageSize=5');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.items));
  assert.equal(res.body.page, 1);
  assert.equal(res.body.pageSize, 5);
  assert.ok(typeof res.body.total === 'number');
  assert.ok(typeof res.body.pageCount === 'number');
});

test('Integration Test: GET /api/books/:id dengan ID salah mengembalikan 404 Not Found', async () => {
  const res = await request(app).get('/api/books/id-buku-fiktif-yang-pasti-tidak-ada');
  assert.equal(res.status, 404);
  assert.ok(res.body.error);
});

test('Integration Test: POST /api/books menolak data dengan ISBN tidak valid', async () => {
  const payloadBukuSalah = {
    judul: 'Buku Test Salah',
    penulis: 'Tester',
    isbn: '1234567890123', // Checksum palsu / salah
    penerbit: 'Pustaka Test',
    tahunTerbit: 2026,
    kategori: 'Fiksi',
    jumlahEksemplar: 2,
    lokasiRak: 'Rak A1',
    kondisi: 'Baik',
    status: 'Tersedia',
  };

  const res = await request(app).post('/api/books').send(payloadBukuSalah);
  assert.equal(res.status, 400);
  assert.ok(res.body.error.includes('ISBN'));
});
