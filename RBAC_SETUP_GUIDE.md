# 역할 기반 접근 제어(RBAC) 설정 가이드

## 역할 정의

### Viewer (열람자)
- **권한**: 공정표 열람만 가능
- **제한사항**: 
  - 일일입력 불가
  - 모든 입력 필드 비활성화
  - 저장 버튼 비활성화
- **설정**: Firestore `user_roles` 컬렉션에 명시적으로 `role: "viewer"` 설정 필요
- **익명 사용자**: 역할이 없는 익명 사용자는 접근 불가

### Editor (편집자)
- **권한**: 일일입력 가능 (공정진행율 및 날짜 수정) - **제한된 공정만 수정 가능**
- **기능**:
  - 일일입력 가능 (허용된 공정만)
  - 공정진행율 수정 가능 (허용된 공정만)
  - 날짜 수정 가능
  - 변경사항은 승인 대기 상태로 저장 (향후 구현)
- **제한사항**:
  - `allowedProcesses` 필드에 지정된 공정만 수정 가능
  - Editor별 할당:
    - Editor 1: 공정 1 (주기둥커팅)
    - Editor 2: 공정 2 (소부재가공)
    - Editor 3: 공정 3, 4, 5 (주기둥조립, 소부재조립, 현장배송)
    - Editor 4: 공정 6 (현장설치)
  - 허용되지 않은 공정 버튼은 비활성화됨

### Approver (승인자)
- **권한**: 일일입력 및 변경사항 승인
- **기능**:
  - 일일입력 가능
  - 승인 대기 중인 변경사항 확인 및 승인/거부 (향후 구현)

### Admin (관리자)
- **권한**: 모든 권한
- **기능**:
  - 일일입력 가능
  - 변경사항 즉시 적용 (승인 불필요)
  - 사용자 및 권한 관리 (향후 구현)

## Firestore 사용자 역할 설정

### 1. Firebase Console에서 사용자 역할 설정

1. Firebase Console 접속: https://console.firebase.google.com/
2. 프로젝트 선택: `hakdong-a80b8`
3. Firestore Database → Data 탭
4. `user_roles` 컬렉션 생성 (없는 경우)
5. 문서 추가:
   - 문서 ID: 사용자 UID (Firebase Auth에서 확인)
   - 필드:
     ```
     role: "viewer" (또는 "editor", "approver", "admin")
     projectId: "P1" (선택사항)
     updatedAt: (타임스탬프)
     ```

**중요**: 
- **모든 사용자는 명시적으로 역할을 설정해야 접근 가능합니다**
- 역할이 없는 익명 사용자는 프로젝트를 볼 수 없습니다
- Viewer 역할도 Firestore에 명시적으로 설정해야 합니다

### 2. 사용자 역할 설정 예시

#### 4명의 Editor 설정

```javascript
// Editor 1: 주기둥커팅(1)만 입력 가능
user_roles/{userId1}
  - role: "editor"
  - projectId: "P1"
  - allowedProcesses: [1]  // 주기둥커팅만
  - updatedAt: timestamp

// Editor 2: 소부재가공(2)만 입력 가능
user_roles/{userId2}
  - role: "editor"
  - projectId: "P1"
  - allowedProcesses: [2]  // 소부재가공만
  - updatedAt: timestamp

// Editor 3: 주기둥조립(3), 소부재조립(4), 현장배송(5) 입력 가능
user_roles/{userId3}
  - role: "editor"
  - projectId: "P1"
  - allowedProcesses: [3, 4, 5]  // 주기둥조립, 소부재조립, 현장배송
  - updatedAt: timestamp

// Editor 4: 현장설치(6)만 입력 가능
user_roles/{userId4}
  - role: "editor"
  - projectId: "P1"
  - allowedProcesses: [6]  // 현장설치만
  - updatedAt: timestamp
```

#### 다른 역할 설정 예시

```javascript
// Viewer로 설정 (명시적으로 설정 필요)
user_roles/{userId}
  - role: "viewer"
  - projectId: "P1"
  - updatedAt: timestamp

// Approver로 설정
user_roles/{userId}
  - role: "approver"
  - projectId: "P1"
  - updatedAt: timestamp

// Admin으로 설정
user_roles/{userId}
  - role: "admin"
  - projectId: "P1"
  - updatedAt: timestamp
```

**중요 사항**: 
- **모든 사용자는 Firestore에 명시적으로 역할을 설정해야 접근 가능합니다**
- 역할이 없는 익명 사용자는 "접근 권한 없음" 메시지가 표시되고 모든 기능이 비활성화됩니다
- Editor의 `allowedProcesses` 필드가 없으면 기본값 `[1, 2, 3, 6]`이 적용됩니다
- `allowedProcesses`는 배열 형식으로 여러 공정을 지정할 수 있습니다
- 예: `[1, 2]`는 주기둥커팅과 소부재가공만 입력 가능

### 3. 사용자 UID 확인 방법

1. Firebase Console → Authentication → Users
2. 사용자 목록에서 UID 확인
3. 또는 브라우저 콘솔에서:
   ```javascript
   firebase.auth().currentUser.uid
   ```

## 현재 구현 상태

### ✅ 완료된 기능
1. Firestore 보안 규칙: 역할 기반 접근 제어
2. 사용자 역할 확인 함수
3. Viewer 읽기 전용 모드 (일일입력 불가)
4. Editor 이상 일일입력 가능
5. 역할 배지 표시

### ⏳ 향후 구현 예정
1. Editor 변경사항 승인 대기 워크플로우
2. Approver 승인/거부 기능
3. Admin 사용자 관리 UI

## 테스트 방법

### Viewer 역할 테스트
1. `user_roles/{userId}` 문서에 `role: "viewer"` 설정
2. 페이지 새로고침
3. 일일입력 패널의 입력 필드가 비활성화되어야 함
4. 저장 버튼이 비활성화되어야 함
5. 우측 상단에 "👤 열람자 - 읽기 전용" 배지 표시

### Editor 역할 테스트
1. `user_roles/{userId}` 문서에 `role: "editor"` 설정
2. 페이지 새로고침
3. 일일입력 패널의 입력 필드가 활성화되어야 함
4. 저장 버튼이 활성화되어야 함
5. 우측 상단에 "👤 편집자 - 일일입력 가능" 배지 표시
6. 일일입력 저장 시도 시 정상 작동해야 함

## 문제 해결

### 역할이 적용되지 않는 경우
1. Firestore에 `user_roles` 컬렉션이 생성되었는지 확인
2. 문서 ID가 사용자 UID와 일치하는지 확인
3. `role` 필드가 정확히 입력되었는지 확인 (소문자: "viewer", "editor", "approver", "admin")
4. 브라우저 콘솔에서 `[RBAC] 사용자 역할:` 메시지 확인

### Viewer인데 일일입력이 가능한 경우
1. 브라우저 캐시 삭제 후 다시 시도
2. Firestore 규칙이 배포되었는지 확인
3. 브라우저 콘솔에서 역할 로드 오류 확인
