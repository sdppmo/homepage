# 콘솔 디버깅 명령어 모음

> 작성일: 2026-01-25  
> 목적: 브라우저 콘솔에서 Admin 로그인 후 UI 상태를 확인하는 명령어

## ⚠️ 중요: 사용 방법

**마크다운 파일에서 복사할 때 주의사항:**
- 코드 블록의 첫 줄과 마지막 줄 (```javascript, ```)은 **복사하지 마세요**
- 코드 내용만 복사하세요
- 또는 `console-commands.js` 파일을 열어서 복사하세요 (더 안전함)

## 🚨 권한 오류가 발생하는 경우

**먼저 진단 명령어 실행:**
```javascript
diagnosePermissionError();
```

이 명령어는 다음을 확인합니다:
1. 로그인 상태
2. 익명 사용자 여부
3. Firestore 권한
4. 멤버 문서 존재 여부

### ⚠️ 중요: 부트스트랩

**"프로젝트 멤버가 아닙니다" 오류가 발생하면:**

Firestore Rules에 의해 멤버가 아닌 사용자는 자신을 Admin으로 승격시킬 수 없습니다. 첫 번째 Admin은 **Firebase Console에서 수동으로 생성**해야 합니다:

1. Firebase Console → Firestore Database → Data
2. `projects/P1/members/{ADMIN_UID}` 문서 생성
3. 필드: `role: "admin"`, `allowedProcesses: []`

자세한 내용은 `ADD_MEMBER_CONSOLE.md` 참조

---

## 🔍 기본 상태 확인

**콘솔에 붙여넣기:**
```javascript
console.log('=== 현재 상태 ===');
console.log('역할:', window.userRole);
console.log('허용 공정:', window.allowedProcesses);
console.log('Admin 설정 영역:', document.getElementById('admin-role-settings')?.style.display);

loadUserRoleFromFirebase().then(role => {
    console.log('=== Firestore 역할 ===');
    console.log('역할:', role);
});
```

---

## 🔐 인증 상태 확인

```javascript
// 현재 로그인한 사용자
const user = firebase.auth().currentUser;
console.log('=== 인증 상태 ===');
console.log('UID:', user?.uid);
console.log('Email:', user?.email);
console.log('익명 사용자:', user?.isAnonymous);

// 프로젝트 ID
const projectId = new URLSearchParams(window.location.search).get('project') || 'P1';
console.log('프로젝트 ID:', projectId);
```

---

## 📋 Firestore 멤버 문서 확인

```javascript
// Firestore에서 직접 멤버 문서 확인
const db = firebase.firestore();
const projectId = new URLSearchParams(window.location.search).get('project') || 'P1';
const uid = firebase.auth().currentUser?.uid;

if (uid) {
    db.collection('projects').doc(projectId)
        .collection('members').doc(uid)
        .get()
        .then(doc => {
            console.log('=== Firestore 멤버 문서 ===');
            if (doc.exists) {
                console.log('문서 존재:', true);
                console.log('데이터:', doc.data());
                console.log('역할:', doc.data().role);
                console.log('허용 공정:', doc.data().allowedProcesses);
            } else {
                console.log('문서 존재:', false);
                console.log('경로: projects/' + projectId + '/members/' + uid);
                console.log('⚠️ 멤버 문서가 없습니다. Admin에게 멤버 추가를 요청하세요.');
            }
        });
} else {
    console.error('❌ 로그인된 사용자가 없습니다.');
}
```

---

## 🎨 UI 요소 상태 확인

```javascript
// 입력창 상태 확인
const workDateInput = document.getElementById('work-date');
const columnGridInput = document.getElementById('column-grid-input');
const saveButton = document.querySelector('#panel-input button[onclick*="saveSelectedColumns"]');

console.log('=== UI 요소 상태 ===');
console.log('작업일 입력:', {
    disabled: workDateInput?.disabled,
    opacity: workDateInput?.style.opacity,
    value: workDateInput?.value
});
console.log('기둥 그리드 입력:', {
    pointerEvents: columnGridInput?.style.pointerEvents,
    opacity: columnGridInput?.style.opacity
});
console.log('저장 버튼:', {
    disabled: saveButton?.disabled,
    opacity: saveButton?.style.opacity
});

// 공정 버튼 상태 확인
const processButtons = document.querySelectorAll('.process-btn');
console.log('=== 공정 버튼 상태 ===');
processButtons.forEach(btn => {
    const processId = btn.getAttribute('data-process');
    console.log(`공정 ${processId}:`, {
        opacity: btn.style.opacity,
        disabled: btn.disabled,
        active: btn.classList.contains('active')
    });
});

// Admin 설정 영역
const adminSettings = document.getElementById('admin-role-settings');
console.log('Admin 설정 영역:', {
    존재: !!adminSettings,
    display: adminSettings?.style.display,
    visible: adminSettings?.offsetParent !== null
});
```

---

## 🔄 역할 재적용

```javascript
// 역할을 다시 로드하고 UI 적용
async function reloadRole() {
    console.log('🔄 역할 재로드 중...');
    await loadUserRole();
    applyRoleBasedUI();
    console.log('✅ 역할 재적용 완료');
    console.log('현재 역할:', window.userRole);
}

reloadRole();
```

---

## 🧪 테스트용 역할 설정

```javascript
// 테스트용 역할 설정 (Firestore와 무관하게 UI만 테스트)
function testRole(role, processes = []) {
    userRole = role;
    allowedProcesses = processes;
    applyRoleBasedUI();
    console.log(`✅ 테스트 역할 설정: ${role}`, processes.length > 0 ? `(공정: ${processes.join(', ')})` : '');
}

// 사용 예시:
// testRole('admin');           // Admin으로 테스트
// testRole('editor', [3, 4, 5]); // Editor (공정 3,4,5)로 테스트
// testRole('viewer');          // Viewer로 테스트
```

---

## 📊 전체 상태 요약

```javascript
// 모든 상태를 한 번에 확인
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

// 실행
checkAllStatus();
```

---

## 🚨 문제 해결

### userRole이 undefined인 경우

```javascript
// 1. 페이지가 완전히 로드되었는지 확인
console.log('문서 준비 상태:', document.readyState);

// 2. 역할 재로드
loadUserRole().then(() => {
    console.log('역할 재로드 완료:', window.userRole);
});

// 3. 수동으로 역할 설정 (테스트용)
userRole = 'admin';
applyRoleBasedUI();
console.log('수동 설정 완료:', window.userRole);
```

### Admin 설정 영역이 보이지 않는 경우

```javascript
// 1. 역할 확인
console.log('현재 역할:', window.userRole);

// 2. Admin 설정 영역 강제 표시 (테스트용)
const adminSettings = document.getElementById('admin-role-settings');
if (adminSettings) {
    adminSettings.style.display = 'block';
    console.log('✅ Admin 설정 영역 강제 표시');
} else {
    console.error('❌ Admin 설정 영역 요소를 찾을 수 없습니다.');
}

// 3. 역할 기반 UI 재적용
applyRoleBasedUI();
```

---

**작성 완료일**: 2026-01-25
