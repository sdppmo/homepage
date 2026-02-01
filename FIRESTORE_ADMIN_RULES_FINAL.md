# Firestore Admin Role Rules - 최종 버전

## Rules 구조

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return signedIn()
        && exists(/databases/$(database)/documents/user_roles/$(request.auth.uid))
        && get(/databases/$(database)/documents/user_roles/$(request.auth.uid)).data.role == "admin";
    }

    match /user_roles/{uid} {
      allow read: if signedIn() && (request.auth.uid == uid || isAdmin());
      allow write: if isAdmin();
    }
  }
}
```

## 보안 규칙 설명

### 1. `signedIn()` 함수
- 로그인 여부 확인 (익명 포함)

### 2. `isAdmin()` 함수
- 로그인 확인
- `user_roles/{request.auth.uid}` 문서 존재 확인
- 문서의 `role` 필드가 `"admin"`인지 확인

### 3. `user_roles/{uid}` 규칙

#### 읽기 권한 (`allow read`)
- 본인: `request.auth.uid == uid` → 자신의 문서 읽기 가능
- Admin: `isAdmin()` → 모든 `user_roles` 문서 읽기 가능

#### 쓰기 권한 (`allow write`)
- Admin만 가능: `isAdmin()` → 생성, 업데이트, 삭제 모두 가능

## 권한 체크 흐름

1. **사용자가 `user_roles/{targetUid}`에 쓰기 시도**
2. **Rules 평가: `allow write: if isAdmin()`**
3. **`isAdmin()` 함수 실행:**
   - `signedIn()` 확인
   - `exists()` 확인: 현재 사용자의 `user_roles/{request.auth.uid}` 문서 존재 여부
   - `get()` 호출: 현재 사용자의 `user_roles/{request.auth.uid}` 문서 읽기
   - `role == "admin"` 확인
4. **결과:**
   - Admin이면 → 쓰기 허용
   - Admin이 아니면 → 쓰기 거부 (permission-denied)

## 중요 사항

### 1. 첫 번째 Admin 생성
- **Firebase Console에서 수동 생성 필요**
- 경로: `user_roles/{admin-uid}`
- 필드: `{ role: "admin" }`
- 이유: Rules에서 Admin만 `user_roles`에 쓰기 가능하므로, 첫 Admin은 콘솔에서 생성해야 함

### 2. `isAdmin()` 함수의 `get()` 호출
- Rules 평가 중에는 `get()`이 허용됨
- 현재 사용자가 자신의 `user_roles/{uid}` 문서를 읽을 권한이 있어야 함
- `allow read: if signedIn() && (request.auth.uid == uid || isAdmin())` 규칙에 의해 본인은 읽기 가능

### 3. 순환 참조 방지
- `isAdmin()` 함수는 `user_roles/{request.auth.uid}`를 읽음 (본인 문서)
- `user_roles/{uid}`의 `allow read` 규칙은 본인(`request.auth.uid == uid`)이면 허용
- 따라서 순환 참조 없이 동작함

## 테스트 시나리오

### ✅ 성공 케이스
1. Admin이 로그인 → `isAdmin()` = true
2. Admin이 `user_roles/{targetUid}`에 쓰기 시도 → 허용됨

### ❌ 실패 케이스
1. 일반 사용자가 로그인 → `isAdmin()` = false
2. 일반 사용자가 `user_roles/{targetUid}`에 쓰기 시도 → 거부됨 (permission-denied)

### ⚠️ 주의 케이스
1. `user_roles/{uid}` 문서가 없는 사용자가 로그인 → `isAdmin()` = false
2. 이 사용자가 `user_roles/{targetUid}`에 쓰기 시도 → 거부됨 (permission-denied)

## 배포 방법

1. Firebase Console 접속
2. Firestore Database → Rules 탭
3. 위 Rules 코드 복사하여 붙여넣기
4. "게시" 버튼 클릭
