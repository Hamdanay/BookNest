# ==============================================================================
# Script: restore.ps1
# Deskripsi: Skrip Pemulihan Bencana (Disaster Recovery / Database Restore)
# Untuk: Windows PowerShell
# ==============================================================================

param (
    [string]$File = ""
)

$ErrorActionPreference = "Stop"

$ProjectDir = Split-Path -Parent $PSScriptRoot
$BackupDir = Join-Path $ProjectDir "backups"

if (-not (Test-Path $BackupDir)) {
    Write-Host "[ERROR] Folder backups/ tidak ditemukan!" -ForegroundColor Red
    exit 1
}

# Tentukan file yang akan di-restore
if ($File -eq "") {
    $Latest = Get-ChildItem -Path $BackupDir -Filter "booknest_backup_*.db" | Sort-Object CreationTime -Descending | Select-Object -First 1
    if (-not $Latest) {
        Write-Host "[ERROR] Tidak ada file backup .db di folder backups/!" -ForegroundColor Red
        exit 1
    }
    $TargetBackup = $Latest.FullName
} else {
    if (Test-Path $File) {
        $TargetBackup = $File
    } else {
        $TargetBackup = Join-Path $BackupDir $File
    }
}

if (-not (Test-Path $TargetBackup)) {
    Write-Host "[ERROR] File backup tidak ditemukan: $TargetBackup" -ForegroundColor Red
    exit 1
}

Write-Host "==========================================" -ForegroundColor Magenta
Write-Host " [DISASTER RECOVERY] Memulai Pemulihan DB" -ForegroundColor Magenta
Write-Host " File Sumber: $(Split-Path $TargetBackup -Leaf)" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Magenta

# 1. Bersihkan file WAL/SHM lama di dalam kontainer
Write-Host "`n[1/3] Menyiapkan database di kontainer..." -ForegroundColor Yellow
docker exec booknest-backend rm -f /app/data/booknest.db-wal /app/data/booknest.db-shm

# 2. Salin file backup ke database utama
Write-Host "[2/3] Menyalin file backup ke database aktif..." -ForegroundColor Yellow
docker cp $TargetBackup booknest-backend:/app/data/booknest.db

# 3. Restart kontainer backend agar koneksi database dimuat ulang
Write-Host "[3/3] Me-restart service backend..." -ForegroundColor Yellow
docker compose restart backend

# 4. Tes verifikasi kesehatan
Start-Sleep -Seconds 2
try {
    $res = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -TimeoutSec 5
    if ($res.ok) {
        Write-Host "`n[SUKSES] Database berhasil dipulihkan & sistem kembali sehat!" -ForegroundColor Green
    }
} catch {
    Write-Host "`n[PERINGATAN] Backend sedang memuat, silakan cek http://localhost:8080/api/health" -ForegroundColor Yellow
}
