# Firestore 멤버 문서 생성 가이드

> 작성일: 2026-01-25  
> 목적: Firebase Console에서 첫 번째 멤버 문서 생성 방법

---

## 🚨 문제 상황

**Firebase Console에서 `projects/P1/members` 서브컬렉션이 보이지 않음**

**원인:**
- Firestore에서는 서브컬렉션이 실제 문서가 생성되기 전까지 UI에 표시되지 않을 수 있습니다.
- 첫 번째 멤버 문서를 생성하면 서브컬렉션이 자동으로 나타납니다.

---

## ✅ 해결 방법: 첫 번째 멤버 문서 생성

### 방법 1: Firebase Console에서 직접 생성 (권장)

#### 1단계: Firebase Console 접속

1. https://console.firebase.google.com/ 접속
2. 프로젝트 선택 (예: `hakdong-a80b8`)

#### 2단계: Firestore Database 접속

1. 왼쪽 메뉴에서 **Firestore Database** 클릭
2. 상단 탭에서 **Data** 클릭

#### 3단계: `projects` 컬렉션 확인/생성

1. 컬렉션 목록에서 `projects` 찾기
2. **`projects` 컬렉션이 없으면:**
   - "컬렉션 시작" 또는 "Start collection" 클릭
   - 컬렉션 ID: `projects` 입력
   - 문서 ID: `P1` 입력
   - 필드 추가 없이 "저장" 클릭

3. **`projects` 컬렉션이 있으면:**
   - `projects` 컬렉션 클릭
   - `P1` 문서가 있는지 확인
   - 없으면 "문서 추가" 클릭하여 `P1` 문서 생성

#### 4단계: `P1` 문서 내부에서 `members` 서브컬렉션 생성

1. **`P1` 문서 클릭** (문서 상세 화면으로 이동)
2. 문서 상세 화면에서 **"서브컬렉션 시작"** 또는 **"Start subcollection"** 버튼 찾기
   - 위치: 문서 필드 목록 아래 또는 문서 상단 메뉴
3. 서브컬렉션 ID 입력: **`members`**
4. "다음" 또는 "Next" 클릭

#### 5단계: 첫 번째 멤버 문서 생성

1. **문서 ID 입력:**
   - Admin 사용자의 UID 입력 (예: `abc123def456...`)
   - UID 확인 방법:
     - Firebase Console → Authentication → Users
     - Admin 계정의 UID 복사

2. **필드 추가:**

   **필드 1: `role`**
   - 필드 이름: `role`
   - 필드 타입: **string** 선택
   - 값: `admin`

   **필드 2: `allowedProcesses`**
   - 필드 이름: `allowedProcesses`
   - 필드 타입: **array** 선택
   - 배열 요소: 비워두기 (빈 배열 `[]`)

3. **저장** 클릭

#### 6단계: 확인

1. `projects` 컬렉션 → `P1` 문서 클릭
2. 문서 상세 화면에서 **`members` 서브컬렉션**이 표시되는지 확인
3. `members` 서브컬렉션 클릭
4. 생성한 멤버 문서가 표시되는지 확인

---

## 📸 단계별 스크린샷 가이드

### Step 1: Firestore Data 탭

```
Firebase Console
├── Firestore Database
    └── Data 탭
        └── 컬렉션 목록
            └── projects (클릭)
```

### Step 2: P1 문서 확인/생성

```
projects 컬렉션
├── P1 (문서) ← 클릭
    └── (문서 상세 화면)
```

**P1 문서가 없으면:**
- "문서 추가" 또는 "Add document" 클릭
- 문서 ID: `P1`
- 필드 없이 저장

### Step 3: 서브컬렉션 생성

```
P1 문서 상세 화면
├── 필드 목록 (비어있을 수 있음)
└── "서브컬렉션 시작" 버튼 ← 클릭
    └── 서브컬렉션 ID: members 입력
```

### Step 4: 멤버 문서 생성

```
members 서브컬렉션
└── "문서 추가" 클릭
    ├── 문서 ID: {ADMIN_UID} 입력
    ├── 필드 추가:
    │   ├── role (string): admin
    │   └── allowedProcesses (array): [] (빈 배열)
    └── 저장
```

---

