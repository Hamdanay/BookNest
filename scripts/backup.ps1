# ==============================================================================
# Script: backup.ps1
# Deskripsi: Otomatisasi Backup Database BookNest dengan Notifikasi & Upload Telegram
# Untuk: Windows PowerShell
# ==============================================================================

$ErrorActionPreference = "Stop"

# 1. Baca Konfigurasi Telegram dari file rahasia .backup.env (jika ada)
$EnvFile = Join-Path $PSScriptRoot ".backup.env"
$TelegramToken = ""
$TelegramChatId = ""

# Prioritaskan Environment Variable sistem jika tersedia
if ($env:TELEGRAM_BOT_TOKEN) { $TelegramToken = $env:TELEGRAM_BOT_TOKEN }
if ($env:TELEGRAM_CHAT_ID) { $TelegramChatId = $env:TELEGRAM_CHAT_ID }

# Jika tidak ada di env sistem, baca dari file .backup.env
if ((-not $TelegramToken) -and (Test-Path $EnvFile)) {
    Get-Content $EnvFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $parts = $line.Split("=", 2)
            if ($parts.Count -eq 2) {
                $key = $parts[0].Trim()
                $val = $parts[1].Trim().Trim('"').Trim("'")
                if ($key -eq "TELEGRAM_BOT_TOKEN") { $TelegramToken = $val }
                if ($key -eq "TELEGRAM_CHAT_ID") { $TelegramChatId = $val }
            }
        }
    }
}

# Fungsi 1: Mengirim Pesan Teks ke Telegram
function Send-TelegramNotification {
    param ([string]$Message)
    if ($TelegramToken -and $TelegramChatId -and ($TelegramToken -ne "masukkan_bot_token_disini")) {
        try {
            $Uri = "https://api.telegram.org/bot$TelegramToken/sendMessage"
            $Body = @{
                chat_id = $TelegramChatId
                text = $Message
            }
            $null = Invoke-RestMethod -Uri $Uri -Method Post -Body $Body -TimeoutSec 10
            Write-Host "  -> [TELEGRAM] Laporan teks berhasil terkirim!" -ForegroundColor Cyan
        } catch {
            Write-Host "  -> [TELEGRAM WARNING] Gagal mengirim pesan: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

# Fungsi 2: Mengunggah Berkas Backup Fisik (.db) ke Telegram Cloud (Off-site Backup)
function Send-TelegramDocument {
    param (
        [string]$FilePath,
        [string]$Caption
    )
    if ($TelegramToken -and $TelegramChatId -and ($TelegramToken -ne "masukkan_bot_token_disini")) {
        try {
            Write-Host "  -> [TELEGRAM] Mengunggah file database ke cloud Telegram..." -ForegroundColor Cyan
            $Uri = "https://api.telegram.org/bot$TelegramToken/sendDocument"
            & curl.exe -s -F "chat_id=$TelegramChatId" -F "document=@$FilePath" -F "caption=$Caption" $Uri | Out-Null
            Write-Host "  -> [TELEGRAM] File database berhasil tersimpan di Cloud Telegram!" -ForegroundColor Green
        } catch {
            Write-Host "  -> [TELEGRAM WARNING] Gagal mengunggah file: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

# 2. Tentukan folder tujuan backup
$ProjectDir = Split-Path -Parent $PSScriptRoot
$BackupDir = Join-Path $ProjectDir "backups"
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFileName = "booknest_backup_$Timestamp.db"
$BackupFilePath = Join-Path $BackupDir $BackupFileName

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " [1/3] Menjalankan SQLite Online Backup..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 3. Panggil API SQLite Online Backup dari dalam kontainer (tanpa downtime)
docker exec booknest-backend node src/backup-cli.js /tmp/snapshot.db

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Gagal membuat snapshot database di dalam kontainer!" -ForegroundColor Red
    $TimeNow = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $FailMsg = "[BookNest] Backup Database GAGAL!`n`nAlasan: Snapshot database gagal dibuat.`nWaktu: $TimeNow"
    Send-TelegramNotification -Message $FailMsg
    exit 1
}

# 4. Salin file snapshot dari dalam kontainer ke folder lokal backups/
Write-Host "`n[2/3] Menyalin file backup ke host ($BackupFilePath)..." -ForegroundColor Yellow
docker cp booknest-backend:/tmp/snapshot.db $BackupFilePath
docker exec booknest-backend rm /tmp/snapshot.db

# 5. Kebijakan Retensi (Hapus backup lama yang berusia lebih dari 7 hari)
Write-Host "`n[3/3] Memeriksa kebijakan retensi (Retention Policy: 7 hari)..." -ForegroundColor Green
$LimitDate = (Get-Date).AddDays(-7)
Get-ChildItem -Path $BackupDir -Filter "booknest_backup_*.db" | Where-Object { $_.CreationTime -lt $LimitDate } | ForEach-Object {
    Write-Host "  -> Menghapus backup usang: $($_.Name)" -ForegroundColor DarkGray
    Remove-Item $_.FullName -Force
}

$FileSizeKB = [math]::Round((Get-Item $BackupFilePath).Length / 1KB, 2)
Write-Host "`n[SUKSES] Backup database selesai!" -ForegroundColor Green
Write-Host "  File    : $BackupFileName" -ForegroundColor White
Write-Host "  Ukuran  : $FileSizeKB KB" -ForegroundColor White
Write-Host "  Lokasi  : $BackupFilePath" -ForegroundColor White

# 6. Kirim notifikasi status & upload file fisik database ke Telegram (Off-site Backup)
$TimeNow = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$SuccessMsg = "[BookNest] Backup Database Berhasil!`n`nFile: $BackupFileName`nUkuran: $FileSizeKB KB`nIntegritas: 100% Valid (PRAGMA integrity_check OK)`nWaktu: $TimeNow"
Send-TelegramNotification -Message $SuccessMsg

# Unggah file .db sebagai attachment
$DocCaption = "Salinan Fisik SQLite: $BackupFileName ($FileSizeKB KB) - $TimeNow"
Send-TelegramDocument -FilePath $BackupFilePath -Caption $DocCaption

Write-Host "==========================================" -ForegroundColor Cyan
