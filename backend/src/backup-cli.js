import { db } from './db.js';

const targetPath = process.argv[2] || 'data/backup-temp.db';

try {
  // 1. Pemeriksaan Integritas Database (Mencegah Silent Corruption)
  console.log('[INTEGRITY CHECK] Memeriksa struktur integritas database...');
  const check = db.prepare('PRAGMA integrity_check').get();
  const status = check?.integrity_check || Object.values(check || {})[0];

  if (status !== 'ok') {
    console.error(`[CRITICAL] Kerusakan terdeteksi pada database: ${status}`);
    console.error('[ABORT] Backup dibatalkan untuk mencegah penyalinan file yang korup!');
    process.exit(1);
  }
  console.log('[INTEGRITY CHECK OK] Struktur database 100% valid dan sehat.');

  // 2. Eksekusi SQLite Online Backup API (Snapshot atomik page-by-page)
  await db.backup(targetPath);
  console.log(`[OK] Backup konsisten berhasil disimpan ke: ${targetPath}`);
  process.exit(0);
} catch (err) {
  console.error('[ERROR] Gagal melakukan backup:', err.message);
  process.exit(1);
}
