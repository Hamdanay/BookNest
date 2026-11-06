# Format entry proyek — web portofolio

Paket ini untuk **satu kartu** di section Projects + **halaman detail** (jika porto punya routing `/projects/[slug]`).

## Skema data (`project.json`)

| Field | Tipe | Wajib | Dipakai di |
|-------|------|-------|------------|
| `slug` | string | ya | URL unik, mis. `booknest-infra` |
| `title` | string | ya | Kartu + hero halaman detail |
| `subtitle` | string | opsional | Satu baris di bawah judul |
| `role` | string | ya | Kartu atau detail |
| `summary` | string | ya | 1–2 kalimat di kartu (max ~220 karakter) |
| `description` | string | ya | Paragraf di halaman detail |
| `highlights` | string[] | ya | 3–6 bullet (kartu bisa tampil 3 pertama) |
| `tags` | string[] | ya | Chip/stack di kartu |
| `links` | `{ label, url }[]` | ya | GitHub, demo, CI, dll. |
| `thumbnail` | string | ya | Path gambar relatif ke `public/` porto |
| `gallery` | `{ src, caption, alt }[]` | untuk detail | Urutan = urutan di halaman |
| `featured` | boolean | opsional | Pin di atas daftar proyek |
| `category` | string | opsional | Mis. `devops`, `fullstack` |
| `relatedSlugs` | string[] | opsional | Mis. `booknest-web` |

## Mapping ke UI umum

```
Section Projects (grid)
└── Card: thumbnail + title + summary + tags + links[0]

/projects/booknest-infra (detail)
├── Hero: title + role + links
├── description
├── highlights (list)
├── gallery[] (figure + caption)
└── tags
```

## Asset BookNest Infra

Salin folder `docs/portfolio/booknest-infra/*` ke porto, misalnya:

`public/images/projects/booknest-infra/`

Lalu sesuaikan path di `project.json` (contoh: `/images/projects/booknest-infra/thumbnail.png`).

## Dua entri BookNest

| slug | Fokus |
|------|--------|
| `booknest-web` | Aplikasi inventaris (demo Vercel) |
| `booknest-infra` | Docker, CI/CD, backup, DR |

Satu repo GitHub boleh dipakai di keduanya; bedakan `summary`, `tags`, dan `thumbnail`.
