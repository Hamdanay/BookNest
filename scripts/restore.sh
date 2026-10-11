#!/bin/bash
# ==============================================================================
# Script: restore.sh
# Deskripsi: Skrip Pemulihan Bencana (Disaster Recovery) untuk Linux Server
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
  # Ambil backup terbaru
  BACKUP_FILE=$(ls -t "$BACKUP_DIR"/booknest_backup_*.db* 2>/dev/null | head -n 1)
fi

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "[ERROR] File backup tidak ditemukan!"
  exit 1
fi

echo "=========================================="
echo " [DISASTER RECOVERY] Memulihkan Database"
echo " File: $BACKUP_FILE"
echo "=========================================="

TEMP_RESTORE="/tmp/restore_target.db"

# Jika terkompresi .gz, ekstrak dulu
if [[ "$BACKUP_FILE" == *.gz ]]; then
  echo "[1/4] Mengekstrak file .gz..."
  gunzip -c "$BACKUP_FILE" > "$TEMP_RESTORE"
else
  cp "$BACKUP_FILE" "$TEMP_RESTORE"
fi

echo "[2/4] Membersihkan file WAL/SHM lama di kontainer..."
docker exec booknest-backend rm -f /app/data/booknest.db-wal /app/data/booknest.db-shm

echo "[3/4] Menyalin data pemulihan ke database aktif..."
docker cp "$TEMP_RESTORE" booknest-backend:/app/data/booknest.db
rm -f "$TEMP_RESTORE"

echo "[4/4] Me-restart backend container..."
docker compose restart backend

sleep 2
echo "=========================================="
echo "[SUKSES] Database berhasil dipulihkan!"
echo "=========================================="
