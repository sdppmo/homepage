# 다음 확인사항 체크리스트

> 작성일: 2026-01-25  
> 목적: Firestore Rules 배포 후 시스템 검증 가이드

---

## 📋 1단계: Firestore Rules 배포 확인

### ✅ Rules 배포 상태 확인

- [ ] Firebase Console → Firestore Database → Rules 접속
- [ ] 최신 규칙이 배포되었는지 확인
- [ ] Rules 편집기에서 "Published" 상태 확인
- [ ] 규칙 내용이 다음 구조인지 확인:
  - `isSignedInNonAnon()` 함수 (익명 로그인 차단)
  - `hasRoleInProject(projectId)` 함수
  - `isAdminInProject(projectId)` 함수
  - `projects/{projectId}/members/{uid}` 경로 규칙

### ✅ Rules 테스트

- [ ] Rules 편집기에서 "Rules playground" 또는 "시뮬레이션" 기능 사용
- [ ] Admin 사용자로 `projects/P1` 읽기 테스트 → ✅ 성공
- [ ] 비멤버 사용자로 `projects/P1` 읽기 테스트 → ❌ 실패 (예상)

---

## 🔧 2단계: 첫 번째 Admin 부트스트랩

### ✅ Admin UID 확인

- [ ] Firebase Console → Authentication → Users 접속
- [ ] Admin 계정의 UID 확인
- [ ] UID 복사 (예: `abc123def456...`)

### ✅ Admin 멤버 문서 생성

- [ ] Firebase Console → Firestore Database → Data 접속
- [ ] `projects` 컬렉션 클릭
- [ ] `P1` 문서 클릭 (없으면 생성)
- [ ] `members` 서브컬렉션 클릭 (없으면 생성)
- [ ] "문서 추가" 클릭
- [ ] 문서 ID: Admin UID 입력
- [ ] 필드 추가:
  - `role` (string): `admin`
  - `allowedProcesses` (array): `[]` (빈 배열)
- [ ] 저장

### ✅ 부트스트랩 확인

- [ ] 생성된 문서 경로: `projects/P1/members/{ADMIN_UID}`
- [ ] 문서 필드 확인:
  - `role: "admin"` ✅
  - `allowedProcesses: []` ✅

---

## 🔐 3단계: Admin 로그인 및 접근 확인

### ✅ Admin 로그인

- [ ] Admin 계정으로 로그인
  - 방법 1: UI 로그인 버튼 사용
  - 방법 2: 콘솔에서 직접 로그인 (디버그용)
    ```javascript
    firebase.auth().signInWithEmailAndPassword("admin@example.com", "password")
      .then(() => location.reload());
    ```

### ✅ 콘솔 로그 확인

브라우저 콘솔(F12)에서 다음 메시지들이 순서대로 나타나는지 확인:

- [ ] `✅ Firebase 사용자 로그인: [UID] [email]`
- [ ] `🔍 Firebase 사용자 확인: [UID] [email]`
- [ ] `✅ Firebase에서 역할 로드: admin []`
- [ ] `📋 Firestore 문서 데이터: {role: "admin", allowedProcesses: []}`
- [ ] `✅ [가드] 역할 적용: admin 허용 공정: []`
- [ ] `✅ [가드] 멤버 확인 완료 - 프로젝트 접근 허용`
- [ ] `✅ [가드] 멤버 확인 완료 - setupFirebaseRealtimeListener() 호출`
- [ ] `✅ Firebase 실시간 동기화 시작: projects/P1`

### ✅ 접근 차단 UI 확인

- [ ] 접근 차단 화면이 **표시되지 않음** ✅
- [ ] 정상적인 프로젝트 페이지가 표시됨 ✅
- [ ] `.container` 요소가 접근 차단 UI로 덮여있지 않음 ✅

---

## 🎨 4단계: Admin UI 확인

### ✅ Admin 설정 영역 표시

- [ ] 헤더 정보 영역에 "Admin 설정" 섹션이 **표시됨** ✅
- [ ] `#admin-role-settings` 요소가 `display: block` 상태 ✅
- [ ] Admin 설정, Editor 설정, Viewer 설정 입력 필드가 모두 보임 ✅

### ✅ 역할 기반 UI 활성화

#### 입력창 활성화
- [ ] `#work-date` (작업일 입력) - `disabled: false`, `opacity: 1` ✅
- [ ] `#column-grid-input` (기둥 그리드 입력) - `pointerEvents: auto`, `opacity: 1` ✅
- [ ] 저장 버튼 - `disabled: false`, `opacity: 1` ✅

