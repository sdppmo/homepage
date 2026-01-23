# K-COL Homepage Server Launcher (PowerShell)
# 실행: .\start-server.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   K-COL Homepage Server Launcher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 8080 포트 사용 중인 프로세스 종료
Write-Host "[1/2] 기존 8080 포트 프로세스 확인 중..." -ForegroundColor Yellow
$processes = netstat -ano | Select-String ":8080" | Select-String "LISTENING"
foreach ($line in $processes) {
    $pid = ($line -split '\s+')[-1]
    if ($pid -match '^\d+$') {
        Write-Host "     - PID $pid 종료 중..." -ForegroundColor Gray
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
}
Write-Host "     완료!" -ForegroundColor Green
Write-Host ""

# 서버 시작
Write-Host "[2/2] 서버 시작 중..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   서버 주소: http://localhost:8080" -ForegroundColor Green
Write-Host "   종료하려면 Ctrl+C 를 누르세요" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Go to project root (parent of scripts directory)
Set-Location (Split-Path $PSScriptRoot -Parent)
python -m http.server 8080
