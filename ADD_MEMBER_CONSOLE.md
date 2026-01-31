# 멤버 추가 방법

> 작성일: 2026-01-25  
> 목적: 프로젝트 멤버 추가 및 부트스트랩 가이드

---

## 🚨 문제 상황

**오류 메시지:**
```
❌ [가드] 프로젝트 멤버가 아닙니다. 접근이 차단됩니다.
```

**원인:**
- Firestore의 `projects/{projectId}/members/{uid}` 경로에 멤버 문서가 없음
- 사용자가 로그인은 했지만 프로젝트 멤버로 등록되지 않음

---

## 🔧 부트스트랩: 첫 번째 Admin 생성

**중요:** Firestore Rules에 의해 멤버가 아닌 사용자는 자신을 Admin으로 승격시킬 수 없습니다. `members` 쓰기는 Admin만 가능하므로, 첫 번째 Admin은 **Firebase Console에서 수동으로 생성**해야 합니다.

### Firebase Console에서 첫 번째 Admin 생성

1. **Firebase Console 접속**
   - https://console.firebase.google.com
   - 프로젝트 선택

2. **Firestore Database → Data 탭**

3. **컬렉션 경로 생성**
   ```
   projects → P1 → members → {ADMIN_UID}
   ```

4. **문서 생성**
   - 문서 ID: Admin 사용자의 UID (Firebase Authentication에서 확인)
   - 필드 추가:
     ```
     role: "admin" (string)
     allowedProcesses: [] (array)
     ```

5. **저장**

### Admin UID 확인 방법

**Firebase Console → Authentication → Users**에서 확인 (권장)

또는 애플리케이션 코드(v9 모듈)에서 `getAuth().currentUser.uid` 사용

**브라우저 콘솔에서 `firebase.auth()` 방식은 사용하지 않음 (v9 미지원)**

---

## ✅ 멤버 추가 방법 (첫 번째 Admin 생성 후)

### 방법 1: Admin UI에서 추가 (권장)

1. **Admin 계정으로 로그인**
   - 첫 번째 Admin으로 로그인

2. **프로젝트 페이지 접속**
   ```
   http://192.168.0.18:8080/pages/K-product/2H_steel_product.html?project=P1
   ```

3. **Admin 설정 영역에서 멤버 추가**
   - 헤더의 "Admin 설정" 영역 확인
   - Editor/Viewer/Admin 설정에서 UID 입력
   - 역할 선택 후 설정 버튼 클릭

---

### 방법 2: 콘솔에서 추가 (Admin 계정 필요)

**주의:** Admin 계정으로 로그인한 상태에서만 작동합니다.

#### A. Editor로 추가

```javascript
// Editor 추가 (공정 3, 4, 5 허용 예시)
const targetUID = '추가할-사용자-UID';
const projectId = new URLSearchParams(window.location.search).get('project') || 'P1';

// setEditorByUID 함수 사용 (페이지에 정의되어 있음)
if (typeof setEditorByUID === 'function') {
    setEditorByUID(targetUID, [3, 4, 5])
        .then(success => {
            if (success) {
                console.log('✅ Editor 추가 완료');
            }
        });
} else {
    console.error('❌ setEditorByUID 함수를 찾을 수 없습니다.');
    console.log('💡 페이지가 완전히 로드된 후 다시 시도하세요.');
}
```

#### B. Viewer로 추가

```javascript
const targetUID = '추가할-사용자-UID';
const projectId = new URLSearchParams(window.location.search).get('project') || 'P1';

if (typeof setViewerByUID === 'function') {
    setViewerByUID(targetUID)
        .then(success => {
            if (success) {
                console.log('✅ Viewer 추가 완료');
            }
        });
} else {
    console.error('❌ setViewerByUID 함수를 찾을 수 없습니다.');
}
```

#### C. Admin으로 추가

```javascript
const targetUID = '추가할-사용자-UID';
const projectId = new URLSearchParams(window.location.search).get('project') || 'P1';

if (typeof setAdminByUID === 'function') {
    setAdminByUID(targetUID)
        .then(success => {
            if (success) {
                console.log('✅ Admin 추가 완료');
            }
        });
} else {
    console.error('❌ setAdminByUID 함수를 찾을 수 없습니다.');
}
```

---

## 📋 전체 프로세스

### 시나리오 1: 최초 설정 (부트스트랩)

1. **Firebase Console에서 첫 번째 Admin 생성**
   - `projects/P1/members/{ADMIN_UID}` 문서 생성
   - `role: "admin"`, `allowedProcesses: []`

2. **Admin 계정으로 로그인**
   ```javascript
   firebase.auth().signInWithEmailAndPassword("admin@example.com", "password")
     .then(() => location.reload());
   ```

3. **프로젝트 페이지 접속**
   - Admin 설정 영역이 보임
   - 이제 다른 사용자를 멤버로 추가할 수 있음

### 시나리오 2: 새 사용자를 Editor로 추가

1. **Admin 계정으로 로그인**
2. **프로젝트 페이지 접속**
3. **Admin 설정 영역에서 멤버 추가**
   - Editor 설정에서 UID 입력
   - 허용할 공정 선택 (예: 3, 4, 5)
   - "Editor 설정" 버튼 클릭
4. **추가된 사용자로 로그인**
   - 추가된 사용자가 로그인하면 접근 가능

---

## 🔍 현재 사용자 UID 확인

**Firebase Console → Authentication → Users**에서 확인 (권장)

또는 애플리케이션 코드(v9 모듈)에서 `getAuth().currentUser.uid` 사용

**브라우저 콘솔에서 `firebase.auth()` 방식은 사용하지 않음 (v9 미지원)**

### 디버그 모드로 접근 차단 화면에서 확인

1. **디버그 모드 활성화**
   ```javascript
   localStorage.setItem('kcol:debugMode', 'true');
   location.reload();
   ```

2. **접근 차단 화면에서 UID 확인**
   - 디버그 모드에서 접근 차단 화면에 UID가 표시됩니다.

---

## ⚠️ 중요 사항

### Firestore Rules 제약

- **멤버가 아닌 사용자는 자신을 Admin으로 승격시킬 수 없음**
  - `members` 쓰기는 Admin만 가능
  - 따라서 첫 번째 Admin은 Firebase Console에서 수동으로 생성해야 함

### 권한 오류 발생 시

- **"permission-denied" 오류**: Admin 권한이 없거나 멤버 문서가 없음
- **해결**: Firebase Console에서 첫 번째 Admin 생성 또는 다른 Admin에게 요청

### 부트스트랩 체크리스트

- [ ] Firebase Console에서 `projects/P1/members/{ADMIN_UID}` 문서 생성
- [ ] `role: "admin"` 필드 설정
- [ ] `allowedProcesses: []` 필드 설정 (빈 배열)
- [ ] Admin 계정으로 로그인하여 확인
- [ ] Admin 설정 영역이 표시되는지 확인

---

## 📝 Firebase Console에서 문서 생성 단계

1. Firebase Console → Firestore Database → Data
2. `projects` 컬렉션 클릭
3. `P1` 문서 클릭 (없으면 생성)
4. `members` 서브컬렉션 클릭 (없으면 생성)
5. "문서 추가" 클릭
6. 문서 ID: Admin 사용자의 UID 입력
7. 필드 추가:
   - `role` (string): `admin`
   - `allowedProcesses` (array): `[]` (빈 배열)
8. 저장

---

**작성 완료일**: 2026-01-25
