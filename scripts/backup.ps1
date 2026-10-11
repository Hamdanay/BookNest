# ==============================================================================
# Script: backup.ps1
# Deskripsi: Otomatisasi Backup Database BookNest (SQLite Online Backup)
# Untuk: Windows PowerShell
# ==============================================================================

$ErrorActionPreference = "Stop"

# 1. Tentukan folder tujuan backup
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

# 2. Panggil API SQLite Online Backup dari dalam kontainer (tanpa downtime)
docker exec booknest-backend node src/backup-cli.js /tmp/snapshot.db

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Gagal membuat snapshot database di dalam kontainer!" -ForegroundColor Red
    exit 1
}

# 3. Salin file snapshot dari dalam kontainer ke folder lokal backups/
Write-Host "`n[2/3] Menyalin file backup ke host ($BackupFilePath)..." -ForegroundColor Yellow
docker cp booknest-backend:/tmp/snapshot.db $BackupFilePath
docker exec booknest-backend rm /tmp/snapshot.db

# 4. Kebijakan Retensi (Hapus backup lama yang berusia lebih dari 7 hari)
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
Write-Host "==========================================" -ForegroundColor Cyan
