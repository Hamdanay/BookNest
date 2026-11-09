# Stage 1: Build & Dependencies
FROM node:20.18-bookworm-slim AS builder

WORKDIR /app

# Salin definisi dependensi terlebih dahulu agar cache layer termanfaatkan
COPY package*.json ./

# Pasang dependensi produksi
RUN npm ci --omit=dev || npm install --omit=dev

# Stage 2: Runtime Image yang Minimalis dan Aman
FROM node:20.18-bookworm-slim AS runner

WORKDIR /app

# Variabel Lingkungan
ENV NODE_ENV=production
ENV PORT=3002

# Salin node_modules hasil instalasi dari stage builder
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Salin seluruh kode aplikasi
COPY . .

# Buat direktori penyimpanan lokal dan tetapkan kepemilikan ke user non-root 'node'
RUN mkdir -p data uploads && chown -R node:node /app

# DevSecOps Hardening: Jalankan container dengan user non-root untuk keamanan
USER node

# Port internal yang dibuka oleh aplikasi Express
EXPOSE 3002

# Exec form CMD
CMD ["node", "src/server.js"]
