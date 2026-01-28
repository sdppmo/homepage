# Editor 권한 부여 가이드

## 개요
Editor 4명에게 권한을 부여하는 방법을 안내합니다.

## 방법 1: Firebase Console에서 직접 설정 (권장)

### 1단계: Firebase Authentication에서 사용자 생성

1. **Firebase Console 접속**
   - https://console.firebase.google.com/
   - 프로젝트 선택: `hakdong-a80b8`

2. **Authentication → Users 탭**
   - "Add user" 버튼 클릭

3. **사용자 추가**
   - Email: Editor의 이메일 주소 입력
   - Password: 임시 비밀번호 설정 (사용자에게 전달)
   - "Add user" 클릭
   - **UID 복사** (나중에 필요함)

4. **4명의 Editor 모두 반복**
   - Editor 1, 2, 3, 4 각각 생성
   - 각 사용자의 **UID를 기록**해두세요

### 2단계: Firestore에서 역할 부여

1. **Firestore Database → Data 탭**
   - `user_roles` 컬렉션 선택 (없으면 생성)

2. **Editor 1: 주기둥커팅 담당**
   - "Add document" 클릭
   - 문서 ID: `{Editor1의 UID}` (1단계에서 복사한 UID)
   - 필드 추가:
     ```
     role: "editor" (문자열)
     projectId: "P1" (문자열, 선택사항)
     allowedProcesses: [1] (배열, 숫자 1)
     updatedAt: (타임스탬프 - "Add field" → timestamp → serverTimestamp 선택)
     ```
   - "Save" 클릭

3. **Editor 2: 소부재가공 담당**
   - 문서 ID: `{Editor2의 UID}`
   - 필드:
     ```
     role: "editor"
     projectId: "P1"
     allowedProcesses: [2]  // 소부재가공만
     updatedAt: (타임스탬프)
     ```

4. **Editor 3: 주기둥조립 담당**
   - 문서 ID: `{Editor3의 UID}`
   - 필드:
     ```
     role: "editor"
     projectId: "P1"
     allowedProcesses: [3]  // 주기둥조립만
     updatedAt: (타임스탬프)
     ```

5. **Editor 4: 현장설치 담당**
   - 문서 ID: `{Editor4의 UID}`
   - 필드:
     ```
     role: "editor"
     projectId: "P1"
     allowedProcesses: [6]  // 현장설치만
     updatedAt: (타임스탬프)
     ```

### 3단계: 사용자에게 로그인 정보 전달

각 Editor에게 다음 정보를 전달:
- 이메일 주소 (로그인 ID)
- 임시 비밀번호
- 로그인 URL: `https://kcol.kr/pages/K-product/2H_steel_product.html?project=P1`
- 비밀번호 변경 안내 (첫 로그인 시)

## 방법 2: 이메일 로그인 기능 추가 (향후 구현)

현재는 익명 로그인만 지원하지만, 이메일 로그인 기능을 추가할 수 있습니다.

### 필요한 작업:
1. Firebase Authentication → Sign-in method → Email/Password 활성화
2. 로그인 UI 추가 (이메일/비밀번호 입력 폼)
3. 로그인 후 역할 자동 확인

**참고**: 방법 1로도 충분히 사용 가능합니다.

## 공정 ID 및 Editor 할당

### 공장 작업
- **1**: 주기둥커팅 (유석철강 충주공장) → **Editor 1**
- **2**: 소부재가공 (유석철강 오창공장) → **Editor 2**
- **3**: 주기둥조립 (유석철강 음성공장) → **Editor 3**
- **4**: 소부재조립 (유석철강 음성공장) → **Editor 3**
- **5**: 현장배송 (유석철강 음성공장) → **Editor 3**

### 현장 작업
- **6**: 현장설치 (진흥기업) → **Editor 4**

### Editor별 할당 요약
- **Editor 1**: 공정 1만 (`allowedProcesses: [1]`)
- **Editor 2**: 공정 2만 (`allowedProcesses: [2]`)
- **Editor 3**: 공정 3, 4, 5 (`allowedProcesses: [3, 4, 5]`)
- **Editor 4**: 공정 6만 (`allowedProcesses: [6]`)

## 확인 방법

### Editor 권한 확인
1. Editor가 로그인 후 페이지 접속
2. 우측 상단에 "👤 편집자 - 일일입력 가능" 배지 표시 확인
3. 허용된 공정 버튼만 활성화되어 있는지 확인
4. 허용되지 않은 공정 버튼은 비활성화되어 있어야 함

### 예시: Editor 1 (주기둥커팅만)
- ✅ 공정 1 버튼 활성화
- ❌ 공정 2, 3, 4, 5, 6 버튼 비활성화
- ✅ 공정 1 선택 시 일일입력 가능
- ❌ 다른 공정 선택 시 경고 메시지

### 예시: Editor 3 (주기둥조립, 소부재조립, 현장배송)
- ❌ 공정 1, 2 버튼 비활성화
- ✅ 공정 3, 4, 5 버튼 활성화
- ❌ 공정 6 버튼 비활성화
- ✅ 공정 3, 4, 5 선택 시 일일입력 가능

## 문제 해결

### 사용자가 로그인할 수 없는 경우
1. Firebase Console → Authentication → Users에서 사용자가 생성되었는지 확인
2. 이메일 주소가 정확한지 확인
3. 비밀번호가 올바른지 확인

### 역할이 적용되지 않는 경우
1. Firestore → `user_roles` 컬렉션에서 문서가 생성되었는지 확인
2. 문서 ID가 사용자 UID와 정확히 일치하는지 확인
3. `role` 필드가 `"editor"` (소문자)로 설정되었는지 확인
4. `allowedProcesses` 필드가 배열 형식인지 확인
5. 브라우저 콘솔(F12)에서 `[RBAC] 사용자 역할:` 메시지 확인

### 허용된 공정인데 저장이 안 되는 경우
1. Firestore 규칙이 배포되었는지 확인
2. 브라우저 캐시 삭제 후 다시 시도
3. 브라우저 콘솔에서 오류 메시지 확인

## 빠른 설정 체크리스트

- [ ] Firebase Console → Authentication → Users에서 4명의 Editor 생성
- [ ] 각 Editor의 UID 기록
- [ ] Firestore → `user_roles` 컬렉션에 4개 문서 생성
- [ ] 각 문서에 `role: "editor"` 설정
- [ ] 각 문서에 `allowedProcesses` 배열 설정 (Editor별로 다름)
- [ ] Editor에게 로그인 정보 전달
- [ ] Editor 로그인 후 권한 확인