#### 공정 버튼 활성화
- [ ] 모든 공정 버튼 (1~6)이 활성화됨 ✅
- [ ] 공정 버튼에 `opacity: 0.25` 스타일이 **없음** ✅
- [ ] 공정 버튼이 클릭 가능함 ✅

#### 역할 배지
- [ ] 역할 배지가 "관리자 - 모든 권한"으로 표시됨 ✅
- [ ] 역할 배지 색상이 Admin 색상 (예: 파란색/보라색) ✅

### ✅ 콘솔 명령어로 확인

```javascript
// 현재 상태 확인
console.log('역할:', window.userRole);
console.log('허용 공정:', window.allowedProcesses);
console.log('Admin 설정 영역:', document.getElementById('admin-role-settings')?.style.display);

// Firestore 역할 확인
loadUserRoleFromFirebase().then(role => {
    console.log('Firestore 역할:', role);
});
```

**예상 출력:**
```
역할: admin
허용 공정: []
Admin 설정 영역: block
Firestore 역할: {role: "admin", allowedProcesses: []}
```

---

## 👥 5단계: Editor/Viewer 추가 및 테스트

### ✅ Editor 추가

1. **Admin UI에서 Editor 추가**
   - [ ] Editor 설정에서 UID 입력
   - [ ] 허용할 공정 선택 (예: 3, 4, 5)
   - [ ] "Editor 설정" 버튼 클릭
   - [ ] 성공 메시지 확인

2. **Firestore 확인**
   - [ ] `projects/P1/members/{EDITOR_UID}` 문서 생성 확인
   - [ ] `role: "editor"` 확인
   - [ ] `allowedProcesses: [3, 4, 5]` 확인

3. **Editor 로그인 테스트**
   - [ ] Editor 계정으로 로그인
   - [ ] 콘솔에 `✅ Firebase에서 역할 로드: editor [3, 4, 5]` 확인
   - [ ] 공정 3, 4, 5 버튼만 활성화 확인
   - [ ] 공정 1, 2, 6 버튼은 `opacity: 0.25` 확인
   - [ ] 공정 3, 4, 5에서만 데이터 수정 가능 확인

### ✅ Viewer 추가

1. **Admin UI에서 Viewer 추가**
   - [ ] Viewer 설정에서 UID 입력
   - [ ] "Viewer 설정" 버튼 클릭
   - [ ] 성공 메시지 확인

2. **Firestore 확인**
   - [ ] `projects/P1/members/{VIEWER_UID}` 문서 생성 확인
   - [ ] `role: "viewer"` 확인
   - [ ] `allowedProcesses: []` 확인 (또는 없음)

3. **Viewer 로그인 테스트**
   - [ ] Viewer 계정으로 로그인
   - [ ] 콘솔에 `✅ Firebase에서 역할 로드: viewer []` 확인
   - [ ] 모든 입력 필드가 `disabled: true`, `opacity: 0.25` 확인
   - [ ] 모든 공정 버튼이 `opacity: 0.25` 확인
   - [ ] 데이터 수정 불가 확인 (읽기 전용)

---

## 🔄 6단계: 실시간 동기화 확인

### ✅ 실시간 연결 상태

- [ ] 페이지 하단 좌측에 실시간 연결 상태 표시기 확인
- [ ] 상태가 "연결됨" 또는 "활성"으로 표시됨 ✅
- [ ] 마지막 업데이트 시간이 표시됨 ✅

### ✅ 실시간 동기화 테스트

1. **다른 브라우저/계정에서 테스트**
   - [ ] Admin 계정으로 브라우저 A에서 데이터 수정
   - [ ] Editor 계정으로 브라우저 B에서 확인
   - [ ] 변경사항이 실시간으로 반영되는지 확인 ✅

2. **콘솔 로그 확인**
   - [ ] `✅ Firebase 실시간 동기화 시작: projects/P1` 메시지 확인
   - [ ] `onSnapshot` 콜백이 정상 작동하는지 확인
   - [ ] 권한 오류가 없는지 확인

---

## 🚨 7단계: 오류 시나리오 테스트

### ✅ 비멤버 접근 차단

- [ ] 멤버가 아닌 계정으로 로그인
- [ ] 접근 차단 화면이 표시되는지 확인 ✅
- [ ] 콘솔에 `❌ [가드] 프로젝트 멤버가 아닙니다. 접근이 차단됩니다.` 확인
- [ ] `onSnapshot`이 시작되지 않는지 확인 ✅

