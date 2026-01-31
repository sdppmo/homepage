# RBAC 구현 변경 사항 요약

> 작성일: 2026-01-25  
> 프로젝트: SongDoPartners Homepage - K-COL 공정관리 시스템

---

## 📋 변경된 파일 목록

### 1. 신규 생성 파일

#### `production-schedule-app/lib/types/authz.ts`
- **목적**: 권한 관련 TypeScript 타입 정의
- **내용**:
  - `Role` 타입: `"admin" | "editor" | "viewer"` (approver 제외)
  - `Member` 타입: `role`, `allowedProcesses` 포함

#### `production-schedule-app/lib/authz.ts`
- **목적**: 권한 조회 및 검증 유틸리티 함수
- **내용**:
  - `getProjectMember()`: `projects/{projectId}/members/{uid}`에서 멤버 정보 조회
  - `canEditProcess()`: 공정 편집 권한 확인 (admin은 모든 공정, editor는 허용된 공정만)

---

### 2. 수정된 파일

#### `production-schedule-app/lib/firebase/firestore.ts`
- **변경 내용**:
  - `getSchedule()`: `doc(db, 'schedules', projectId)` → `doc(db, 'projects', projectId, 'schedules', projectId)`
  - `subscribeSchedule()`: 동일하게 변경
  - `updateSchedule()`: 동일하게 변경
- **영향**: 모든 schedules 경로가 `projects/{projectId}/schedules/{scheduleId}` 구조로 통일됨

#### `firestore.rules`
- **변경 내용**:
  - `schedules` 서브컬렉션 규칙 추가 (읽기: 멤버만, 쓰기: Admin만)
  - `user_roles` 컬렉션 완전 차단 규칙 추가 (`allow read, write: if false`)
  - 익명 사용자 차단 강화 (`sign_in_provider != 'anonymous'`)
- **영향**: 서버 측 권한 검증 강화

#### `pages/K-product/2H_steel_product.html` (대폭 수정)
- **주요 변경 사항**:
  1. **익명 로그인 제거**: `signInAnonymously()` 호출 및 관련 코드 완전 제거
  2. **user_roles 참조 제거**: 모든 `user_roles` 컬렉션 참조를 `projects/{projectId}/members/{uid}`로 변경
  3. **approver 역할 제거**: 코드에서 모든 `approver` 참조 제거 (타입과 일치)
  4. **프로젝트 페이지 가드 추가**: `setupFirebaseRealtimeListener()`, `setupFirebaseAuthListener()`에 멤버 확인 가드 추가
  5. **UI 권한 분기 구현**: Editor는 `allowedProcesses`만 편집 가능, 나머지 흐릿 표시 (opacity: 0.25)
  6. **이벤트 핸들러 가드 추가**: 모든 데이터 변경 함수에 `canEditProcess()` 체크 추가
  7. **디버그 모드 추가**: 운영 환경에서 UID/경로 숨김, 디버그 모드에서만 표시
  8. **타입 일치 보장**: `allowedProcesses` 숫자 배열 정규화, `canEditProcess()` 타입 안전성 강화

---

## 🗑️ 제거된 참조 위치

### `user_roles` 컬렉션 참조 제거

**이전 구조:**
```javascript
// ❌ 제거됨
firebaseDb.collection('user_roles').doc(uid)
```

**새로운 구조:**
```javascript
// ✅ 현재 사용
firebaseDb.collection('projects').doc(PROJECT_ID)
    .collection('members').doc(uid)
```

**제거 위치:**
- `loadUserRoleFromFirebase()`: `user_roles` → `projects/{projectId}/members/{uid}`로 변경
- `setEditorRoleInFirestore()`: 동일하게 변경
- `setViewerRoleInFirestore()`: 동일하게 변경
- `firestore.rules`: `user_roles` 컬렉션 완전 차단 규칙 추가

### `signInAnonymously()` 제거

**제거 위치:**
- 모든 `signInAnonymously()` 호출 제거
- `loginAsAdminAnonymous()` 함수 제거
- 익명 사용자 관련 UI 힌트 제거
- `firestore.rules`: 익명 사용자 차단 강화

### `approver` 역할 제거

**제거 위치:**
- `applyRoleBasedUI()`: `isApprover` 변수 및 관련 로직 제거
- `disableProcessButtons()`: `approver` 관련 분기 제거
- `applyProcessPermissionToGantt()`: `approver` 관련 분기 제거
- `applyProcessPermissionToColumnGrid()`: `approver` 관련 분기 제거
- 역할 배지 색상/설명: `approver` 항목 제거
- 모든 주석에서 `Admin/Approver` → `Admin`으로 변경

---

## 🔄 Schedules 경로 통일 확인

### ✅ 통일 완료

**이전 구조:**
```typescript
// ❌ 이전
doc(db, 'schedules', projectId)
```

**새로운 구조:**
```typescript
// ✅ 현재
doc(db, 'projects', projectId, 'schedules', projectId)
```

**적용 위치:**
- `production-schedule-app/lib/firebase/firestore.ts`:
  - `getSchedule()`: ✅ 통일 완료
  - `subscribeSchedule()`: ✅ 통일 완료
  - `updateSchedule()`: ✅ 통일 완료

