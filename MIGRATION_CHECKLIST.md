# Portal Members 마이그레이션 체크리스트

> 작성일: 2026-01-25  
> 목적: 마이그레이션 실행 전/후 확인 사항

---

## 0️⃣ 실행 전 체크 (필수 3가지)

### ✅ 체크 1: 서비스 계정 키 파일 및 권한

**확인 사항:**
- [ ] 서비스 계정 키 파일(`serviceAccountKey.json`)이 존재하는가?
- [ ] 파일 경로를 정확히 알고 있는가?
- [ ] 서비스 계정에 Firestore 접근 권한이 있는가?

**권한 확인 방법:**
1. Firebase Console → IAM 및 관리자
2. 서비스 계정 확인
3. "Cloud Datastore User" 또는 "Firebase Admin" 역할 부여 확인

**권한이 없다면:**
```bash
# Firebase Console에서 서비스 계정에 역할 추가
# 또는 gcloud CLI 사용
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/datastore.user"
```

---

### ✅ 체크 2: 마이그레이션 대상 확인

**확인 사항:**
- [ ] 스크립트 내부에 `projectId = 'P1'` 하드코딩이 있는가? ✅ (확인됨)
- [ ] P1만 마이그레이션하는 것이 맞는가?

**스크립트 확인:**
- `scripts/migrate-portal-members.js`: `const projectId = 'P1';` (19번째 줄)
- `scripts/migrate-portal-members.py`: `project_id = "P1"` (19번째 줄)

---

### ✅ 체크 3: Firestore 데이터 구조 확인

**Firebase Console에서 확인:**

1. **기존 경로 확인:**
   ```
   /portal_members/{uid}
   ```
   - 문서가 몇 개 있는지 확인
   - 대표적인 UID 2~3개 메모

2. **새 경로 확인:**
   ```
   projects/P1/portal_members/{uid}
   ```
   - 현재 비어있어야 함 (또는 일부만 있을 수 있음)

3. **프로젝트 멤버 경로 확인:**
   ```
   projects/P1/members/{uid}
   ```
   - 프로젝트 멤버 문서가 있는지 확인

---

## 1️⃣ 마이그레이션 실행

### A. Node.js로 실행 (추천)

**Windows (PowerShell):**
```powershell
# 프로젝트 루트에서
npm install firebase-admin

# 환경 변수 설정 (PowerShell)
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"

# 마이그레이션 실행
node scripts/migrate-portal-members.js
```

**macOS/Linux:**
```bash
# 프로젝트 루트에서
npm install firebase-admin

# 환경 변수 설정
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"

# 마이그레이션 실행
node scripts/migrate-portal-members.js
```

### B. Python으로 실행

**Windows (PowerShell):**
```powershell
# 의존성 설치
pip install firebase-admin

# 환경 변수 설정 (PowerShell)
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"

# 마이그레이션 실행
python scripts/migrate-portal-members.py
```

**macOS/Linux:**
```bash
# 의존성 설치
pip install firebase-admin

# 환경 변수 설정
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"

# 마이그레이션 실행
python scripts/migrate-portal-members.py
```

### 실행 중 확인 사항

스크립트가 다음을 수행합니다:
1. 기존 `/portal_members` 데이터 읽기
2. 새 경로에 이미 있는 데이터 확인 (중복 방지)
3. 마이그레이션 대상 목록 표시
4. 사용자 확인 (yes/no)
5. 데이터 복사 실행
6. 기존 데이터 삭제 여부 확인 (선택)

---

## 2️⃣ 마이그레이션 결과 확인

### Firebase Console에서 확인

**✅ 새 경로 확인:**
```
projects → P1 → portal_members → {uid}
```
- 문서들이 생성되어 있어야 함
- 문서 수가 기존과 동일한지 확인
- 대표 UID 2~3개 샘플로 데이터가 동일한지 확인

**✅ 기존 경로 확인:**
```
portal_members → {uid}
```
- 기존 경로는 그대로 남아있어도 OK (Rules로 차단할 예정)
- 삭제를 선택했다면 비어있어야 함

**✅ 데이터 일치 확인:**
- 같은 UID의 문서를 양쪽에서 비교
- `portalRole` 필드 값이 동일한지 확인

---

## 3️⃣ Rules 배포

### CLI로 배포 (권장)

```bash
firebase deploy --only firestore:rules
```

### Firebase Console에서 배포

1. Firebase Console → Firestore Database → Rules
2. `firestore.rules` 파일 내용 복사
3. Rules 편집기에 붙여넣기
4. "게시" 클릭

### 배포 후 확인

Rules에 다음이 포함되어 있는지 확인:
- ✅ `/projects/{projectId}/portal_members/{uid}`: 읽기 전용 (본인만)
- ✅ `/portal_members/{document=**}`: 완전 차단

---

## 4️⃣ 브라우저에서 테스트 (필수 시나리오 3개)

### 시나리오 1: 로그인 후 페이지 새로고침

**확인 사항:**
- [ ] 콘솔에 "Missing or insufficient permissions" 에러가 없어야 함
- [ ] 포털 역할이 정상적으로 로드되는지 확인

