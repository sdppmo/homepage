@echo off
setlocal EnableDelayedExpansion

REM ============================================================
REM Amazon Lightsail Container Deployment Script (Windows CMD)
REM ============================================================
REM
REM Usage:
REM   deploy.bat              Full build + deploy
REM   deploy.bat -quick       Skip Trivy security scan
REM   deploy.bat -local       Build + run local server only
REM   deploy.bat -stop        Stop local server
REM   deploy.bat -help        Show help
REM
REM ============================================================

REM Configuration
set SERVICE_NAME=sdppmo-container-service-1
set CONTAINER_NAME=homepage
set IMAGE_NAME=sdppmo-homepage
set IMAGE_TAG=latest
set AWS_REGION=ap-northeast-2
set HEALTH_CHECK_PATH=/health
set LOCAL_PORT=8080
set LOCAL_CONTAINER=sdppmo-local-test

REM Parse arguments
set QUICK_MODE=0
set LOCAL_MODE=0
set STOP_MODE=0

:parse_args
if "%~1"=="" goto :done_args
if /i "%~1"=="-quick" set QUICK_MODE=1
if /i "%~1"=="-local" set LOCAL_MODE=1
if /i "%~1"=="-stop" set STOP_MODE=1
if /i "%~1"=="-help" goto :show_help
if /i "%~1"=="/?" goto :show_help
shift
goto :parse_args
:done_args

REM Handle -stop
if %STOP_MODE%==1 (
    echo.
    echo ========================================
    echo   Stopping Local Server
    echo ========================================
    docker stop %LOCAL_CONTAINER% 2>nul
    docker rm %LOCAL_CONTAINER% 2>nul
    echo [OK] Local server stopped
    docker image prune -f >nul 2>&1
    echo [OK] Cleanup complete
    goto :eof
)

REM ============================================================
REM Banner
REM ============================================================
echo.
echo ========================================
echo   Lightsail Container Deployment
echo   Service: %SERVICE_NAME%
echo ========================================

REM ============================================================
REM Pre-flight Checks
REM ============================================================
echo.
echo ========================================
echo   Pre-flight Checks
echo ========================================

REM Check Docker installed
where docker >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [X] Docker is not installed
    echo Install: https://docs.docker.com/get-docker/
    exit /b 1
)
echo [OK] Docker installed

REM Check Docker running
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [X] Docker is not running
    echo Please start Docker Desktop
    exit /b 1
)
echo [OK] Docker is running

REM Skip AWS checks for local mode
if %LOCAL_MODE%==1 goto :skip_aws_checks

REM Check AWS CLI
where aws >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [X] AWS CLI is not installed
    exit /b 1
)
echo [OK] AWS CLI installed

REM Check AWS credentials
aws sts get-caller-identity >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [X] AWS credentials not configured
    echo Run: aws configure
    exit /b 1
)
echo [OK] AWS credentials configured

REM Check Lightsail service
aws lightsail get-container-services --service-name %SERVICE_NAME% --region %AWS_REGION% >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [X] Cannot access Lightsail service '%SERVICE_NAME%'
    exit /b 1
)
echo [OK] Lightsail service accessible

:skip_aws_checks

REM ============================================================
REM Build Docker Image
REM ============================================================
echo.
echo ========================================
echo   Building Docker Image
echo ========================================

REM Get timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,8%-%datetime:~8,6%

docker build --platform linux/amd64 --pull -t %IMAGE_NAME%:%IMAGE_TAG% -t %IMAGE_NAME%:%TIMESTAMP% .
if %ERRORLEVEL% neq 0 (
    echo [X] Docker build failed
    exit /b 1
)
echo [OK] Docker image built: %IMAGE_NAME%:%IMAGE_TAG%
echo [OK] Tagged with timestamp: %IMAGE_NAME%:%TIMESTAMP%

REM ============================================================
REM Security Scan (optional)
REM ============================================================
if %QUICK_MODE%==0 (
    where trivy >nul 2>&1
    if %ERRORLEVEL%==0 (
        echo.
        echo ========================================
        echo   Security Scan
        echo ========================================
        trivy image --severity HIGH,CRITICAL --exit-code 0 %IMAGE_NAME%:%IMAGE_TAG%
    ) else (
        echo [!] Trivy not installed - skipping security scan
    )
)

REM ============================================================
REM Test Image Locally
REM ============================================================
echo.
echo ========================================
echo   Testing Image Locally
echo ========================================

REM Start test container
for /f %%i in ('docker run -d --platform linux/amd64 -p 8888:80 %IMAGE_NAME%:%IMAGE_TAG%') do set CONTAINER_ID=%%i
timeout /t 3 /nobreak >nul

REM Health check
curl -sf http://localhost:8888%HEALTH_CHECK_PATH% >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [X] Health check failed
    docker logs %CONTAINER_ID%
    docker stop %CONTAINER_ID% >nul 2>&1
    docker rm %CONTAINER_ID% >nul 2>&1
    exit /b 1
)
echo [OK] Health check passed

REM Cleanup test container
docker stop %CONTAINER_ID% >nul 2>&1
docker rm %CONTAINER_ID% >nul 2>&1

REM ============================================================
REM Local Mode - Run local server only
REM ============================================================
if %LOCAL_MODE%==1 (
    echo.
    echo ========================================
    echo   Starting Local Server
    echo ========================================
    
    docker stop %LOCAL_CONTAINER% 2>nul
    docker rm %LOCAL_CONTAINER% 2>nul
    docker run -d --name %LOCAL_CONTAINER% -p %LOCAL_PORT%:80 %IMAGE_NAME%:%IMAGE_TAG% >nul
    
    echo.
    echo ========================================
    echo   Local Server Running
    echo ========================================
    echo.
    echo   URL: http://localhost:%LOCAL_PORT%
    echo.
    echo   To stop: deploy.bat -stop
    echo.
    goto :eof
)