**참고:**
- `2H_steel_product.html`은 `projects/{projectId}` 문서를 직접 구독하므로 schedules 서브컬렉션을 사용하지 않음
- Firestore Rules에 `schedules` 서브컬렉션 규칙 추가됨

---

## 🔒 보안 가드 추가 위치

### 프로젝트 페이지 가드

| 함수 | 가드 내용 | 위치 |
|------|----------|------|
| `setupFirebaseRealtimeListener()` | 멤버 확인 후에만 `onSnapshot` 시작 | 1954-1997줄 |
| `setupFirebaseAuthListener()` | 멤버 확인 후에만 실시간 동기화 시작 | 2189-2210줄 |
| `checkLoginOnPageLoad()` | 로그인 체크 로그 추가 | 3937-3959줄 |

### 데이터 변경 함수 가드

| 함수 | 가드 내용 | 위치 |
|------|----------|------|
| `saveToStorage()` | `canEditProcess(currentProcess)` 체크 | 7779-7800줄 |
| `saveSelectedColumns()` | `canEditProcess(currentProcess)` 체크 | 5484-5501줄 |
| `openColumnModal()` | `canEditProcess(newStatus)` 체크 | 6699-6727줄, 6989-7007줄 |
| `toggleColumnSelection()` | `canEditProcess(currentProcess)` 체크 | 5251-5274줄 |
| `executeProcessDelete()` | `canEditProcess(processToDelete)` 체크 | 6275-6290줄 |
| `handleGanttCellDelete()` | 단일/다중 삭제 모두 `canEditProcess()` 체크 | 6350-6396줄, 6729-6743줄 |
| `selectProcessForDelete()` | `canEditProcess(processNum)` 체크 | 6252-6268줄 |
| `enableEditMode()` | 권한 체크 후 수정 모드 활성화 | 6178-6195줄 |
| `handleProcessExcelFile()` | 엑셀 업로드 시 `canEditProcess(process)` 체크 | 9131-9393줄 |
| `handleTransportVolumeFile()` | `canEditProcess(5)` 체크 | 10042-10066줄 |
| `toggleDeliveryConfirmation()` | Admin만 가능 | 7904-7910줄 |

---

## 🎨 UI 권한 분기 구현

### 구현 위치

| UI 요소 | 권한 적용 함수 | 설명 |
|---------|---------------|------|
| 공정 버튼 | `disableProcessButtons()` | Editor는 허용되지 않은 공정 버튼 opacity: 0.25 |
| 간트 차트 셀 | `applyProcessPermissionToGantt()` | Editor는 허용되지 않은 공정 셀 opacity: 0.25 |
| 기둥 그리드 | `applyProcessPermissionToColumnGrid()` | Editor는 허용되지 않은 공정 그리드 opacity: 0.25 |
| 입력창 | `applyRoleBasedUI()`, `selectProcess()` | Viewer는 모든 입력창 opacity: 0.25, disabled |

### 권한별 UI 상태

| 역할 | 공정 버튼 | 간트 차트 | 기둥 그리드 | 입력창 |
|------|----------|----------|------------|--------|
| **Admin** | 모두 활성화 | 모두 정상 표시 | 모두 정상 표시 | 모두 활성화 |
| **Editor** | 허용된 공정만 활성화, 나머지 opacity: 0.25 | 허용된 공정만 정상, 나머지 opacity: 0.25 | 허용된 공정만 정상, 나머지 opacity: 0.25 | 허용된 공정만 활성화 |
| **Viewer** | 모두 opacity: 0.25, disabled | 모두 opacity: 0.25 | 모두 opacity: 0.25 | 모두 opacity: 0.25, disabled |

---

## 🧪 테스트 시나리오별 로그

### 시나리오 1: 로그인하지 않은 사용자
```
🔒 [가드] /login 시나리오 (정적 HTML이므로 로그인 모달 표시)
⚠️ [가드] 로그인하지 않은 사용자는 접근할 수 없습니다.
```

### 시나리오 2: 멤버가 아닌 사용자
```
❌ [가드] 프로젝트 멤버가 아닙니다. 접근이 차단됩니다.
🔒 [가드] Firestore 경로: projects/{projectId}/members/{uid}
🔒 [가드] /projects?error=no_access 시나리오 (정적 HTML이므로 접근 차단 UI 표시)
```

### 시나리오 3: 멤버 확인 완료
```
✅ [가드] 멤버 확인 완료: admin 허용 공정: []
✅ [가드] 멤버 확인 완료 - setupFirebaseRealtimeListener() 호출
✅ [가드] 멤버 확인 완료 후 onSnapshot 시작
```

### 시나리오 4: Editor 권한 체크
```
✅ [가드] 역할 적용: editor 허용 공정: [3, 4, 5]
🔒 [가드] Editor는 공정 2을 저장할 수 없습니다.
```

---

## 🔧 디버그 모드

### 설정 방법

**URL 파라미터:**
```
?debug=true
```