## 🔍 Admin UID 확인 방법

### 방법 1: Firebase Console (권장)

1. Firebase Console → **Authentication** → **Users** 탭
2. Admin 계정 찾기
3. **UID** 열에서 UID 복사

### 방법 2: 애플리케이션 코드에서 확인

**주의:** v9 모듈 기준이므로 소스 코드에서만 사용 가능

```javascript
import { getAuth } from "firebase/auth";

const auth = getAuth();
console.log('UID:', auth.currentUser?.uid);
```

**브라우저 콘솔에서 `firebase.auth()` 방식은 사용하지 않음 (v9 미지원)**

---

## 📋 생성할 문서 구조

### 경로
```
projects/P1/members/{ADMIN_UID}
```

### 필드

| 필드 이름 | 타입 | 값 | 설명 |
|-----------|------|-----|------|
| `role` | string | `admin` | 역할 (admin, editor, viewer) |
| `allowedProcesses` | array | `[]` | 허용 공정 (Admin은 빈 배열) |

### 예시

**문서 ID:** `abc123def456ghi789jkl012mno345pqr678`

**필드:**
```json
{
  "role": "admin",
  "allowedProcesses": []
}
```

---

## ✅ 생성 후 확인

### 1. 서브컬렉션 표시 확인

- `projects` → `P1` 문서 클릭
- 문서 상세 화면에서 **`members` 서브컬렉션**이 표시되는지 확인

### 2. 멤버 문서 확인

- `members` 서브컬렉션 클릭
- 생성한 문서가 목록에 표시되는지 확인
- 문서 클릭하여 필드 확인:
  - `role: "admin"` ✅
  - `allowedProcesses: []` ✅

### 3. 애플리케이션에서 확인

1. Admin 계정으로 로그인
2. 프로젝트 페이지 접속
3. 브라우저 콘솔(F12)에서 확인:
   ```javascript
   loadUserRoleFromFirebase().then(role => {
       console.log('역할:', role);
   });
   ```
4. 예상 출력:
   ```
   역할: {role: "admin", allowedProcesses: []}
   ```

---

## 🐛 문제 해결

### 문제 1: "서브컬렉션 시작" 버튼이 보이지 않음

**해결 방법:**
1. `P1` 문서가 실제로 생성되었는지 확인
2. 문서 상세 화면에서 스크롤하여 버튼 찾기
3. 브라우저 새로고침 후 다시 시도

### 문제 2: 서브컬렉션 ID 입력 필드가 없음

**해결 방법:**
1. `P1` 문서 상세 화면에서 우측 상단 메뉴 확인
2. 또는 문서 필드 목록 아래에 "Add subcollection" 링크 확인
3. Firebase Console 버전에 따라 UI가 다를 수 있음

### 문제 3: 배열 필드 추가 방법을 모르겠음

**해결 방법:**
1. 필드 타입을 **array**로 선택
2. 배열 요소 추가 버튼("+") 클릭
3. **비워두기** (빈 배열 `[]`로 저장)
   - 또는 첫 번째 요소에 아무 값도 입력하지 않고 저장

### 문제 4: 문서 생성 후에도 서브컬렉션이 보이지 않음

**해결 방법:**
1. 브라우저 새로고침
2. `P1` 문서를 다시 클릭
3. Firestore Console 캐시 문제일 수 있으므로 몇 초 기다린 후 다시 확인

---

## 📝 빠른 참조

### 전체 경로
```
projects → P1 → members → {ADMIN_UID}
```

### 필수 필드
- `role`: `"admin"` (string)
- `allowedProcesses`: `[]` (array, 빈 배열)

### UID 확인
- Firebase Console → Authentication → Users → UID 복사

---

## 🎯 다음 단계

멤버 문서 생성 후:

1. **Admin 로그인 테스트**
   - Admin 계정으로 로그인
   - 프로젝트 페이지 접속
   - Admin 설정 영역이 표시되는지 확인

2. **다른 멤버 추가**
   - Admin UI에서 Editor/Viewer 추가
   - 또는 Firebase Console에서 직접 추가

3. **권한 테스트**
   - Editor/Viewer 계정으로 로그인하여 권한 확인

---

**작성 완료일**: 2026-01-25