**테스트 코드:**
```javascript
// 브라우저 콘솔에서 실행
loadPortalRole(firebaseAuth.currentUser?.uid).then(result => {
    console.log('포털 역할:', result);
    if (result.exists) {
        console.log('✅ 포털 역할 로드 성공');
    } else {
        console.log('⚠️ 포털 역할 문서 없음');
    }
});
```

---

### 시나리오 2: 프로젝트 멤버 권한 확인

**확인 사항:**
- [ ] `projects/P1/members/{uid}` 권한 기반 동작이 정상인가?
- [ ] Editor/Admin/Viewer 역할이 올바르게 적용되는가?

**테스트 코드:**
```javascript
// 프로젝트 멤버 문서 확인
const projectId = window.PROJECT_ID;
const uid = firebaseAuth.currentUser?.uid;
firebaseDb.collection('projects').doc(projectId)
    .collection('members').doc(uid).get().then(doc => {
        if (doc.exists) {
            console.log('✅ 프로젝트 멤버 문서:', doc.data());
        } else {
            console.log('❌ 프로젝트 멤버 문서 없음');
        }
    });
```

---

### 시나리오 3: 포털 멤버 읽기/쓰기 권한 확인

**확인 사항:**
- [ ] `projects/P1/portal_members/{uid}` 읽기는 성공해야 함
- [ ] `projects/P1/portal_members/{uid}` 쓰기는 실패해야 함 (읽기 전용)
- [ ] 기존 `/portal_members/{uid}` 경로 접근은 무조건 거부되어야 함

**테스트 코드:**
```javascript
const projectId = window.PROJECT_ID;
const uid = firebaseAuth.currentUser?.uid;

// 1. 새 경로 읽기 (성공해야 함)
firebaseDb.collection('projects').doc(projectId)
    .collection('portal_members').doc(uid).get().then(doc => {
        if (doc.exists) {
            console.log('✅ 새 경로 읽기 성공:', doc.data());
        } else {
            console.log('⚠️ 새 경로 문서 없음');
        }
    }).catch(err => {
        console.error('❌ 새 경로 읽기 실패:', err);
    });

// 2. 새 경로 쓰기 (실패해야 함)
firebaseDb.collection('projects').doc(projectId)
    .collection('portal_members').doc(uid).set({ test: true })
    .then(() => {
        console.error('❌ 새 경로 쓰기 성공 (예상과 다름 - Rules 확인 필요)');
    })
    .catch(err => {
        if (err.code === 'permission-denied') {
            console.log('✅ 새 경로 쓰기 차단됨 (정상)');
        } else {
            console.error('❌ 새 경로 쓰기 실패 (다른 오류):', err);
        }
    });

// 3. 기존 경로 접근 (무조건 거부되어야 함)
firebaseDb.collection('portal_members').doc(uid).get()
    .then(doc => {
        console.error('❌ 기존 경로 읽기 성공 (예상과 다름 - Rules 확인 필요)');
    })
    .catch(err => {
        if (err.code === 'permission-denied') {
            console.log('✅ 기존 경로 차단됨 (정상)');
        } else {
            console.error('❌ 기존 경로 접근 실패 (다른 오류):', err);
        }
    });
```

---

## 5️⃣ 운영 정리 (선택)

### 기존 데이터 삭제

**주의:** 기존 `/portal_members` 데이터는 Rules로 완전 차단되어 있어 보안상 문제는 없지만, 데이터 혼동 방지를 위해 삭제할 수 있습니다.

**삭제 방법:**
1. 마이그레이션 스크립트 실행 시 "기존 데이터 삭제" 선택
2. 또는 Admin SDK로 수동 삭제

**수동 삭제 스크립트 예시:**
```javascript
// Node.js
const admin = require('firebase-admin');
const db = admin.firestore();

async function deleteOldPortalMembers() {
    const portalMembers = await db.collection('portal_members').get();
    for (const doc of portalMembers.docs) {
        await doc.ref.delete();
        console.log(`✅ ${doc.id} 삭제 완료`);
    }
}
```

---

## ✅ 최종 확인 체크리스트

- [ ] 마이그레이션 실행 완료
- [ ] 새 경로에 데이터 생성 확인
- [ ] Rules 배포 완료
- [ ] 브라우저 테스트 3개 시나리오 모두 통과
- [ ] 콘솔 에러 없음
- [ ] 포털 역할 정상 로드
- [ ] 프로젝트 권한 정상 동작
- [ ] 읽기 전용 정책 정상 작동
- [ ] 기존 경로 차단 확인

---

## 📝 정리

**단일 진실 소스:**
- ✅ 프로젝트 권한: `projects/{projectId}/members/{uid}` (단일 진실 소스)
- ✅ 포털 역할: `projects/{projectId}/portal_members/{uid}` (참고/표시 용도, 읽기 전용)

**보안:**
- ✅ 포털 admin ≠ 프로젝트 admin (별도 관리)
- ✅ 포털 역할은 참고/표시 용도만
- ✅ 기존 `/portal_members` 경로 완전 차단

---

**작성일**: 2026-01-25
