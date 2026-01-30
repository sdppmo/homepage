# Firebase 역할 작동하지 않는 이유 진단 가이드

## 작동하지 않는 주요 원인

### 1. user_roles 컬렉션에 문서가 없음
**증상**: "접근 권한이 없습니다. 관리자에게 역할을 요청하세요." 메시지 표시

**해결 방법**:
1. Firebase Console → Firestore Database → Data
2. `user_roles` 컬렉션 확인
3. 사용자 UID로 문서가 있는지 확인
4. 없으면 `FIREBASE_ROLE_ADD_GUIDE.md` 참고하여 추가

---

### 2. 문서는 있지만 role 필드가 없음
**증상**: "사용자 역할이 설정되지 않았습니다. 관리자에게 문의하세요." 메시지 표시

**해결 방법**:
1. Firebase Console → Firestore Database → Data
2. `user_roles` 컬렉션에서 해당 사용자 문서 확인
3. `role` 필드가 있는지 확인
4. 없으면 필드 추가:
   - 필드 이름: `role`
   - 필드 타입: `string`
   - 값: `editor` 또는 `admin`

---

### 3. Firestore 보안 규칙이 역할 읽기를 차단
**증상**: "Missing or insufficient permissions" 오류

**해결 방법**:
1. Firebase Console → Firestore Database → Rules
2. 현재 규칙 확인:
   ```javascript
   match /user_roles/{userId} {
     // 인증된 사용자는 자신의 역할 읽기 가능
     allow read: if request.auth != null && request.auth.uid == userId;
   }
   ```
3. 규칙이 올바른지 확인
4. **Publish 버튼 클릭** (중요!)

---

### 4. Firebase 인증이 제대로 되지 않음
**증상**: "사용자 인증 정보를 확인할 수 없습니다." 메시지

**해결 방법**:
1. 브라우저 개발자 도구 (F12) → Console 탭
2. 다음 명령 실행:
   ```javascript
   firebase.auth().currentUser
   ```
3. `null`이면 인증이 안 된 상태
4. 익명 로그인 또는 이메일 로그인 확인

---

### 5. 문서 ID가 사용자 UID와 일치하지 않음
**증상**: 역할이 로드되지 않음

**해결 방법**:
1. 현재 사용자 UID 확인:
   ```javascript
   firebase.auth().currentUser.uid
   ```
2. Firestore에서 `user_roles` 컬렉션 확인
3. 문서 ID가 UID와 **정확히 일치**하는지 확인
4. 대소문자, 공백, 특수문자 주의

---

### 6. role 필드 값이 잘못됨
**증상**: 역할이 인식되지 않음

**해결 방법**:
1. `role` 필드 값 확인:
   - 올바른 값: `"editor"`, `"admin"`, `"viewer"`, `"approver"` (소문자)
   - 잘못된 값: `"Editor"`, `"ADMIN"`, `"editor "` (공백 포함)
2. 필드 타입이 `string`인지 확인
3. 값이 정확히 소문자로 입력되었는지 확인

---

## 진단 체크리스트

### Step 1: 사용자 UID 확인
브라우저 콘솔에서 실행:
```javascript
firebase.auth().currentUser.uid
```
→ UID를 복사해두세요

### Step 2: Firestore 문서 확인
1. Firebase Console → Firestore Database → Data
2. `user_roles` 컬렉션 선택
3. Step 1에서 복사한 UID로 문서 검색
4. 문서가 있는지 확인

### Step 3: 문서 내용 확인
문서가 있으면 다음 필드 확인:
- ✅ `role` 필드가 있는가?
- ✅ `role` 값이 소문자인가? (`"editor"`, `"admin"` 등)
- ✅ 필드 타입이 `string`인가?

### Step 4: 보안 규칙 확인
1. Firebase Console → Firestore Database → Rules
2. 다음 규칙이 있는지 확인:
   ```javascript
   match /user_roles/{userId} {
     allow read: if request.auth != null && request.auth.uid == userId;
   }
   ```
