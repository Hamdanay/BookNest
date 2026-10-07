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

### Opsi A — Semua di Vercel (gratis, disarankan)

Frontend **dan** API Express jalan di satu project Vercel. Folder `api/index.js` mengekspor server Express; `vercel.json` di **root repo** mengarahkan `/api` dan `/uploads` ke function itu.

**Penting:** deploy dari **root repositori**, bukan hanya folder `frontend`.

#### Langkah di dashboard Vercel

1. Buka [vercel.com](https://vercel.com) → project BookNest (atau **Add New** → import repo GitHub).
2. **Settings → General → Root Directory** → kosongkan / set ke **`.`** (root repo).  
   Jika sebelumnya `frontend`, ubah ke root lalu **Save**.
3. **Environment Variables** — untuk pola same-origin **tidak wajib** set `VITE_API_URL` (biarkan kosong).
4. **Deployments** → **Redeploy** (setelah push commit yang berisi `vercel.json` + `api/`).

Vercel akan memakai `installCommand` / `buildCommand` dari `vercel.json` (install `backend` + `frontend`, build Vite ke `frontend/dist`).

#### Langkah lewat CLI (dari root repo)

```bash
cd BookNest   # folder root, bukan frontend
npx vercel --prod
```

Saat ditanya root project, pastikan mengarah ke **root** (file `vercel.json` dan folder `api/` terlihat).

#### Tes cepat setelah deploy

- `https://<domain-kamu>/api/health` → harus `{"ok":true,...}`
- `https://<domain-kamu>/` → UI + data buku (seed otomatis jika DB kosong)

#### Batasan (serverless + SQLite di `/tmp`)

| | |
|---|---|
| **Cocok untuk** | Demo portofolio, reviewer buka link langsung ada data |
| **Database** | SQLite di `/tmp` pada Vercel — **bisa reset** saat cold start / instance baru |
| **Upload cover** | File di `/tmp` — bisa hilang setelah idle; cover URL eksternal tetap aman |
| **Lokal penuh** | Tetap `backend` + `frontend` di komputer — data persisten di `backend/data/` |

Ini trade-off gratis di Vercel tanpa database cloud terpisah. Untuk data permanen di internet, pakai opsi B (Render) atau DB hosted (Turso/Neon) nanti.

#### Coba mirip production di komputer

```bash
npx vercel dev
```

(Jalankan dari root repo; butuh login Vercel CLI.)

---

### Opsi B — Frontend Vercel + API Render (data lebih stabil)

| Bagian | Platform |
|--------|----------|
| Frontend | Vercel, root `frontend` |
| API + SQLite file | [Render](https://render.com) (`render.yaml`) |

1. Deploy API dari `render.yaml`, catat URL API.
2. Di Vercel (project frontend): `VITE_API_URL` = URL Render (tanpa `/` di akhir), redeploy.
3. Di Render: `FRONTEND_URL` = URL Vercel kamu.

Render gratis bisa sleep; verifikasi kartu sering diminta (bukan biaya bulanan wajib).

## Skema warna

Primary `#3E2A21`, Secondary `#5B3A2A`, Background `#F8F3EE`, Accent `#C99A5A` — sesuai spesifikasi BookNest, dengan UI bertema hutan untuk tampilan modern.
