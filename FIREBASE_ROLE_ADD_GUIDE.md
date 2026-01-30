# Firebase Editor/Admin 역할 추가 가이드

## 개요
Firebase Firestore의 `user_roles` 컬렉션에 editor와 admin 역할을 추가하는 방법을 안내합니다.

---

## 방법 1: Firebase Console에서 직접 추가 (권장)

### 1단계: 사용자 UID 확인

#### 방법 A: 익명 사용자의 경우
1. **브라우저 개발자 도구 열기** (F12)
2. **Console 탭**에서 다음 명령 실행:
   ```javascript
   // Firebase Auth에서 현재 사용자 UID 확인
   firebase.auth().currentUser.uid
   ```
3. **UID 복사** (예: `abc123def456...`)

#### 방법 B: 이메일 로그인 사용자의 경우
1. **Firebase Console 접속**: https://console.firebase.google.com/
2. **프로젝트 선택**: `hakdong-a80b8`
3. **Authentication → Users 탭**
4. 사용자 목록에서 해당 사용자 찾기
5. **UID 복사** (사용자 행의 UID 열)

---

### 2단계: Firestore에 역할 추가

1. **Firestore Database → Data 탭**
2. **`user_roles` 컬렉션 선택** (없으면 생성)
   - 컬렉션이 없으면 "Start collection" 클릭
   - 컬렉션 ID: `user_roles` 입력
3. **"Add document"** 클릭

---

### 3단계: Editor 역할 추가

#### Editor 문서 생성
1. **문서 ID**: 사용자 UID 입력 (1단계에서 복사한 UID)
2. **필드 추가**:
   ```
   필드 이름: role
   필드 타입: string
   값: editor
   ```

   ```
   필드 이름: projectId
   필드 타입: string
   값: P1 (또는 해당 프로젝트 ID)
   ```

   ```
   필드 이름: allowedProcesses
   필드 타입: array
   값: [1] (또는 허용할 공정 번호 배열)
   ```
   - 배열 추가 방법:
     - 필드 타입을 "array"로 선택
     - 첫 번째 요소: 숫자 `1` 입력
     - "+" 버튼 클릭하여 추가 요소 입력 (예: `2`, `3` 등)

   ```
   필드 이름: updatedAt
   필드 타입: timestamp
   값: (현재 시간 또는 serverTimestamp 선택)
   ```
   - 타임스탬프 추가 방법:
     - 필드 타입을 "timestamp"로 선택
     - "Set to server timestamp" 클릭 (또는 현재 시간 선택)

3. **"Save"** 클릭

#### Editor 공정 할당 예시
- **Editor 1 (주기둥커팅)**: `allowedProcesses: [1]`
- **Editor 2 (소부재가공)**: `allowedProcesses: [2]`
- **Editor 3 (주기둥조립)**: `allowedProcesses: [3, 4, 5]`
- **Editor 4 (현장설치)**: `allowedProcesses: [6]`
- **Editor (모든 공정)**: `allowedProcesses: [1, 2, 3, 4, 5, 6]`

---

### 4단계: Admin 역할 추가

#### Admin 문서 생성
1. **문서 ID**: 사용자 UID 입력
2. **필드 추가**:
   ```
   필드 이름: role
   필드 타입: string
   값: admin
   ```

   ```
   필드 이름: projectId
   필드 타입: string
   값: P1 (또는 해당 프로젝트 ID, 선택사항)
   ```

   ```
   필드 이름: updatedAt
   필드 타입: timestamp
   값: (serverTimestamp)
   ```

3. **"Save"** 클릭

**참고**: Admin은 `allowedProcesses` 필드가 필요 없습니다 (모든 공정에 접근 가능).

---

## 방법 2: 브라우저 콘솔에서 코드로 추가 (고급)

### Editor 역할 추가
브라우저 개발자 도구(F12) → Console 탭에서 실행:

```javascript
// 현재 사용자 UID 확인
const uid = firebase.auth().currentUser.uid;
console.log('현재 사용자 UID:', uid);

// Editor 역할 추가
firebase.firestore().collection('user_roles').doc(uid).set({
    role: 'editor',
    projectId: 'P1',
    allowedProcesses: [1, 2, 3, 4, 5, 6], // 허용할 공정 번호 배열
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
}).then(() => {
    console.log('✅ Editor 역할 추가 완료');
}).catch((error) => {
    console.error('❌ 오류:', error);
});
```