3. **Publish 버튼을 클릭했는지 확인** (중요!)

### Step 5: 브라우저 콘솔 확인
1. 페이지 새로고침 (Ctrl+F5)
2. 개발자 도구 → Console 탭
3. 다음 메시지 확인:
   - `[Firebase] Firestore 초기화 완료`
   - `[Firebase] 익명 로그인 성공` (또는 이메일 로그인 성공)
   - `[RBAC] 사용자 역할: editor` (또는 admin)

---

## 빠른 해결 방법

### 방법 1: 브라우저 콘솔에서 직접 역할 추가
```javascript
// 1. 현재 사용자 UID 확인
const uid = firebase.auth().currentUser.uid;
console.log('UID:', uid);

// 2. Editor 역할 추가
firebase.firestore().collection('user_roles').doc(uid).set({
    role: 'editor',
    projectId: 'P1',
    allowedProcesses: [1, 2, 3, 4, 5, 6],
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
}).then(() => {
    console.log('✅ 역할 추가 완료');
    location.reload(); // 페이지 새로고침
});

// 또는 Admin 역할 추가
firebase.firestore().collection('user_roles').doc(uid).set({
    role: 'admin',
    projectId: 'P1',
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
}).then(() => {
    console.log('✅ Admin 역할 추가 완료');
    location.reload();
});
```

**⚠️ 주의**: 이 방법은 보안 규칙에 따라 작동하지 않을 수 있습니다. Admin 권한이 필요할 수 있습니다.

### 방법 2: Firebase Console에서 직접 추가
1. Firebase Console → Firestore Database → Data
2. `user_roles` 컬렉션 선택
3. "Add document" 클릭
4. 문서 ID: 사용자 UID (브라우저 콘솔에서 확인)
5. 필드 추가:
   - `role`: "editor" 또는 "admin"
   - `updatedAt`: timestamp
6. Save 클릭

---

## 일반적인 오류 메시지와 해결 방법

| 오류 메시지 | 원인 | 해결 방법 |
|------------|------|----------|
| "접근 권한이 없습니다" | user_roles에 문서 없음 | 문서 추가 |
| "사용자 역할이 설정되지 않았습니다" | role 필드 없음 | role 필드 추가 |
| "Missing or insufficient permissions" | 보안 규칙 문제 | 규칙 확인 및 배포 |
| "사용자 인증 정보를 확인할 수 없습니다" | 인증 실패 | 로그인 확인 |

---

## 확인 명령어 (브라우저 콘솔)

### 현재 사용자 확인
```javascript
firebase.auth().currentUser
```

### 사용자 UID 확인
```javascript
firebase.auth().currentUser.uid
```

### 역할 문서 확인
```javascript
const uid = firebase.auth().currentUser.uid;
firebase.firestore().collection('user_roles').doc(uid).get()
    .then(doc => {
        if (doc.exists) {
            console.log('✅ 문서 존재:', doc.data());
        } else {
            console.log('❌ 문서 없음');
        }
    });
```

### 역할 수동 설정 (Admin 권한 필요)
```javascript
const uid = firebase.auth().currentUser.uid;
firebase.firestore().collection('user_roles').doc(uid).set({
    role: 'admin',
    projectId: 'P1',
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
});
```

---

## 문제 해결 순서

1. ✅ **브라우저 콘솔에서 UID 확인**
2. ✅ **Firestore에서 user_roles 문서 확인**
3. ✅ **보안 규칙 배포 확인** (Publish 버튼)
4. ✅ **role 필드 확인** (소문자, 정확한 값)
5. ✅ **페이지 새로고침** (Ctrl+F5)
6. ✅ **콘솔 메시지 확인**

---

## 여전히 작동하지 않는 경우

1. **브라우저 캐시 삭제** 후 다시 시도
2. **시크릿 모드**에서 테스트
3. **Firebase Console**에서 직접 문서 확인
4. **보안 규칙** 다시 배포 (Publish 버튼)
5. **관리자에게 문의**: sbd_pmo@naver.com
