/**
 * Entry serverless Vercel — mengekspor app Express BookNest.
 * Semua /api/* dan /uploads/* diarahkan ke sini lewat vercel.json di root repo.
 */
import app from '../backend/src/server.js';

export default app;
