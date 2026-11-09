# Stage 1: Build React Vite app
FROM node:20.18-bookworm-slim AS builder

WORKDIR /app

# Salin definisi dependensi sebelum source code untuk mengoptimalkan layer caching
COPY package*.json ./
RUN npm ci || npm install

# Salin source code dan jalankan proses kompilasi
COPY . .
RUN npm run build

# Stage 2: Serve dengan Nginx versi spesifik yang super ringan
FROM nginx:1.27.2-alpine AS runner

# Salin konfigurasi Nginx reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin aset statis hasil kompilasi dari stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Port web server
EXPOSE 80

# Exec form CMD
CMD ["nginx", "-g", "daemon off;"]