### Admin 역할 추가
```javascript
// 현재 사용자 UID 확인
const uid = firebase.auth().currentUser.uid;
console.log('현재 사용자 UID:', uid);

// Admin 역할 추가
firebase.firestore().collection('user_roles').doc(uid).set({
    role: 'admin',
    projectId: 'P1',
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
}).then(() => {
    console.log('✅ Admin 역할 추가 완료');
}).catch((error) => {
    console.error('❌ 오류:', error);
});
```

### 다른 사용자에게 역할 추가
```javascript
// 특정 사용자 UID로 역할 추가
const targetUserId = '사용자UID여기에입력';

// Editor 역할
firebase.firestore().collection('user_roles').doc(targetUserId).set({
    role: 'editor',
    projectId: 'P1',
    allowedProcesses: [1, 2, 3],
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
});

// 또는 Admin 역할
firebase.firestore().collection('user_roles').doc(targetUserId).set({
    role: 'admin',
    projectId: 'P1',
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
});
```

**⚠️ 주의**: 이 방법은 현재 사용자가 Admin 권한이 있어야 작동합니다. 보안 규칙에 따라 일반 사용자는 자신의 역할을 수정할 수 없습니다.

---

## 방법 3: 관리자 페이지에서 추가 (향후 구현)

현재 `pages/admin.html` 페이지가 있지만, Firebase 역할 관리 기능은 아직 구현되지 않았습니다.

향후 구현 시:
- Admin 사용자가 다른 사용자의 역할을 설정할 수 있는 UI 추가
- 역할 변경 이력 추적
- 일괄 역할 설정 기능

---

## 확인 방법

### 1. Firestore에서 확인
1. **Firestore Database → Data 탭**
2. **`user_roles` 컬렉션** 선택
3. 사용자 UID로 문서가 생성되었는지 확인
4. `role` 필드가 올바르게 설정되었는지 확인

### 2. 브라우저에서 확인
1. **페이지 새로고침** (Ctrl+F5)
2. **개발자 도구 → Console 탭**
3. 다음 메시지 확인:
   ```
   [RBAC] 사용자 역할: editor (또는 admin)
   [RBAC] 허용된 공정: [1, 2, 3] (Editor의 경우)
   ```

### 3. 권한 확인
- **Editor**: 허용된 공정만 수정 가능
- **Admin**: 모든 공정 수정 가능, 사용자 관리 가능

---

## 역할별 권한 요약

| 역할 | 읽기 | 쓰기 | 비고 |
|------|------|------|------|
| **Viewer** | ✅ | ❌ | 열람만 가능 |
| **Editor** | ✅ | ✅ (제한) | `allowedProcesses`에 지정된 공정만 수정 |
| **Approver** | ✅ | ✅ | 모든 공정 수정 가능 |
| **Admin** | ✅ | ✅ | 모든 권한, 사용자 관리 가능 |

---

## 문제 해결

### "Missing or insufficient permissions" 오류
1. **Firestore 보안 규칙 확인**
   - Firebase Console → Firestore Database → Rules
   - 규칙이 배포되었는지 확인 (Publish 버튼 클릭)

2. **사용자 역할 확인**
   - `user_roles` 컬렉션에 해당 사용자 문서가 있는지 확인
   - 문서 ID가 사용자 UID와 정확히 일치하는지 확인
   - `role` 필드가 소문자로 정확히 입력되었는지 확인

3. **인증 상태 확인**
   - 사용자가 로그인되어 있는지 확인
   - 브라우저 콘솔에서 `firebase.auth().currentUser` 확인

### 역할이 적용되지 않는 경우
1. **브라우저 새로고침** (Ctrl+F5)
2. **캐시 삭제** 후 다시 시도
3. **Firestore 규칙 배포 확인** (Publish 버튼 클릭)

---

## 빠른 참조

### Editor 역할 설정 (최소 필수 필드)
```
문서 ID: {사용자 UID}
role: "editor" (string)
allowedProcesses: [1] (array - 숫자)
updatedAt: (timestamp)
```

### Admin 역할 설정 (최소 필수 필드)
```
문서 ID: {사용자 UID}
role: "admin" (string)
updatedAt: (timestamp)
```

---

## 문의
문제가 계속 발생하는 경우:
- 이메일: sbd_pmo@naver.com
- Firebase Console에서 규칙 및 데이터 구조 확인
