#!/bin/bash

# ============================================================
#   K-COL Homepage Server Launcher (Linux/Mac)
# ============================================================

set -e

PORT=8080
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   K-COL Homepage Server Launcher${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if port is in use
echo -e "${YELLOW}[1/2] 기존 ${PORT} 포트 프로세스 확인 중...${NC}"

if lsof -i :${PORT} > /dev/null 2>&1; then
    echo -e "${YELLOW}     포트 ${PORT}이(가) 이미 사용 중입니다.${NC}"
    read -p "     기존 프로세스를 종료하시겠습니까? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti :${PORT} | xargs kill -9 2>/dev/null || true
        echo -e "${GREEN}     프로세스 종료됨${NC}"
    else
        echo -e "${RED}     서버 시작 취소됨${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}     완료!${NC}"
echo ""

# Start server
echo -e "${YELLOW}[2/2] 서버 시작 중...${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   서버 주소: http://localhost:${PORT}${NC}"
echo -e "${GREEN}   종료하려면 Ctrl+C 를 누르세요${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

cd "$PROJECT_DIR"

# Try python3 first, then python
if command -v python3 &> /dev/null; then
    python3 -m http.server ${PORT}
elif command -v python &> /dev/null; then
    python -m http.server ${PORT}
else
    echo -e "${RED}Python이 설치되어 있지 않습니다.${NC}"
    echo "Docker를 사용하려면: docker-compose up"
    exit 1
fi
