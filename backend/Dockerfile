FROM node:20-slim

WORKDIR /app

# Salin definisi dependensi
COPY package*.json ./

# Install dependensi produksi
RUN npm ci --omit=dev || npm install --omit=dev

# Salin seluruh kode backend
COPY . .

# Buat folder data dan uploads jika belum ada
RUN mkdir -p data uploads

EXPOSE 3002

ENV NODE_ENV=production
ENV PORT=3002

CMD ["node", "src/server.js"]
