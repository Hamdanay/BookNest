# BookNest — Manajemen Koleksi Buku

Alat administrasi lokal untuk mengelola koleksi dan inventaris buku: bibliografi, eksemplar, kondisi, lokasi rak, kategori, status, dan riwayat perubahan. Bukan toko, bukan sistem peminjaman — tanpa harga, keranjang, checkout, atau penjualan.

Aplikasi ini dirancang untuk dijalankan di komputer sendiri (admin lokal). Tombol reset data sampel hanya muncul di lingkungan non-production.

## Demo & repositori

| | |
|---|---|
| **Repositori** | [github.com/Hamdanay/BookNest](https://github.com/Hamdanay/BookNest) |
| **UI live (Vercel)** | [frontend-tau-eight-58.vercel.app](https://frontend-tau-eight-58.vercel.app) |

**Cara menilai project ini (untuk reviewer / dosen):**

1. Buka link Vercel di atas — lihat tampilan UI, navigasi, dan responsivitas.
2. Untuk **data lengkap** (CRUD, dashboard, SQLite): clone repo dan jalankan **backend + frontend di lokal** (langkah di bawah). Pola ini **lumrah** di portofolio: frontend di-host, API dijalankan lokal atau di server sendiri.

Tanpa backend yang berjalan, halaman live hanya menampilkan UI; pesan “tidak dapat memuat data” itu **diharapkan** karena API tidak dipasang di cloud (sengaja — menghindari biaya & kartu kredit di platform hosting).

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

Di development, Vite mem-proxy `/api` dan `/uploads` ke `http://localhost:3002` — tidak perlu mengatur `VITE_API_URL`.

**Urutan yang disarankan:** jalankan backend dulu, baru frontend.

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

## Deploy (setup portofolio — Vercel + backend lokal)

Setup yang dipakai untuk BookNest:

| Lapisan | Di mana | Peran |
|---------|---------|--------|
| **Frontend** | [Vercel](https://vercel.com) | Orang lain bisa buka UI di browser |
| **Backend** | **Lokal** (`npm run dev` di `backend/`) | API + SQLite + upload — cocok untuk demo penuh saat presentasi |

Ini **normal** di dunia coding: banyak portofolio memisahkan **tampilan** (static/SPA di CDN) dan **API** (dijalankan saat demo atau di server terpisah). Di produksi sungguhan pun frontend (Vercel/Netlify) dan backend (Railway, VPS, dll.) sering **tidak** satu tempat.

### Frontend di Vercel (sudah dikonfigurasi)

- **Root directory:** `frontend`
- **Build:** `npm run build` → output `dist`
- **Env:** `VITE_API_URL` **kosong** (tidak wajib) untuk mode “UI saja” di internet.

Deploy ulang dari folder `frontend`:

```bash
cd frontend
npx vercel --prod
```

Atau hubungkan repo GitHub di dashboard Vercel (root `frontend`).

### Backend: tetap lokal

Tidak ada langkah deploy wajib. Cukup bagian [Menjalankan aplikasi](#menjalankan-aplikasi) di atas.

Saat presentasi: buka Vercel untuk UI, atau `localhost:5173` dengan backend aktif untuk pengalaman **100% lengkap**.

### Opsional: API juga di cloud

Kalau nanti punya akses hosting Node (mis. Render/Fly dengan verifikasi kartu), set di Vercel:

- `VITE_API_URL` = URL API (tanpa `/` di akhir)

Lalu redeploy frontend. File `render.yaml` di repo hanya referensi opsional.

## Skema warna

Primary `#3E2A21`, Secondary `#5B3A2A`, Background `#F8F3EE`, Accent `#C99A5A` — sesuai spesifikasi BookNest, dengan UI bertema hutan untuk tampilan modern.