REM ============================================================
REM Push to Lightsail
REM ============================================================
echo.
echo ========================================
echo   Pushing Image to Lightsail
echo ========================================

REM Push image and capture output to temp file
set PUSH_TEMP=%TEMP%\sdppmo_push_%RANDOM%.txt
aws lightsail push-container-image --region %AWS_REGION% --service-name %SERVICE_NAME% --label %CONTAINER_NAME% --image %IMAGE_NAME%:%IMAGE_TAG% > "%PUSH_TEMP%" 2>&1
type "%PUSH_TEMP%"

if %ERRORLEVEL% neq 0 (
    echo [X] Push to Lightsail failed
    del "%PUSH_TEMP%" 2>nul
    exit /b 1
)

REM Extract image URI from output - line: Refer to this image as ":SERVICE.CONTAINER.NUM" in deployments.
for /f "tokens=6 delims= " %%a in ('findstr /c:"Refer to this image as" "%PUSH_TEMP%"') do (
    set "IMAGE_URI=%%~a"
)
del "%PUSH_TEMP%" 2>nul

if not defined IMAGE_URI (
    echo [X] Failed to extract image URI
    exit /b 1
)
REM Remove any trailing quotes that might remain
set "IMAGE_URI=!IMAGE_URI:"=!"
echo [OK] Image pushed: !IMAGE_URI!

REM ============================================================
REM Deploy to Lightsail
REM ============================================================
echo.
echo ========================================
echo   Creating Deployment
echo ========================================

REM Build JSON with escaped quotes for cmd (\" = literal quote)
set CONTAINERS_JSON={\"!CONTAINER_NAME!\":{\"image\":\"!IMAGE_URI!\",\"ports\":{\"80\":\"HTTP\"},\"environment\":{\"TZ\":\"Asia/Seoul\"}}}
set ENDPOINT_JSON={\"containerName\":\"!CONTAINER_NAME!\",\"containerPort\":80,\"healthCheck\":{\"path\":\"!HEALTH_CHECK_PATH!\",\"intervalSeconds\":30,\"timeoutSeconds\":5,\"healthyThreshold\":2,\"unhealthyThreshold\":3}}

REM Retry loop
set MAX_ATTEMPTS=4
set ATTEMPT=0
set DEPLOY_OK=0

:deploy_loop
set /a ATTEMPT+=1
echo   Deploy attempt %ATTEMPT% of %MAX_ATTEMPTS%...

aws lightsail create-container-service-deployment --region %AWS_REGION% --service-name %SERVICE_NAME% --containers "!CONTAINERS_JSON!" --public-endpoint "!ENDPOINT_JSON!"

if !ERRORLEVEL!==0 (
    set DEPLOY_OK=1
    goto :deploy_done
)

if !ATTEMPT! lss %MAX_ATTEMPTS% (
    echo [!] Deployment failed ^(attempt !ATTEMPT!^). Retrying in 12s...
    timeout /t 12 /nobreak >nul
    goto :deploy_loop
)

:deploy_done

if %DEPLOY_OK%==0 (
    echo [X] Deployment failed after %MAX_ATTEMPTS% attempts
    exit /b 1
)

echo [OK] Deployment initiated!

REM ============================================================
REM Get Deployment Status
REM ============================================================
echo.
echo ========================================
echo   Deployment Status
echo ========================================

for /f "tokens=*" %%a in ('aws lightsail get-container-services --service-name %SERVICE_NAME% --region %AWS_REGION% --query "containerServices[0].state" --output text 2^>nul') do set STATE=%%a
for /f "tokens=*" %%a in ('aws lightsail get-container-services --service-name %SERVICE_NAME% --region %AWS_REGION% --query "containerServices[0].url" --output text 2^>nul') do set URL=%%a

echo Service State: %STATE%
echo Service URL:   %URL%

REM ============================================================
REM Upload protected pages to Supabase Storage
REM ============================================================
if exist .env.local (
    if exist scripts\upload-protected-pages.py (
        echo.
        echo ========================================
        echo   Uploading Protected Pages
        echo ========================================
        python scripts\upload-protected-pages.py
        if !ERRORLEVEL!==0 (
            echo [OK] Protected pages uploaded to Supabase
        ) else (
            echo [!] Failed to upload protected pages ^(non-critical^)
        )
    )
) else (
    echo [!] Skipping Supabase upload ^(.env.local not found^)
)

REM ============================================================
REM Done
REM ============================================================
echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Useful commands:
echo   # Monitor deployment
echo   aws lightsail get-container-services --service-name %SERVICE_NAME% --region %AWS_REGION%
echo.
echo   # View logs
echo   aws lightsail get-container-log --service-name %SERVICE_NAME% --container-name %CONTAINER_NAME% --region %AWS_REGION%
echo.

goto :eof

REM ============================================================
REM Help
REM ============================================================
:show_help
echo.
echo Usage: deploy.bat [OPTIONS]
echo.
echo Options:
echo   -quick    Skip Trivy security scan (faster)
echo   -local    Build + run local server only (no AWS deploy)
echo   -stop     Stop local server
echo   -help     Show this help
echo.
echo Configuration:
echo   SERVICE_NAME: %SERVICE_NAME%
echo   AWS_REGION:   %AWS_REGION%
echo   IMAGE_NAME:   %IMAGE_NAME%
echo.
goto :eof
