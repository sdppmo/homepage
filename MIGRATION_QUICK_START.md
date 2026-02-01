# Portal Members 마이그레이션 빠른 시작 가이드

## Windows PowerShell에서 실행

### 1단계: 의존성 설치

```powershell
# 프로젝트 루트에서 실행
npm install firebase-admin
```

### 2단계: 서비스 계정 키 파일 준비

1. Firebase Console → 프로젝트 설정 → 서비스 계정
2. "새 비공개 키 생성" 클릭
3. JSON 파일 다운로드
4. 안전한 위치에 저장 (예: `C:\Users\sbd\firebase-service-account.json`)

### 3단계: 환경 변수 설정 및 실행

```powershell
# 환경 변수 설정 (실제 경로로 변경하세요)
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\sbd\firebase-service-account.json"

# 마이그레이션 실행
node scripts/migrate-portal-members.js
```

### 4단계: 스크립트 실행 중

스크립트가 다음을 수행합니다:
1. 기존 `/portal_members` 데이터 읽기
2. 새 경로 확인 및 중복 체크
3. 마이그레이션 대상 표시
4. **"yes" 입력하여 진행**
5. 데이터 복사
6. 기존 데이터 삭제 여부 확인 (선택)

### 5단계: Rules 배포

```powershell
firebase deploy --only firestore:rules
```

### 6단계: 테스트

페이지 새로고침 후 브라우저 콘솔에서 에러 확인

---

## 문제 해결

### "firebase-admin 모듈을 찾을 수 없습니다"
```powershell
npm install firebase-admin
```

### "GOOGLE_APPLICATION_CREDENTIALS 환경 변수가 필요합니다"
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\full\path\to\serviceAccountKey.json"
```

### "Missing or insufficient permissions"
- Firebase Console → IAM 및 관리자
- 서비스 계정에 "Cloud Datastore User" 역할 부여
