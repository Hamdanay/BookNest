# Stage 1: Build React Vite app
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .
RUN npm run build

# Stage 2: Serve dengan Nginx yang super ringan
FROM nginx:alpine

# Salin konfigurasi Nginx reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin hasil build dari Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
