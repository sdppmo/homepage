# Firestore Rules 분석 및 검증

> 작성일: 2026-01-25  
> 목적: 현재 배포된 Firestore Rules의 구조 분석 및 검증

---

## 📋 규칙 구조 개요

### 1. 인증 함수

```javascript
function isSignedInNonAnon() {
  return request.auth != null
    && request.auth.token.firebase.sign_in_provider != 'anonymous';
}
```

**역할:**
- 이메일/비밀번호 로그인만 허용
- 익명 로그인 차단

**검증:** ✅ 올바름

---

### 2. 멤버 문서 조회 함수

```javascript
function myMemberDoc(projectId) {
  return get(/databases/$(database)/documents/projects/$(projectId)/members/$(request.auth.uid));
}
```

**역할:**
- 현재 사용자의 멤버 문서를 조회
- `isAdminInProject`에서 재사용

**검증:** ✅ 올바름

**참고:** `isAdminInProject`에서 `myMemberDoc(projectId)`를 두 번 호출하지만, Firestore Rules는 이를 최적화합니다.

---

### 3. 프로젝트 멤버 확인 함수

```javascript
function hasRoleInProject(projectId) {
  return isSignedInNonAnon()
    && exists(/databases/$(database)/documents/projects/$(projectId)/members/$(request.auth.uid));
}
```

**역할:**
- 사용자가 프로젝트 멤버인지 확인
- 문서 존재 여부만 확인 (역할 무관)

**검증:** ✅ 올바름

---

### 4. Admin 확인 함수

```javascript
function isAdminInProject(projectId) {
  return isSignedInNonAnon()
    && myMemberDoc(projectId).exists()
    && myMemberDoc(projectId).data.role == "admin";
}
```

**역할:**
- 사용자가 Admin인지 확인
- 문서 존재 + `role == "admin"` 체크

**검증:** ✅ 올바름

**최적화 가능성:**
```javascript
// 더 효율적인 버전 (하지만 현재 버전도 문제없음)
function isAdminInProject(projectId) {
  if (!isSignedInNonAnon()) return false;
  let doc = myMemberDoc(projectId);
  return doc.exists() && doc.data.role == "admin";
}
```

**현재 버전도 정상 작동하므로 변경 불필요**

---

### 5. Editor 확인 함수

```javascript
function isEditorInProject(projectId) {
  return isSignedInNonAnon()
    && myMemberDoc(projectId).exists()
    && myMemberDoc(projectId).data.role == "editor";
}
```

**역할:**
- 참고용 (현재 규칙에서 직접 사용되지 않음)
- 향후 Editor 쓰기 권한 추가 시 사용 가능

**검증:** ✅ 올바름

---

## 📁 컬렉션별 규칙 분석

### 1. `projects/{projectId}`

```javascript
// 멤버만 프로젝트 문서 read
allow read: if hasRoleInProject(projectId);

// Admin만 프로젝트 write
allow write: if isAdminInProject(projectId);
```

**검증:** ✅ 올바름

**설명:**
- 모든 멤버(Admin, Editor, Viewer)가 프로젝트 문서를 읽을 수 있음
- 프로젝트 문서 수정은 Admin만 가능

---

### 2. `projects/{projectId}/members/{uid}`

```javascript
// 본인은 자기 멤버 문서 read 가능(부트스트랩)
// Admin은 전체 멤버 문서 read 가능
allow read: if isSignedInNonAnon() && (
  request.auth.uid == uid ||
  isAdminInProject(projectId)
);

// Admin만 멤버 write
allow write: if isAdminInProject(projectId);
```

**검증:** ✅ 올바름

**설명:**
- 본인은 자신의 멤버 문서를 읽을 수 있음 (부트스트랩용)
- Admin은 모든 멤버 문서를 읽을 수 있음
- 멤버 추가/수정/삭제는 Admin만 가능

**부트스트랩 시나리오:**
1. 사용자가 로그인
2. 자신의 멤버 문서를 읽어서 역할 확인 가능
3. 멤버 문서가 없으면 접근 차단 (클라이언트 측 가드)

---

### 3. `projects/{projectId}/schedules/{scheduleId}`

```javascript
// 멤버만 read
allow read: if hasRoleInProject(projectId);

// Admin만 write
allow write: if isAdminInProject(projectId);
```

**검증:** ✅ 올바름 (현재 설계 기준)

**설명:**
- 모든 멤버가 스케줄을 읽을 수 있음
- 스케줄 쓰기는 Admin만 가능

**참고:**
- 현재 설계에서는 Editor의 공정별 쓰기 권한을 클라이언트 측에서 가드하고 있음
- 향후 Editor 쓰기 권한을 Rules에 추가하려면:
  ```javascript
  allow write: if isAdminInProject(projectId) 
    || (isEditorInProject(projectId) && canEditProcessInSchedule(...));
  ```
- 하지만 현재는 클라이언트 측 가드로 충분하므로 변경 불필요

---

### 4. `user_roles/{document=**}` (레거시)

```javascript
allow read, write: if false;
```

**검증:** ✅ 올바름

**설명:**
- 레거시 `user_roles` 컬렉션 완전 차단
- 모든 접근 거부

---

### 5. `kcolumn/{docId}`

```javascript
function projectIdFromKcolumnId(docId) {
  return docId.split('_')[0];
}

match /kcolumn/{docId} {
  allow read: if isSignedInNonAnon() && hasRoleInProject(projectIdFromKcolumnId(docId));
  allow write: if isSignedInNonAnon() && isAdminInProject(projectIdFromKcolumnId(docId));
}
```

**검증:** ✅ 올바름

