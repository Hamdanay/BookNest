import { Router } from 'express';
import { seedDatabase } from '../seed.js';

const router = Router();

export function allowSeedReset() {
  return process.env.NODE_ENV !== 'production';
}

router.post('/reset', (_req, res) => {
  if (!allowSeedReset()) {
    return res.status(403).json({ error: 'Reset data sampel dinonaktifkan di production' });
  }
  try {
    seedDatabase(true);
    res.json({ message: 'Data dikembalikan ke sampel awal' });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Gagal reset data' });
  }
});

export default router;
