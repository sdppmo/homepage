# 멤버 문서 디버깅 가이드

> 작성일: 2026-01-25  
> 목적: `loadUserRoleFromFirebase()` 결과가 undefined일 때 디버깅

---

## 🔍 단계별 확인

### Step 1: 로그인 상태 확인

```javascript
// 현재 로그인한 사용자 확인
const user = firebase.auth().currentUser;
console.log('=== 인증 상태 ===');
console.log('로그인:', user ? '✅' : '❌');
if (user) {
    console.log('UID:', user.uid);
    console.log('Email:', user.email || '(없음)');
    console.log('익명 사용자:', user.isAnonymous ? '⚠️ 예' : '✅ 아니오');
} else {
    console.error('❌ 로그인되지 않았습니다. 먼저 로그인하세요.');
}
```

**예상 출력:**
```
=== 인증 상태 ===
로그인: ✅
UID: 42ZPnQyuOuWxjrQ62AhhoWWOseJ2
Email: admin@example.com
익명 사용자: ✅ 아니오
```

---

### Step 2: Firestore 문서 직접 확인

```javascript
// Firebase 초기화 확인
if (typeof initFirebase === 'function') {
    initFirebase();
}

// Firestore에서 직접 멤버 문서 확인
// 이 프로젝트는 firebaseDb 변수를 사용합니다
const projectId = new URLSearchParams(window.location.search).get('project') || 'P1';
const uid = firebase.auth().currentUser?.uid;

console.log('=== Firestore 문서 확인 ===');
console.log('프로젝트 ID:', projectId);
console.log('UID:', uid);

if (uid) {
    // firebaseDb가 초기화되었는지 확인
    if (typeof firebaseDb === 'undefined' || firebaseDb === null) {
        console.error('❌ Firestore가 초기화되지 않았습니다.');
        console.log('💡 initFirebase() 함수를 먼저 호출하세요.');
        if (typeof initFirebase === 'function') {
            initFirebase();
            console.log('✅ initFirebase() 호출 완료. 잠시 후 다시 시도하세요.');
        }
    } else {
        firebaseDb.collection('projects').doc(projectId)
            .collection('members').doc(uid)
            .get()
            .then(doc => {
            console.log('=== 멤버 문서 결과 ===');
            if (doc.exists) {
                console.log('✅ 문서 존재:', true);
                console.log('📋 전체 데이터:', doc.data());
                console.log('📋 role 필드:', doc.data().role);
                console.log('📋 allowedProcesses 필드:', doc.data().allowedProcesses);
                console.log('📋 allowedProcesses 타입:', typeof doc.data().allowedProcesses);
            } else {
                console.log('❌ 문서 존재:', false);
                console.log('경로: projects/' + projectId + '/members/' + uid);
                console.log('⚠️ 멤버 문서가 없습니다.');
                console.log('💡 Firebase Console에서 문서를 생성했는지 확인하세요.');
            }
        })
            .catch(error => {
                console.error('❌ Firestore 읽기 오류:', error);
                console.error('오류 코드:', error.code);
                console.error('오류 메시지:', error.message);
            });
    }
} else {
    console.error('❌ UID가 없습니다. 먼저 로그인하세요.');
}
```

---

### Step 3: loadUserRoleFromFirebase() 상세 확인

```javascript
// loadUserRoleFromFirebase() 실행 및 상세 로그 확인
loadUserRoleFromFirebase()
    .then(role => {
        console.log('=== loadUserRoleFromFirebase() 결과 ===');
        if (role) {
            console.log('✅ 역할 로드 성공');
            console.log('역할:', role);
            console.log('role 필드:', role.role);
            console.log('allowedProcesses 필드:', role.allowedProcesses);
        } else {
            console.log('❌ 역할 로드 실패 (null 반환)');
            console.log('💡 위의 Step 1, 2를 확인하세요.');
        }
    })
    .catch(error => {
        console.error('❌ Promise 오류:', error);
    });
```

---

## 🐛 문제 해결

### 문제 1: 로그인되지 않음

**증상:**
```
로그인: ❌
```

**해결:**
1. 로그인 페이지로 이동: `/pages/auth/login.html`
2. Admin 계정으로 로그인
3. 프로젝트 페이지로 돌아가기

---

### 문제 2: 문서가 존재하지 않음

**증상:**
```
문서 존재: false
경로: projects/P1/members/42ZPnQyuOuWxjrQ62AhhoWWOseJ2
```

**해결:**
1. Firebase Console → Firestore Database → Data
2. `projects` → `P1` → `members` 확인
3. 문서 ID가 UID와 정확히 일치하는지 확인
4. 문서가 없으면 생성

---

### 문제 3: 권한 오류

**증상:**
```
❌ Firestore 읽기 오류: FirebaseError: Missing or insufficient permissions.
```

**해결:**
1. Firestore Rules 확인
2. `projects/{projectId}/members/{uid}` read 규칙 확인
3. Rules 배포 확인

---

### 문제 4: 콘솔 로그가 출력되지 않음

**증상:**
- Promise는 fulfilled이지만 콘솔에 아무것도 출력되지 않음

**해결:**
1. 브라우저 콘솔 필터 확인 (오류만 표시되어 있는지 확인)
2. 콘솔 새로고침
3. 위의 Step 1, 2를 순서대로 실행

---

## ✅ 정상 작동 시 예상 출력

```javascript
// Step 1 출력
=== 인증 상태 ===
로그인: ✅
UID: 42ZPnQyuOuWxjrQ62AhhoWWOseJ2
Email: admin@example.com
익명 사용자: ✅ 아니오

// Step 2 출력
=== 멤버 문서 결과 ===
✅ 문서 존재: true
📋 전체 데이터: {role: "admin", allowedProcesses: []}
📋 role 필드: admin
📋 allowedProcesses 필드: []
📋 allowedProcesses 타입: object

// Step 3 출력
🔍 Firebase 사용자 확인: 42ZPnQyuOuWxjrQ62AhhoWWOseJ2 admin@example.com
✅ Firebase에서 역할 로드: admin []
📋 Firestore 문서 데이터: {role: "admin", allowedProcesses: []}
=== loadUserRoleFromFirebase() 결과 ===
✅ 역할 로드 성공
역할: {role: "admin", allowedProcesses: []}
role 필드: admin
allowedProcesses 필드: []
```

---

**작성 완료일**: 2026-01-25
