FROM node:20-slim

WORKDIR /app

# Salin definisi dependensi
COPY package*.json ./

# Install dependensi produksi
RUN npm ci --omit=dev || npm install --omit=dev

# Salin seluruh kode backend
COPY . .

# Buat folder data dan uploads jika belum ada, dan alihkan kepemilikan ke user 'node'
RUN mkdir -p data uploads && chown -R node:node /app

# DevSecOps Hardening: Jalankan aplikasi menggunakan user 'node' (non-root) untuk keamanan
USER node

EXPOSE 3002

ENV NODE_ENV=production
ENV PORT=3002

CMD ["node", "src/server.js"]
