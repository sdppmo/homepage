# 마이그레이션 스크립트 사용 가이드

## Portal Members 마이그레이션

### Windows (PowerShell) 사용법

```powershell
# 1. 의존성 설치
npm install firebase-admin
# 또는
pip install firebase-admin

# 2. 환경 변수 설정 (PowerShell)
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"

# 3. 마이그레이션 실행
node scripts/migrate-portal-members.js
# 또는
python scripts/migrate-portal-members.py
```

### macOS/Linux 사용법

```bash
# 1. 의존성 설치
npm install firebase-admin
# 또는
pip install firebase-admin

# 2. 환경 변수 설정
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"

# 3. 마이그레이션 실행
node scripts/migrate-portal-members.js
# 또는
python scripts/migrate-portal-members.py
```

### 주의사항

- **대상 프로젝트**: P1만 마이그레이션 (스크립트 내부 하드코딩)
- **서비스 계정 키**: Firebase Console에서 다운로드한 JSON 파일 필요
- **권한**: 서비스 계정에 Firestore 접근 권한 필요

### 상세 가이드

자세한 내용은 `MIGRATION_CHECKLIST.md`를 참조하세요.
