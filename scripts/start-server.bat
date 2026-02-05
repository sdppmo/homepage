@echo off
chcp 65001 >nul
echo ========================================
echo    K-COL Homepage Server Launcher
echo ========================================
echo.

:: 8080 포트 사용 중인 프로세스 종료
echo [1/2] 기존 8080 포트 프로세스 확인 중...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
    echo      - PID %%a 종료 중...
    taskkill /PID %%a /F >nul 2>&1
)
echo      완료!
echo.

:: 서버 시작
echo [2/2] 서버 시작 중...
echo.
echo ========================================
echo    서버 주소: http://localhost:8080
echo    종료하려면 Ctrl+C 를 누르세요
echo ========================================
echo.

:: Go to project root (parent of scripts directory)
cd /d "%~dp0.."
py -m http.server 8080
