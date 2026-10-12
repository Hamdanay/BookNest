#!/bin/bash
# ==============================================================================
# Script: backup.sh
# Deskripsi: Otomatisasi Backup Database BookNest dengan Notifikasi & Upload Telegram (Linux)
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"

# Baca konfigurasi Telegram jika ada
ENV_FILE="$SCRIPT_DIR/.backup.env"
if [ -f "$ENV_FILE" ]; then
  export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

send_telegram_msg() {
  local msg="$1"
  if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ] && [ "$TELEGRAM_BOT_TOKEN" != "masukkan_bot_token_disini" ]; then
    curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
      -d chat_id="$TELEGRAM_CHAT_ID" \
      -d text="$msg" > /dev/null || true
  fi
}

send_telegram_doc() {
  local file="$1"
  local caption="$2"
  if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ] && [ "$TELEGRAM_BOT_TOKEN" != "masukkan_bot_token_disini" ]; then
    curl -s -F "chat_id=$TELEGRAM_CHAT_ID" \
            -F "document=@$file" \
            -F "caption=$caption" \
            "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendDocument" > /dev/null || true
  fi
}

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/booknest_backup_$TIMESTAMP.db"

echo "=========================================="
echo " [1/3] Menjalankan SQLite Online Backup..."
echo "=========================================="

# Eksekusi online backup di dalam kontainer
if ! docker exec booknest-backend node src/backup-cli.js /tmp/snapshot.db; then
  echo "[ERROR] Backup gagal!"
  FAIL_MSG="[BookNest] Backup Database GAGAL! Waktu: $(date '+%Y-%m-%d %H:%M:%S')"
  send_telegram_msg "$FAIL_MSG"
  exit 1
fi

echo "[2/3] Menyalin snapshot ke: $BACKUP_FILE"
docker cp booknest-backend:/tmp/snapshot.db "$BACKUP_FILE"
docker exec booknest-backend rm /tmp/snapshot.db

# Kompresi file backup dengan gzip untuk menghemat disk server
gzip -k "$BACKUP_FILE"
COMPRESSED_FILE="${BACKUP_FILE}.gz"
FILE_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)

echo "[3/3] Menjalankan Retention Policy (hapus backup > 7 hari)..."
find "$BACKUP_DIR" -type f -name "booknest_backup_*.db*" -mtime +7 -delete

echo "=========================================="
echo "[SUKSES] Backup selesai: $COMPRESSED_FILE"
echo "=========================================="

# Kirim pesan status dan upload dokumen terkompresi ke Telegram
SUCCESS_MSG="[BookNest] Backup Database Berhasil! File: $(basename "$COMPRESSED_FILE") ($FILE_SIZE) - $(date '+%Y-%m-%d %H:%M:%S')"
send_telegram_msg "$SUCCESS_MSG"

send_telegram_doc "$COMPRESSED_FILE" "Salinan Fisik Off-site: $(basename "$COMPRESSED_FILE") ($FILE_SIZE)"
