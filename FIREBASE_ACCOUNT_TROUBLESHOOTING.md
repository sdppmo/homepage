# Firebase 계정 로그인 문제 해결

## ❌ 오류: `auth/invalid-login-credentials`

이 오류는 다음 중 하나를 의미합니다:
1. 이메일 주소가 잘못되었습니다
2. 비밀번호가 잘못되었습니다
3. 해당 계정이 Firebase Authentication에 존재하지 않습니다

---

## 🔍 해결 방법

### 방법 1: Firebase Console에서 계정 확인 및 비밀번호 재설정

1. **Firebase Console 접속**
   - https://console.firebase.google.com/
   - 프로젝트: `hakdong-a80b8` 선택

2. **Authentication → Users 메뉴로 이동**
   - 왼쪽 메뉴에서 "Authentication" 클릭
   - "Users" 탭 확인

3. **기존 계정 확인**
   - `teddy1092@gmail.com` 계정이 있는지 확인
   - 있으면: 비밀번호 재설정 가능
   - 없으면: 새 계정 생성 필요

4. **비밀번호 재설정 (계정이 있는 경우)**
   - 계정 옆 "⋮" 메뉴 클릭
   - "Reset password" 선택
   - 새 비밀번호 입력

---

### 방법 2: 새 Admin 계정 생성 (권장)

기존 계정에 문제가 있으면 새 계정을 만드는 것이 더 빠릅니다.

#### 2-1. Firebase Console에서 새 사용자 생성

1. **Firebase Console → Authentication → Users**
2. **"Add user" 버튼 클릭**
3. **새 계정 정보 입력:**
   ```
   Email: admin@example.com (원하는 이메일)
   Password: [강력한 비밀번호 입력]
   ```
4. **"Add user" 클릭하여 생성**

#### 2-2. Firestore에서 Admin 멤버 문서 생성

새 계정을 생성한 후, Firestore에서 해당 계정을 Admin으로 등록해야 합니다.

1. **Firebase Console → Firestore Database**
2. **경로 이동:**
   ```
   projects → P1 → members
   ```
3. **"Add document" 클릭**
4. **Document ID 입력:**
   - 새로 생성한 사용자의 **UID** 입력
   - UID 확인 방법: Authentication → Users → 해당 사용자 클릭 → "User UID" 복사
5. **필드 추가:**
   ```
   role: "admin" (string)
   allowedProcesses: [] (array, 빈 배열)
   ```
6. **"Save" 클릭**

#### 2-3. 새 계정으로 로그인

콘솔에서:
```javascript
// Firebase 초기화
if (typeof initFirebase === 'function') initFirebase();
const auth = (typeof firebaseAuth !== 'undefined' && firebaseAuth) || firebase.auth();

// 새 계정으로 로그인
auth.signInWithEmailAndPassword('admin@example.com', 'your-password')
    .then(() => {
        console.log('✅ 로그인 성공');
        location.reload();
    })
    .catch(err => console.error('❌ 로그인 실패:', err.message));
```

---

### 방법 3: 콘솔에서 UID 확인 후 직접 멤버 문서 생성

이미 Firebase Authentication에 계정이 있지만 Firestore 멤버 문서가 없는 경우:

1. **콘솔에서 현재 로그인된 사용자 UID 확인:**
   ```javascript
   if (typeof initFirebase === 'function') initFirebase();
   const auth = (typeof firebaseAuth !== 'undefined' && firebaseAuth) || firebase.auth();
   console.log('현재 사용자:', auth.currentUser?.uid);
   ```

2. **Firebase Console → Firestore Database**
3. **경로: `projects/P1/members`**
4. **Document ID: 위에서 확인한 UID**
5. **필드:**
   ```
   role: "admin"
   allowedProcesses: []
   ```

---

## 📋 체크리스트

- [ ] Firebase Console에서 `teddy1092@gmail.com` 계정 존재 확인
- [ ] 계정이 있으면 비밀번호 재설정 시도
- [ ] 계정이 없으면 새 계정 생성
- [ ] Firestore에서 `projects/P1/members/{UID}` 문서 생성
- [ ] `role: "admin"` 설정 확인
- [ ] 새 계정으로 로그인 테스트

---

## 💡 참고사항

- **첫 번째 Admin은 반드시 Firebase Console에서 수동 생성**해야 합니다 (보안 규칙 때문)
- Admin 계정이 생성되면, Admin은 UI에서 다른 사용자(Editor/Viewer)를 추가할 수 있습니다
- 비밀번호는 최소 6자 이상이어야 합니다