### ✅ 권한 오류 확인

- [ ] Editor가 허용되지 않은 공정(예: 공정 1)에서 수정 시도
- [ ] 이벤트 핸들러에서 `canEditProcess()` 가드가 작동하는지 확인
- [ ] Firestore 쓰기 시도 시 권한 오류 발생 확인 (예상 동작)

### ✅ 디버그 모드 테스트

- [ ] 디버그 모드 활성화:
  ```javascript
  localStorage.setItem('kcol:debugMode', 'true');
  location.reload();
  ```
- [ ] 접근 차단 화면에 UID, Project ID, Firestore 경로가 표시되는지 확인
- [ ] 디버그 모드 비활성화:
  ```javascript
  localStorage.removeItem('kcol:debugMode');
  location.reload();
  ```
- [ ] 접근 차단 화면에서 UID 등이 숨겨지는지 확인

---

## 📊 8단계: 전체 상태 확인

### ✅ 콘솔 명령어 실행

```javascript
// 전체 상태 확인
async function checkAllStatus() {
    console.log('=== 전체 상태 확인 ===\n');
    
    // 1. 인증 상태
    const user = firebase.auth().currentUser;
    console.log('1. 인증 상태:');
    console.log('   - 로그인:', user ? '✅' : '❌');
    if (user) {
        console.log('   - UID:', user.uid);
        console.log('   - Email:', user.email || '(없음)');
        console.log('   - 익명:', user.isAnonymous ? '⚠️ 예' : '✅ 아니오');
    }
    console.log('');
    
    // 2. 로컬 역할
    console.log('2. 로컬 역할:');
    console.log('   - 역할:', window.userRole || '(없음)');
    console.log('   - 허용 공정:', window.allowedProcesses || []);
    console.log('');
    
    // 3. Firestore 역할
    console.log('3. Firestore 역할:');
    const firestoreRole = await loadUserRoleFromFirebase();
    if (firestoreRole) {
        console.log('   - 역할:', firestoreRole.role);
        console.log('   - 허용 공정:', firestoreRole.allowedProcesses);
    } else {
        console.log('   - ⚠️ Firestore에 역할 문서가 없습니다.');
    }
    console.log('');
    
    // 4. UI 상태
    console.log('4. UI 상태:');
    const adminSettings = document.getElementById('admin-role-settings');
    console.log('   - Admin 설정 영역:', adminSettings?.style.display === 'block' ? '✅ 표시됨' : '❌ 숨김');
    
    const workDateInput = document.getElementById('work-date');
    console.log('   - 작업일 입력:', workDateInput?.disabled ? '❌ 비활성화' : '✅ 활성화');
    console.log('');
    
    // 5. 프로젝트 정보
    const projectId = new URLSearchParams(window.location.search).get('project') || 'P1';
    console.log('5. 프로젝트 정보:');
    console.log('   - 프로젝트 ID:', projectId);
    if (user) {
        console.log('   - Firestore 경로: projects/' + projectId + '/members/' + user.uid);
    }
}

checkAllStatus();
```

**예상 출력 (Admin 계정):**
```
=== 전체 상태 확인 ===

1. 인증 상태:
   - 로그인: ✅
   - UID: abc123...
   - Email: admin@example.com
   - 익명: ✅ 아니오

2. 로컬 역할:
   - 역할: admin
   - 허용 공정: []

3. Firestore 역할:
   - 역할: admin
   - 허용 공정: []

4. UI 상태:
   - Admin 설정 영역: ✅ 표시됨
   - 작업일 입력: ✅ 활성화

5. 프로젝트 정보:
   - 프로젝트 ID: P1
   - Firestore 경로: projects/P1/members/abc123...
```

---

## 📝 참고 문서

- **Admin UI 확인**: `ADMIN_UI_CHECKLIST.md`
- **멤버 추가 방법**: `ADD_MEMBER_CONSOLE.md`
- **콘솔 디버깅 명령어**: `CONSOLE_DEBUG_COMMANDS.md`
- **Firestore Rules**: `firestore.rules`

---

## ✅ 완료 기준

모든 단계의 체크리스트가 완료되면:

- [ ] Admin이 정상적으로 로그인하고 UI가 활성화됨
- [ ] Editor가 허용된 공정만 수정 가능함
- [ ] Viewer가 읽기 전용으로 작동함
- [ ] 비멤버는 접근이 차단됨
- [ ] 실시간 동기화가 정상 작동함
- [ ] 권한 오류가 발생하지 않음

---

**작성 완료일**: 2026-01-25
