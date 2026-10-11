#!/bin/bash
# ==============================================================================
# Script: backup.sh
# Deskripsi: Otomatisasi Backup Database BookNest untuk Linux Server / Cronjob
# ==============================================================================

set -e

# Lokasi folder backup
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/booknest_backup_$TIMESTAMP.db"

echo "=========================================="
echo " [1/3] Menjalankan SQLite Online Backup..."
echo "=========================================="

# Eksekusi online backup di dalam kontainer
docker exec booknest-backend node src/backup-cli.js /tmp/snapshot.db

echo "[2/3] Menyalin snapshot ke: $BACKUP_FILE"
docker cp booknest-backend:/tmp/snapshot.db "$BACKUP_FILE"
docker exec booknest-backend rm /tmp/snapshot.db

# Kompresi file backup dengan gzip untuk menghemat disk server
gzip "$BACKUP_FILE"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

echo "[3/3] Menjalankan Retention Policy (hapus backup > 7 hari)..."
find "$BACKUP_DIR" -type f -name "booknest_backup_*.db.gz" -mtime +7 -delete

echo "=========================================="
echo "[SUKSES] Backup selesai: $COMPRESSED_FILE"
echo "=========================================="
