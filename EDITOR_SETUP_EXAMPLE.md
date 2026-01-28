# Editor 4명 설정 예시

## 개요
4명의 Editor가 각각 다른 공정만 입력할 수 있도록 설정하는 방법입니다.

## 공정 구조 및 Editor 할당

### 공장 작업
- **1. 주기둥커팅** (유석철강 충주공장) → **Editor 1**
- **2. 소부재가공** (유석철강 오창공장) → **Editor 2**
- **3. 주기둥조립** (유석철강 음성공장) → **Editor 3**
- **4. 소부재조립** (유석철강 음성공장) → **Editor 3**
- **5. 현장배송** (유석철강 음성공장) → **Editor 3**

### 현장 작업
- **6. 현장설치** (진흥기업) → **Editor 4**

## Editor 4명 설정

### 공정 할당
- **Editor 1**: 주기둥커팅 (공정 1)
- **Editor 2**: 소부재가공 (공정 2)
- **Editor 3**: 주기둥조립 (공정 3), 소부재조립 (공정 4), 현장배송 (공정 5)
- **Editor 4**: 현장설치 (공정 6)

### Firebase Console에서 설정

1. Firebase Console 접속: https://console.firebase.google.com/
2. 프로젝트 선택: `hakdong-a80b8`
3. Firestore Database → Data 탭
4. `user_roles` 컬렉션 선택

### Editor 1: 주기둥커팅 담당
```
문서 ID: {사용자1의 UID}
필드:
  role: "editor"
  projectId: "P1"
  allowedProcesses: [1]  // 주기둥커팅만
  updatedAt: (타임스탬프)
```

### Editor 2: 소부재가공 담당
```
문서 ID: {사용자2의 UID}
필드:
  role: "editor"
  projectId: "P1"
  allowedProcesses: [2]  // 소부재가공만
  updatedAt: (타임스탬프)
```

### Editor 3: 주기둥조립, 소부재조립, 현장배송 담당
```
문서 ID: {사용자3의 UID}
필드:
  role: "editor"
  projectId: "P1"
  allowedProcesses: [3, 4, 5]  // 주기둥조립, 소부재조립, 현장배송
  updatedAt: (타임스탬프)
```

### Editor 4: 현장설치 담당
```
문서 ID: {사용자4의 UID}
필드:
  role: "editor"
  projectId: "P1"
  allowedProcesses: [6]  // 현장설치만
  updatedAt: (타임스탬프)
```

## 사용자 UID 확인 방법

### 방법 1: Firebase Console
1. Firebase Console → Authentication → Users
2. 사용자 목록에서 UID 복사

### 방법 2: 브라우저 콘솔
1. 페이지에서 개발자 도구(F12) 열기
2. Console 탭에서 다음 명령 실행:
   ```javascript
   firebase.auth().currentUser.uid
   ```

## 동작 확인

### Editor 1 (주기둥커팅만)
- ✅ 공정 1 버튼 활성화
- ❌ 공정 2, 3, 4, 5, 6 버튼 비활성화
- ✅ 공정 1 선택 시 일일입력 가능
- ❌ 다른 공정 선택 시 경고 메시지

### Editor 2 (소부재가공만)
- ❌ 공정 1 버튼 비활성화
- ✅ 공정 2 버튼 활성화
- ❌ 공정 3, 4, 5, 6 버튼 비활성화
- ✅ 공정 2 선택 시 일일입력 가능

### Editor 3 (주기둥조립, 소부재조립, 현장배송)
- ❌ 공정 1, 2 버튼 비활성화
- ✅ 공정 3, 4, 5 버튼 활성화
- ❌ 공정 6 버튼 비활성화
- ✅ 공정 3, 4, 5 선택 시 일일입력 가능

### Editor 4 (현장설치만)
- ❌ 공정 1, 2, 3, 4, 5 버튼 비활성화
- ✅ 공정 6 버튼 활성화
- ✅ 공정 6 선택 시 일일입력 가능

## 다른 조합 예시

### 실제 할당 (현재 설정)
```javascript
// Editor 1: 주기둥커팅
allowedProcesses: [1]

// Editor 2: 소부재가공
allowedProcesses: [2]

// Editor 3: 주기둥조립, 소부재조립, 현장배송
allowedProcesses: [3, 4, 5]

// Editor 4: 현장설치
allowedProcesses: [6]
```

### 여러 공정 조합 (예시)
```javascript
// Editor가 2개 공정 담당
allowedProcesses: [1, 2]  // 주기둥커팅 + 소부재가공

// Editor가 3개 공정 담당
allowedProcesses: [1, 2, 3]  // 주기둥커팅 + 소부재가공 + 주기둥조립
```

## 문제 해결

### 공정 버튼이 모두 비활성화되는 경우
1. `allowedProcesses` 필드가 배열 형식인지 확인
2. 공정 ID가 1-6 범위 내인지 확인
3. 브라우저 콘솔에서 `[RBAC] Editor 허용 공정:` 메시지 확인

### 허용된 공정인데 저장이 안 되는 경우
1. 브라우저 캐시 삭제 후 다시 시도
2. Firestore 규칙이 배포되었는지 확인
3. 브라우저 콘솔에서 오류 메시지 확인