**설명:**
- `kcolumn` 문서 ID 형식: `P1_xxx` (예: `P1_columnData`, `P1_dailyData`)
- `projectIdFromKcolumnId` 함수가 `_` 앞부분을 추출하여 프로젝트 ID로 사용
- 프로젝트 멤버만 읽기 가능
- Admin만 쓰기 가능

**안전성:**
- `docId`가 `_`를 포함하지 않으면 `split('_')[0]`가 전체 문자열을 반환
- 예: `P1` → `P1` (정상)
- 예: `P1_columnData` → `P1` (정상)
- 예: `invalid` → `invalid` (프로젝트 ID가 아니므로 멤버 문서가 없어 접근 차단됨)

---

## 🔒 보안 검증

### ✅ 강점

1. **익명 로그인 차단**
   - `isSignedInNonAnon()` 함수로 익명 로그인 완전 차단

2. **멤버 기반 접근 제어**
   - 모든 접근이 멤버 문서 존재 여부로 제어됨
   - 비멤버는 모든 데이터 접근 불가

3. **Admin 전용 쓰기**
   - 중요한 데이터 쓰기는 Admin만 가능
   - Editor의 공정별 제한은 클라이언트 측에서 처리

4. **레거시 차단**
   - `user_roles` 컬렉션 완전 차단

### ⚠️ 주의사항

1. **Editor 쓰기 권한**
   - 현재 Rules에서는 Editor가 `schedules`에 쓰기 불가
   - 클라이언트 측에서 `canEditProcess()` 가드로 처리
   - **3-layer defense**: Rules + Client Guards + UI

2. **부트스트랩**
   - 첫 번째 Admin은 Firebase Console에서 수동 생성 필요
   - Rules에 의해 비멤버는 자신을 Admin으로 승격 불가

---

## 📊 규칙 사용 현황

| 컬렉션 | Read 권한 | Write 권한 | 비고 |
|--------|-----------|------------|------|
| `projects/{projectId}` | 멤버 | Admin | 프로젝트 메타데이터 |
| `projects/{projectId}/members/{uid}` | 본인 + Admin | Admin | 멤버 역할 관리 |
| `projects/{projectId}/schedules/{scheduleId}` | 멤버 | Admin | 스케줄 데이터 |
| `kcolumn/{docId}` | 멤버 | Admin | 레거시 데이터 |
| `user_roles/{document=**}` | ❌ 차단 | ❌ 차단 | 레거시 차단 |

---

## 🧪 테스트 시나리오

### 시나리오 1: Admin 접근

1. Admin 계정으로 로그인
2. `projects/P1` 읽기 → ✅ 성공
3. `projects/P1/members/{ADMIN_UID}` 읽기 → ✅ 성공
4. `projects/P1/schedules/{scheduleId}` 읽기 → ✅ 성공
5. `projects/P1/schedules/{scheduleId}` 쓰기 → ✅ 성공
6. `kcolumn/P1_xxx` 읽기 → ✅ 성공
7. `kcolumn/P1_xxx` 쓰기 → ✅ 성공

### 시나리오 2: Editor 접근

1. Editor 계정으로 로그인 (공정 3, 4, 5 허용)
2. `projects/P1` 읽기 → ✅ 성공
3. `projects/P1/members/{EDITOR_UID}` 읽기 → ✅ 성공 (본인)
4. `projects/P1/schedules/{scheduleId}` 읽기 → ✅ 성공
5. `projects/P1/schedules/{scheduleId}` 쓰기 → ❌ 실패 (Rules 차단)
   - **클라이언트 측에서 `canEditProcess()` 가드로 처리**
6. `kcolumn/P1_xxx` 읽기 → ✅ 성공
7. `kcolumn/P1_xxx` 쓰기 → ❌ 실패 (Rules 차단)

### 시나리오 3: Viewer 접근

1. Viewer 계정으로 로그인
2. `projects/P1` 읽기 → ✅ 성공
3. `projects/P1/members/{VIEWER_UID}` 읽기 → ✅ 성공 (본인)
4. `projects/P1/schedules/{scheduleId}` 읽기 → ✅ 성공
5. `projects/P1/schedules/{scheduleId}` 쓰기 → ❌ 실패 (Rules 차단)
6. `kcolumn/P1_xxx` 읽기 → ✅ 성공
7. `kcolumn/P1_xxx` 쓰기 → ❌ 실패 (Rules 차단)

### 시나리오 4: 비멤버 접근

1. 비멤버 계정으로 로그인
2. `projects/P1` 읽기 → ❌ 실패 (Rules 차단)
3. `projects/P1/members/{UID}` 읽기 → ❌ 실패 (Rules 차단)
4. `projects/P1/schedules/{scheduleId}` 읽기 → ❌ 실패 (Rules 차단)
5. `kcolumn/P1_xxx` 읽기 → ❌ 실패 (Rules 차단)

### 시나리오 5: 익명 사용자

1. 익명 로그인 시도
2. 모든 접근 → ❌ 실패 (`isSignedInNonAnon()` 차단)

---

## ✅ 결론

**현재 Firestore Rules는 올바르게 작성되어 있습니다.**

### 검증 결과

- ✅ 문법 오류 없음
- ✅ 보안 로직 올바름
- ✅ 멤버 기반 접근 제어 정상 작동
- ✅ Admin 전용 쓰기 권한 정상 작동
- ✅ 레거시 컬렉션 차단 정상 작동
- ✅ 부트스트랩 시나리오 지원

### 권장 사항

1. **현재 규칙 유지** (변경 불필요)
2. **Editor 쓰기 권한**은 클라이언트 측 가드로 충분
3. **3-layer defense** 유지:
   - Layer 1: Firestore Rules (서버 측)
   - Layer 2: Client-side Guards (`canEditProcess()`)
   - Layer 3: UI/UX (opacity, disabled)

---

**작성 완료일**: 2026-01-25
