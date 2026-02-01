# Portal Members 마이그레이션 가이드

> 작성일: 2026-01-25  
> 목적: `/portal_members/{uid}` → `/projects/P1/portal_members/{uid}` 마이그레이션

---

## 📋 개요

**변경 사항:**
- 기존: `/portal_members/{uid}` (루트 레벨)
- 새로운: `/projects/P1/portal_members/{uid}` (프로젝트 하위)

**이유:**
- 프로젝트별 포털 역할 관리 가능
- 프로젝트 권한의 단일 진실 소스 유지 (`projects/{projectId}/members/{uid}`)
- 보안 및 운영 최적화

---

## 🔧 사전 준비

### 1. Firebase Admin SDK 서비스 계정 키 준비

1. Firebase Console → 프로젝트 설정 → 서비스 계정
2. "새 비공개 키 생성" 클릭
3. JSON 파일 다운로드 및 안전한 위치에 저장

### 2. 환경 변수 설정

**Node.js:**
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

**Python:**
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

또는 프로젝트 ID만 설정:
```bash
export FIREBASE_PROJECT_ID="your-project-id"
```

---

## 🚀 마이그레이션 실행

### 방법 1: Node.js 스크립트

```bash
# 의존성 설치 (최초 1회)
npm install firebase-admin

# 마이그레이션 실행
node scripts/migrate-portal-members.js
```

### 방법 2: Python 스크립트

```bash
# 의존성 설치 (최초 1회)
pip install firebase-admin

# 마이그레이션 실행
python scripts/migrate-portal-members.py
```

---

## 📝 마이그레이션 프로세스

1. **기존 데이터 읽기**: `/portal_members` 컬렉션의 모든 문서 읽기
2. **중복 확인**: 새 경로에 이미 데이터가 있는지 확인
3. **사용자 확인**: 마이그레이션 진행 여부 확인
4. **데이터 복사**: `/projects/P1/portal_members/{uid}`로 복사
5. **기존 데이터 삭제** (선택): 마이그레이션 완료 후 기존 데이터 삭제 여부 확인

---

## ✅ 마이그레이션 후 작업

### 1. Firestore Rules 배포

`firestore.rules` 파일이 이미 업데이트되어 있습니다:
- `/projects/{projectId}/portal_members/{uid}`: 읽기 전용 (본인만)
- `/portal_members/{document=**}`: 완전 차단 (읽기/쓰기 모두)

**배포 방법:**
```bash
firebase deploy --only firestore:rules
```

또는 Firebase Console에서:
1. Firestore Database → Rules 탭
2. `firestore.rules` 파일 내용 복사/붙여넣기
3. "게시" 클릭

### 2. 코드 확인

코드는 이미 수정되어 있습니다:
- `loadPortalRole` 함수가 `/projects/{projectId}/portal_members/{uid}` 경로 사용

### 3. 테스트

1. 페이지 새로고침
2. 브라우저 콘솔에서 에러 확인
3. 포털 역할이 정상적으로 로드되는지 확인

---

## 🔍 검증

### 마이그레이션 확인

**Firebase Console에서:**
1. Firestore Database → Data
2. `projects` → `P1` → `portal_members` 확인
3. 기존 `/portal_members` 경로는 비어있거나 삭제됨

**브라우저 콘솔에서:**
```javascript
// 포털 역할 로드 테스트
loadPortalRole(firebaseAuth.currentUser?.uid).then(result => {
    console.log('포털 역할:', result);
});
```

---

## ⚠️ 주의사항

### 보안

- **프로젝트 권한의 단일 진실 소스**: `projects/{projectId}/members/{uid}.role`
- **포털 역할**: `projects/{projectId}/portal_members/{uid}.portalRole` (참고/표시 용도만)
- **포털 admin ≠ 프로젝트 admin**: 포털 admin이라도 프로젝트 admin은 별도로 부여

### 롤백

마이그레이션 실패 시:
1. 새 경로의 데이터 삭제
2. 기존 `/portal_members` 경로는 그대로 유지
3. `firestore.rules`에서 기존 경로 차단 룰 제거

---

## 📊 마이그레이션 스크립트 옵션

### 기존 데이터 삭제

마이그레이션 완료 후 기존 데이터를 삭제할지 선택할 수 있습니다:
- **Yes**: 기존 `/portal_members` 데이터 삭제 (권장)
- **No**: 기존 데이터 유지 (Firestore Rules에서 차단됨)

### 부분 마이그레이션

스크립트는 자동으로:
- 이미 새 경로에 있는 데이터는 건너뜀
- 중복 마이그레이션 방지

---

## 🆘 문제 해결

### 오류: "Missing or insufficient permissions"

**원인**: 서비스 계정 키에 Firestore 권한이 없음

**해결**:
1. Firebase Console → IAM 및 관리자
2. 서비스 계정에 "Cloud Datastore User" 역할 부여

### 오류: "Firebase Admin 초기화 실패"

**원인**: 서비스 계정 키 경로가 잘못되었거나 파일이 없음

**해결**:
```bash
# 경로 확인
ls -la $GOOGLE_APPLICATION_CREDENTIALS

# 또는 절대 경로 사용
export GOOGLE_APPLICATION_CREDENTIALS="/full/path/to/serviceAccountKey.json"
```

---

**작성일**: 2026-01-25
