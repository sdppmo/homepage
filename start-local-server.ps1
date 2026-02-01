# 로컬 개발 서버 시작 스크립트 (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   K-COL Homepage Local Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 기존 프로세스 종료
Write-Host "[1/3] 기존 8080 포트 프로세스 확인 중..." -ForegroundColor Yellow
$existing = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($existing) {
    $existing | ForEach-Object {
        $pid = $_.OwningProcess
        if ($pid) {
            Write-Host "  - PID $pid 종료 중..." -ForegroundColor Gray
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
}
Start-Sleep -Seconds 1
Write-Host "  완료!" -ForegroundColor Green
Write-Host ""

# 프로젝트 루트로 이동
Set-Location $PSScriptRoot

# 서버 시작
Write-Host "[2/3] 서버 시작 중..." -ForegroundColor Yellow
$serverProcess = Start-Process -FilePath "py" -ArgumentList "-m","http.server","8080" -PassThru -NoNewWindow
Start-Sleep -Seconds 2

# 서버 상태 확인
Write-Host "[3/3] 서버 상태 확인 중..." -ForegroundColor Yellow
$connection = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($connection) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   서버가 실행 중입니다!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "서버 주소:" -ForegroundColor Cyan
    Write-Host "  http://localhost:8080" -ForegroundColor White
    Write-Host "  http://127.0.0.1:8080" -ForegroundColor White
    Write-Host ""
    Write-Host "서버를 종료하려면:" -ForegroundColor Yellow
    Write-Host "  Stop-Process -Id $($serverProcess.Id) -Force" -ForegroundColor Gray
    Write-Host "  또는 Ctrl+C를 누르세요" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "경고: 서버가 시작되지 않았습니다." -ForegroundColor Red
    Write-Host "Python이 설치되어 있고 PATH에 있는지 확인하세요." -ForegroundColor Yellow
    Write-Host ""
}
