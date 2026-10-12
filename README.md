# BookNest — Manajemen Koleksi Buku

[![BookNest CI Pipeline](https://github.com/Hamdanay/BookNest/actions/workflows/ci.yml/badge.svg)](https://github.com/Hamdanay/BookNest/actions/workflows/ci.yml)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue?logo=docker)
![Nginx](https://img.shields.io/badge/Reverse_Proxy-Nginx-009639?logo=nginx)
![SQLite](https://img.shields.io/badge/Database-SQLite_WAL-003B57?logo=sqlite)
![Node.js](https://img.shields.io/badge/Backend-Node.js_20-339933?logo=node.js)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)

Sistem administrasi dan inventaris koleksi buku lokal/internal: bibliografi lengkap, pelacakan eksemplar, kondisi fisik, pemetaan rak, kategori, status ketersediaan, serta riwayat audit perubahan (*audit trail*).

> **Fokus Utama:** Manajemen inventaris fisik murni (bukan toko online, tanpa keranjang/checkout/harga) dengan arsitektur infrastruktur siap produksi, kontainerisasi mandiri, perlindungan integritas database, dan otomatisasi *Disaster Recovery*.

---

## Arsitektur Infrastruktur

Aplikasi ini telah dikontainerisasi penuh menggunakan **Docker Compose** dengan pemisahan tanggung jawab yang terisolasi dan aman di dalam jaringan internal:

```
[ Browser Klien ]
       │
       ▼ (Port Publik: 8080)
┌─────────────────────────────────────────────────────────────┐
│ Docker Network: booknest-net                                │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ booknest-frontend (Nginx Alpine - RAM: ~6.8 MB)       │  │
│  │ ───────────────────────────────────────────────────   │  │
│  │  • Menyajikan berkas statis React SPA (HTML/CSS/JS)   │  │
│  │  • Reverse Proxy: Meneruskan /api/ dan /uploads/      │  │
│  │  • Healthcheck: Wget probe internal setiap 20 detik   │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             │ (Jaringan Privat: Port 3002)  │
│                             ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ booknest-backend (Node.js 20 Slim - RAM: ~14 MB)      │  │
│  │ ───────────────────────────────────────────────────   │  │
│  │  • REST API Express.js (Mode Produksi)                │  │
│  │  • Engine SQLite (WAL Mode) via better-sqlite3        │  │
│  │  • Graceful Shutdown Handler (SIGTERM / SIGINT)       │  │
│  │  • Healthcheck: Node fetch probe ke /api/health       │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             │                               │
└─────────────────────────────┼───────────────────────────────┘
                              ▼
            ┌───────────────────────────────────┐
            │ Persistent Docker Named Volumes   │
            │  • booknest-data    (SQLite DB)   │
            │  • booknest-uploads (Sampul Buku) │
            └───────────────────────────────────┘
```

### Keunggulan Arsitektur:
* **Hemat Sumber Daya (Ultra-Lightweight):** Total penggunaan RAM seluruh kontainer hanya **~20 MB** (Nginx: ~6.8 MB, Node: ~14 MB).
* **Gerbang Tunggal (Reverse Proxy):** Pengguna hanya mengakses port `8080`. Port backend `3002` terkunci di jaringan internal, menghilangkan *CORS issue* sepenuhnya.
* **Orkestrasi Sehat (`service_healthy`):** Frontend hanya diizinkan aktif setelah kontainer Backend terbukti lolos uji kesehatan (*Health Check*).
* **Perlindungan Disk:** Rotasi log kontainer dibatasi maksimal 10 MB (`max-size: 10m`) agar penyimpanan server tidak habis.

---

## Menjalankan Aplikasi (Metode Utama: Docker)

Pastikan **Docker Desktop** (atau Docker Engine di Linux) sudah berjalan.

### 1. Nyalakan Seluruh Sistem
Di root repositori, jalankan:
```bash
docker compose up -d
```

Buka di browser:
* **Aplikasi BookNest:** [http://localhost:8080](http://localhost:8080)
* **Status Kesehatan API:** [http://localhost:8080/api/health](http://localhost:8080/api/health)

### 2. Memeriksa Status Kontainer
```bash
docker compose ps
```
Kedua kontainer akan berstatus **`Up (healthy)`**.

### 3. Mematikan Sistem
```bash
docker compose down
```
*(Seluruh data buku dan sampul tetap tersimpan aman di Docker Named Volume).*

---

## Otomatisasi Backup & Disaster Recovery

Untuk menjamin kelangsungan operasional dan mencegah kehilangan data, proyek ini dilengkapi sistem pemeliharaan otomatis:

### 1. Online Snapshot, Integrity Check & Off-site Cloud Backup (`backup.ps1` / `backup.sh`)
* **Pencegahan Silent Corruption:** Menjalankan `PRAGMA integrity_check` sebelum backup. Jika ada kerusakan struktur, backup otomatis dibatalkan (*ABORT*) agar tidak menyalin data korup.
* **Zero-Downtime Snapshot:** Memanfaatkan **SQLite Online Backup API** (`db.backup()`) untuk menyalin data tingkat memori secara konsisten tanpa mematikan aplikasi web.
* **Kebijakan Retensi (7 Hari):** Otomatis mendeteksi dan menghapus berkas backup lama yang berusia lebih dari 7 hari agar disk tetap lega.
* **Off-site Cloud Redundancy (Standar 3-2-1):** Selain tersimpan lokal di `backups/`, skrip otomatis mengunggah berkas fisik `.db` sebagai dokumen lampiran ke **Telegram Cloud Bot**, memastikan data tetap aman meskipun harddisk laptop rusak.

**Cara Eksekusi Manual:**
* **Windows (PowerShell):**
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts\backup.ps1
  ```
* **Linux (Bash):**
  ```bash
  bash scripts/backup.sh
  ```
*(Hasil backup tersimpan di folder `backups/booknest_backup_YYYYMMDD_HHMMSS.db`).*

### 2. Pemulihan Bencana / Restore Instan (`restore.ps1` / `restore.sh`)
Jika terjadi kerusakan fatal atau data tidak sengaja terhapus, sistem dapat dipulihkan dalam **~3 detik**:

* **Windows (PowerShell):**
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts\restore.ps1
  ```
* **Linux (Bash):**
  ```bash
  bash scripts/restore.sh
  ```
Skrip akan otomatis mengambil file backup terbaru, membersihkan residu WAL/SHM lama, menyuntikkan database yang sehat, me-restart backend, dan memverifikasi kesehatan endpoint `/api/health`.

### 3. Penjadwalan Otomatis
* **Linux (Crontab):** Tambahkan `0 2 * * * /bin/bash /path/to/scripts/backup.sh` untuk backup harian jam 02:00 pagi.
* **Windows (Task Scheduler):** Daftarkan `scripts/backup.ps1` sebagai tugas harian terjadwal.

---

## CI/CD Pipeline (GitHub Actions)

Setiap ada perubahan kode yang di-*push* ke branch `main`, pipeline [`.github/workflows/ci.yml`](.github/workflows/ci.yml) otomatis menjalankan:
1. **Automated Unit & Integration Testing (18 Tests):**
   * **API Integration Tests (Supertest):** Menguji langsung endpoint HTTP Express nyata (`/api/health`, `/api/meta`, `/api/books`, `/api/categories`, `/api/racks`, `/api/dashboard/stats`, serta penanganan error 404 & 400).
   * **Domain Business Logic:** Validasi rumus checksum matematis ISBN-10 dan ISBN-13.
   * **Inventory Integrity:** Pengujian logika sinkronisasi kondisi fisik vs status ketersediaan buku.
2. **Container Build Verification:**
   * Memverifikasi keberhasilan *multi-stage build* backend dan frontend di mesin virtual Ubuntu GitHub Runner.

---

## Aturan Bisnis & Integritas Data

* **ISBN:** Wajib 10 atau 13 digit dengan angka periksa valid, unik di seluruh koleksi.
* **Kondisi & Status Terkunci:**
  * *Rusak Berat* dilarang berstatus *Tersedia*.
  * *Baik* dilarang berstatus *Sebagian Rusak*.
* **Sinkronisasi Rak Otomatis:** Input lokasi rak baru pada form buku otomatis dicatat ke master data rak.
* **Audit Trail (Riwayat Perubahan):** Setiap penambahan dan modifikasi buku dicatat secara mendalam per atribut di tabel `book_history`.

---

## Alternatif: Menjalankan Tanpa Docker (Development Lokal)

Jika ingin menjalankan kode secara manual untuk keperluan modifikasi cepat:

### Backend
```bash
cd backend
npm install
npm run dev
```
API berjalan di `http://localhost:3002`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
UI berjalan di `http://localhost:5173`.

### Pengujian Lokal
```bash
cd backend && npm test
cd ../frontend && npm test
```

---

## 🎨 Desain & Tema Visual

Antarmuka mengusung tema **Woodland / Vintage Folio** yang elegan dengan palet warna bumi:
* Primary: `#3E2A21`
* Secondary: `#5B3A2A`
* Background: `#F8F3EE`
* Accent Gold: `#C99A5A`
* Olive Green: `#6C7A5A`
