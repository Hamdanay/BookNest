import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, uploadsDir } from './db.js';
import booksRouter from './routes/books.js';
import categoriesRouter from './routes/categories.js';
import dashboardRouter from './routes/dashboard.js';
import seedRouter, { allowSeedReset } from './routes/seed.js';
import racksRouter from './routes/racks.js';
import { seedDatabase } from './seed.js';

const app = express();
const PORT = process.env.PORT || 3002;

const bookCount = db.prepare('SELECT COUNT(*) as c FROM books').get().c;
if (bookCount === 0) {
  seedDatabase(false);
}

function corsOrigin(origin, callback) {
  if (!origin) return callback(null, true);
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return callback(null, true);
  }
  if (origin.endsWith('.vercel.app')) return callback(null, true);
  const allowed = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowed.includes(origin)) return callback(null, true);
  return callback(new Error('CORS tidak diizinkan untuk origin ini'));
}

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const safe = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    cb(null, safe);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Hanya file gambar yang diizinkan'));
    }
    cb(null, true);
  },
});

app.post('/api/upload/cover', upload.single('cover'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'File tidak ditemukan' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

app.use('/api/books', booksRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/racks', racksRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/seed', seedRouter);

app.get('/api/meta', (_req, res) => {
  res.json({
    service: 'BookNest API',
    demo: true,
    allowSeedReset: allowSeedReset(),
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'BookNest API' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Terjadi kesalahan server' });
});

export default app;

const modulePath = fileURLToPath(import.meta.url);
const isMain = process.argv[1] && path.resolve(process.argv[1]) === modulePath;

if (isMain) {
  const server = app.listen(PORT, () => {
    console.log(`BookNest API berjalan di http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `Port ${PORT} sudah dipakai. Tutup server BookNest yang masih berjalan, atau gunakan port lain: $env:PORT=3003; npm run dev`
      );
      process.exit(1);
    }
    throw err;
  });
}