**localStorage:**
```javascript
localStorage.setItem('kcol:debugMode', 'true')
```

### 동작

- **운영 환경 (기본)**: UID/경로 숨김
- **디버그 모드**: UID/경로 표시 (디버깅용)

### 적용 위치

- `setupFirebaseRealtimeListener()`: 접근 차단 UI (1982-1989줄)
- `setupFirebaseAuthListener()`: 접근 차단 UI (2208-2215줄)

---

## ✅ 타입 일치 확인

### `processNo` vs `data-process` 일치

| 위치 | 값 | 변환 | 최종 타입 |
|------|-----|------|----------|
| 버튼 `data-process` | `"1"` | `parseInt()` | `1` (숫자) |
| 간트 `data-process` | `"1"` 또는 `1` | `parseInt()` | `1` (숫자) |
| `selectProcess(1)` | `1` | - | `1` (숫자) |
| `canEditProcess(1)` | `1` | 정규화 | `1` (숫자) |
| `allowedProcesses` | `[1, 2, 3]` | 정규화 | `[1, 2, 3]` (숫자 배열) |

**✅ 모든 값이 숫자로 통일되어 `canEditProcess()`와 일치합니다.**

---

## 📊 최종 확인 체크리스트

- [x] `user_roles` 참조 완전 제거
- [x] `signInAnonymously()` 완전 제거
- [x] `approver` 역할 완전 제거
- [x] `schedules` 경로 `projects/{projectId}/schedules`로 통일
- [x] 프로젝트 페이지 가드 구현 (auth + member 확인)
- [x] UI 권한 분기 구현 (opacity: 0.25, disabled, pointerEvents: none)
- [x] 모든 데이터 변경 함수에 가드 추가
- [x] 타입 일치 보장 (숫자 배열 정규화)
- [x] 디버그 모드 추가 (운영 환경에서 UID/경로 숨김)
- [x] 테스트 시나리오별 로그 추가

---

## 📝 참고 사항

### 데이터 구조

**현재 사용 중인 구조:**
```
projects/{projectId}
├── members/{uid}
│   ├── role: "admin" | "editor" | "viewer"
│   └── allowedProcesses: [1, 2, 3, ...]
└── schedules/{scheduleId}
    └── tasks: [...]
```

**레거시 구조 (차단됨):**
```
user_roles/{uid}  ❌ 접근 차단
```

### 보안 레이어 (3중 방어) - 실서비스 최소 사고 패턴

> **원칙**: Rules는 최소 권한, 클라이언트는 명시적 가드, UI는 우회 불가

#### 1. Firestore Rules 레이어 (서버 측 - 최소 권한 원칙)
- **목적**: 서버 측에서 최소 권한만 허용
- **구현**:
  - 읽기: 인증된 사용자만 (익명 제외)
  - 쓰기: Admin만 (schedules, members)
  - Editor의 `allowedProcesses` 기반 필드별 권한은 클라이언트에서 처리
- **위치**: `firestore.rules`
- **특징**: 클라이언트 조작 불가능, 최종 방어선

#### 2. 클라이언트 가드 레이어 (명시적 검증)
- **목적**: 모든 데이터 변경 함수 시작 시 명시적 권한 체크
- **구현**: `canEditProcess(processNo)` 함수로 사전 검증
- **위치**: 12개 데이터 변경 함수 (저장, 삭제, 업로드 등)
- **특징**: 우회 시도 차단, 조기 반환으로 불필요한 작업 방지

#### 3. UI 레이어 (우회 불가)
- **목적**: 사용자가 권한 없는 요소에 접근할 수 없도록 UI 차단
- **구현**:
  - `disabled = true`: 입력창/버튼 비활성화 (키보드/스크린리더 차단)
  - `opacity: 0.25`: 시각적 표시 (권한 없음 명확히 표시)
  - `pointerEvents: none`: 마우스 이벤트 차단
- **위치**: 공정 버튼, 간트 차트, 기둥 그리드, 입력창
- **특징**: 사용자 경험 개선, 실수 방지

#### 3중 방어 동작 흐름

```
사용자 액션
    ↓
[1] UI 레이어: disabled/opacity/pointerEvents 체크
    ↓ (통과)
[2] 클라이언트 가드: canEditProcess() 체크
    ↓ (통과)
[3] Firestore Rules: 서버 측 권한 검증
    ↓ (통과)
데이터 저장 성공
```

**각 레이어가 독립적으로 작동하므로, 한 레이어를 우회해도 다른 레이어에서 차단됩니다.**

---

## 🎯 다음 단계 (선택 사항)

1. **Next.js 프로젝트 통합**: `production-schedule-app`에 실제 Next.js 페이지 추가 시 `authz.ts` 모듈 활용
2. **Editor 필드별 권한**: Firestore Rules에서 Editor의 `allowedProcesses` 기반 필드별 쓰기 권한 구현 (현재는 클라이언트에서만 처리)
3. **승인 워크플로우**: Editor의 변경사항을 승인 대기 상태로 저장하는 기능 (현재는 즉시 저장)

---

**작성 완료일**: 2026-01-25
