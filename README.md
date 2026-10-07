# BookNest — Manajemen Koleksi Buku

Alat administrasi lokal untuk mengelola koleksi dan inventaris buku: bibliografi, eksemplar, kondisi, lokasi rak, kategori, status, dan riwayat perubahan. Bukan toko, bukan sistem peminjaman — tanpa harga, keranjang, checkout, atau penjualan.

Aplikasi ini dirancang untuk dijalankan di komputer sendiri (admin lokal). Tombol reset data sampel hanya muncul di lingkungan non-production.

## Struktur proyek

| Folder | Peran |
|--------|--------|
| `booknest_manajemen_koleksi_buku.html` | Prototipe UI statis (referensi desain) |
| `backend/` | REST API (Node.js + Express + SQLite) |
| `frontend/` | UI React + Vite + Tailwind (terhubung ke API) |

## Menjalankan aplikasi

Jalankan backend dan frontend bersamaan.

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

API: `http://localhost:3002` (bisa diubah lewat variabel `PORT`)  
Database: `backend/data/booknest.db` (otomatis di-seed saat pertama kali kosong).

Reset data sampel (hanya jika `NODE_ENV` bukan `production`):

```bash
cd backend
npm run seed -- --force
```

Atau lewat UI: **Pulihkan data sampel**.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka: `http://localhost:5173`

## Aturan data

- **ISBN** harus 10 atau 13 digit, dengan angka periksa yang valid, dan unik di seluruh koleksi.
- **Kondisi / status** saling mengunci, misalnya Rusak Berat tidak bisa Tersedia; Baik tidak bisa Sebagian Rusak.
- **Rak** adalah master data. Nama rak baru dari form buku otomatis tercatat.
- Setiap create/update buku dicatat di **riwayat perubahan**.

## Endpoint API utama

- `GET /api/books` — daftar paginasi `{ items, total, page, pageSize, pageCount }` (`search`, `kategori`, `kondisi`, `status`, `sort`, `page`, `pageSize`)
- `GET /api/books/:id/history` — riwayat perubahan
- `GET/POST/PUT/DELETE /api/books/:id`
- `GET/POST/PUT/DELETE /api/categories`
- `GET/POST/PUT/DELETE /api/racks`
- `GET /api/dashboard/stats`
- `GET /api/meta` — termasuk `allowSeedReset`
- `POST /api/upload/cover` — unggah gambar sampul
- `POST /api/seed/reset` — kembalikan data sampel (ditolak jika `NODE_ENV=production`)

## Tes

```bash
cd backend
npm test

cd ../frontend
npm test
```

## Deploy (publik di internet)

`localhost` hanya bisa dibuka di komputer kamu. Supaya orang lain bisa lihat:

| Bagian | Platform | Alasan |
|--------|----------|--------|
| **Frontend** (React) | [Vercel](https://vercel.com) | Cocok untuk Vite/static |
| **Backend** (Express + SQLite) | [Render](https://render.com) | Butuh proses Node + penyimpanan file; tidak cocok di Vercel serverless |

### 1. API di Render

1. Buka [dashboard Render](https://dashboard.render.com) → **New** → **Blueprint** (atau Web Service dari repo GitHub).
2. Pilih repo **Hamdanay/BookNest** — file `render.yaml` sudah mengarah ke folder `backend`.
3. Setelah deploy, catat URL API, misalnya `https://booknest-api.onrender.com`.
4. Di service Render → **Environment**, tambahkan `FRONTEND_URL` = URL Vercel kamu (setelah langkah 2).

Catatan: plan gratis Render bisa sleep; pertama buka mungkin lambat ±1 menit.

### 2. UI di Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → import **BookNest** dari GitHub.
2. **Root Directory**: `frontend`
3. **Environment Variables**: `VITE_API_URL` = URL Render (tanpa slash di akhir), contoh `https://booknest-api.onrender.com`
4. Deploy.

Atau lewat CLI (dari folder `frontend`):

```bash
npx vercel --prod
```

Set `VITE_API_URL` di Project Settings → Environment Variables, lalu **Redeploy**.

## Skema warna

Primary `#3E2A21`, Secondary `#5B3A2A`, Background `#F8F3EE`, Accent `#C99A5A` — sesuai spesifikasi BookNest, dengan UI bertema hutan untuk tampilan modern.
