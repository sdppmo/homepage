# Admin 로그인 후 UI 확인 체크리스트

> 작성일: 2026-01-25  
> 목적: Admin 로그인 후 UI가 정상적으로 표시되는지 확인

---

## ✅ 확인 항목

### 1. 로그인 및 역할 로드

- [ ] Admin 계정으로 로그인 성공
- [ ] 콘솔에 `✅ Firebase 사용자 로그인: [UID] [email]` 메시지 표시
- [ ] 콘솔에 `✅ Firebase에서 역할 로드: admin []` 메시지 표시
- [ ] 콘솔에 `✅ [가드] 역할 적용: admin 허용 공정: []` 메시지 표시
- [ ] 콘솔에 `✅ [가드] 멤버 확인 완료 - 프로젝트 접근 허용` 메시지 표시

### 2. 접근 차단 UI 확인

- [ ] 접근 차단 화면이 **표시되지 않음**
- [ ] 정상적인 프로젝트 페이지가 표시됨
- [ ] `.container` 요소가 접근 차단 UI로 덮여있지 않음

### 3. Admin 설정 영역 표시

- [ ] 헤더 정보 영역에 "Admin 설정" 섹션이 **표시됨**
- [ ] `#admin-role-settings` 요소가 `display: block` 상태
- [ ] Admin 설정, Editor 설정, Viewer 설정 입력 필드가 모두 보임

### 4. 역할 기반 UI 활성화

#### 입력창 활성화
- [ ] `#work-date` (작업일 입력) - `disabled: false`, `opacity: 1`
- [ ] `#column-grid-input` (기둥 그리드 입력) - `pointerEvents: auto`, `opacity: 1`
- [ ] 저장 버튼 - `disabled: false`, `opacity: 1`

#### 공정 버튼 활성화
- [ ] 모든 공정 버튼 (1~6)이 활성화됨
- [ ] 공정 버튼에 `opacity: 0.25` 스타일이 **없음**
- [ ] 공정 버튼이 클릭 가능함

#### 패널 접근
- [ ] "일일 입력" 패널 접근 가능
- [ ] "운송차수계획" 패널 접근 가능 (Admin만)
- [ ] 모든 탭 버튼이 활성화됨

#### Excel 업로드
- [ ] 공정 Excel 업로드 버튼 활성화
- [ ] 운송물량산정 Excel 업로드 버튼 활성화
- [ ] 운송차수계획 Excel 업로드 버튼 활성화 (Admin만)

### 5. 역할 배지 표시

- [ ] 역할 배지가 "관리자 - 모든 권한"으로 표시됨
- [ ] 역할 배지 색상이 Admin 색상 (예: 파란색/보라색)

### 6. 실시간 동기화

- [ ] 콘솔에 `✅ [가드] 멤버 확인 완료 - setupFirebaseRealtimeListener() 호출` 메시지 표시
- [ ] 실시간 연결 상태 표시기가 "연결됨" 상태
- [ ] Firestore 데이터가 실시간으로 동기화됨

---

## 🔍 콘솔 확인 명령어

브라우저 콘솔(F12)에서 다음 명령어로 상태 확인:

```javascript
// 현재 사용자 확인
console.log('현재 사용자:', firebase.auth().currentUser?.uid);

// 역할 확인
console.log('userRole:', userRole);
console.log('allowedProcesses:', allowedProcesses);

// Admin 설정 영역 표시 여부
const adminSettings = document.getElementById('admin-role-settings');
console.log('Admin 설정 영역:', adminSettings?.style.display);

// 역할 기반 UI 적용 여부
const workDateInput = document.getElementById('work-date');
console.log('작업일 입력 disabled:', workDateInput?.disabled);
console.log('작업일 입력 opacity:', workDateInput?.style.opacity);

// Firestore 역할 확인
loadUserRoleFromFirebase().then(role => {
    console.log('Firestore 역할:', role);
});
```

---

## 🐛 문제 해결

### Admin 설정 영역이 보이지 않는 경우

1. **역할 확인**
   ```javascript
   loadUserRoleFromFirebase().then(role => {
       console.log('역할:', role);
   });
   ```

2. **Firestore 문서 확인**
   - 경로: `projects/{PROJECT_ID}/members/{UID}`
   - `role` 필드가 `"admin"`인지 확인

3. **수동으로 UI 적용**
   ```javascript
   userRole = 'admin';
   applyRoleBasedUI();
   ```

### 접근 차단 화면이 계속 표시되는 경우

1. **멤버 문서 확인**
   ```javascript
   const db = firebase.firestore();
   const projectId = new URLSearchParams(window.location.search).get('project') || 'P1';
   const uid = firebase.auth().currentUser?.uid;
   
   db.collection('projects').doc(projectId)
     .collection('members').doc(uid)
     .get()
     .then(doc => {
         console.log('멤버 문서:', doc.exists ? doc.data() : '없음');
     });
   ```

2. **Admin으로 멤버 추가**
   - 다른 Admin 계정으로 로그인
   - Admin 설정 영역에서 현재 UID를 Admin으로 추가

---

## 📝 예상 콘솔 출력 (정상)

```
✅ Firebase 사용자 로그인: abc123... admin@example.com
🔍 Firebase 사용자 확인: abc123... admin@example.com
✅ Firebase에서 역할 로드: admin []
📋 Firestore 문서 데이터: {role: "admin", allowedProcesses: []}
✅ [가드] 역할 적용: admin 허용 공정: []
✅ [가드] 멤버 확인 완료 - 프로젝트 접근 허용
✅ [가드] 멤버 확인 완료 - setupFirebaseRealtimeListener() 호출
🔍 setupFirebaseRealtimeListener 호출됨
✅ Firebase 실시간 동기화 시작: projects/P1
```

---

**작성 완료일**: 2026-01-25
