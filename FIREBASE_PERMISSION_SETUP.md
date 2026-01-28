# Firebase 권한 설정 완전 가이드

## 개요
이 가이드는 Firebase 프로젝트(`hakdong-a80b8`)에서 Firestore 보안 규칙과 사용자 권한을 설정하는 전체 과정을 안내합니다.

---

## 1단계: Firebase Console 접속 및 프로젝트 선택

1. **Firebase Console 접속**
   - https://console.firebase.google.com/
   - Google 계정으로 로그인

2. **프로젝트 선택**
   - 프로젝트: **`hakdong-a80b8`** 선택

---

## 2단계: Firestore 보안 규칙 배포

### 2-1. Firestore Database 접속
1. 왼쪽 메뉴에서 **Firestore Database** (또는 **Firestore**) 클릭
2. 상단 탭에서 **Rules** (또는 **규칙**) 클릭

### 2-2. 보안 규칙 입력
편집기 영역의 **모든 내용을 삭제**하고 아래 규칙을 **정확히** 복사하여 붙여넣기:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 역할 가져오기 헬퍼 함수
    function getUserRole() {
      let roleDoc = get(/databases/$(database)/documents/user_roles/$(request.auth.uid));
      return roleDoc != null ? roleDoc.data.role : null;
    }
    
    // 역할이 있는지 확인 (익명 사용자 차단)
    function hasRole() {
      return getUserRole() != null;
    }
    
    // 사용자 역할 관리
    match /user_roles/{userId} {
      // 인증된 사용자는 자신의 역할 읽기 가능
      allow read: if request.auth != null && request.auth.uid == userId;
      // Admin만 사용자 역할 수정 가능
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/user_roles/$(request.auth.uid)).data.role == 'admin';
    }
    
    // kcolumn collection: projectId 기반 접근 허용
    // 경로: kcolumn/{projectId}_{suffix}
    // 예: kcolumn/P1_columnData, kcolumn/P1_dailyData 등
    match /kcolumn/{document=**} {
      // 역할이 있는 사용자만 읽기 가능 (Viewer, Editor, Approver, Admin)
      allow read: if request.auth != null && hasRole();
      
      // Editor, Approver, Admin: 쓰기 가능
      allow write: if request.auth != null && hasRole() && 
        (getUserRole() == 'editor' || getUserRole() == 'approver' || getUserRole() == 'admin');
      
      // Admin: 모든 권한 (즉시 적용)
      allow read, write: if request.auth != null && getUserRole() == 'admin';
    }
  }
}
```

### 2-3. 규칙 배포 (중요!)
1. 편집기 **우측 상단** 또는 **하단**에서 **"Publish"** (또는 **"게시"**) 버튼 찾기
2. **"Publish"** 버튼 클릭
3. 배포 완료 메시지 확인 (몇 초 소요)

**⚠️ 주의**: 규칙을 수정하면 편집기 상단에 "Unsaved changes" 경고가 표시됩니다. 반드시 **Publish** 버튼을 클릭해야 적용됩니다!

---

## 3단계: Authentication 설정

### 3-1. 익명 로그인 활성화 (권장)

1. 왼쪽 메뉴에서 **Authentication** 클릭
2. 상단 탭에서 **Sign-in method** (또는 **로그인 방법**) 클릭
3. **Sign-in providers** 목록에서 **Anonymous** (익명) 찾기
4. **Anonymous** 클릭
5. **Enable** (사용) 토글을 **ON**으로 변경
6. **Save** (저장) 클릭

### 3-2. 이메일/비밀번호 로그인 활성화 (선택사항)

특정 사용자에게 권한을 부여하려면 이메일 로그인을 활성화하는 것이 좋습니다:

1. **Sign-in providers** 목록에서 **Email/Password** 찾기
2. **Email/Password** 클릭
3. **Enable** 토글을 **ON**으로 변경
4. **Save** 클릭

---

## 4단계: 사용자 역할 설정

### 4-1. 사용자 생성 (이메일 로그인 사용 시)

1. **Authentication → Users 탭**
2. **"Add user"** 버튼 클릭
3. 사용자 정보 입력:
   - **Email**: 사용자 이메일 주소
   - **Password**: 임시 비밀번호 (사용자에게 전달)
4. **"Add user"** 클릭
5. **UID 복사** (나중에 필요함)
6. 필요한 사용자 모두 반복

### 4-2. Firestore에 사용자 역할 설정

1. **Firestore Database → Data 탭**
2. **`user_roles`** 컬렉션 선택 (없으면 생성)
3. **"Add document"** 클릭

#### 역할별 설정 예시

**Viewer (열람자) - 읽기 전용**
```
문서 ID: {사용자 UID}
필드:
  role: "viewer" (문자열)
  projectId: "P1" (문자열, 선택사항)
  updatedAt: (타임스탬프 - serverTimestamp)
```

**Editor (편집자) - 제한된 공정만 수정 가능**
```
문서 ID: {사용자 UID}
필드:
  role: "editor" (문자열)
  projectId: "P1" (문자열, 선택사항)
  allowedProcesses: [1] (배열 - 숫자)
  updatedAt: (타임스탬프)
```

**Editor별 공정 할당 예시:**
- Editor 1: `allowedProcesses: [1]` (주기둥커팅만)
- Editor 2: `allowedProcesses: [2]` (소부재가공만)
- Editor 3: `allowedProcesses: [3, 4, 5]` (주기둥조립, 소부재조립, 현장배송)
- Editor 4: `allowedProcesses: [6]` (현장설치만)

**Approver (승인자) - 모든 공정 수정 및 승인 가능**
```
문서 ID: {사용자 UID}
필드:
  role: "approver" (문자열)
  projectId: "P1" (문자열, 선택사항)
  updatedAt: (타임스탬프)
```

**Admin (관리자) - 모든 권한**
```
문서 ID: {사용자 UID}
필드:
  role: "admin" (문자열)
  projectId: "P1" (문자열, 선택사항)
  updatedAt: (타임스탬프)
```

### 4-3. 배열 필드 설정 방법 (Firebase Console)

`allowedProcesses` 배열을 설정하는 방법:

1. 필드 추가 시:
   - 필드 이름: `allowedProcesses`
   - 필드 타입: **array** 선택
   - 배열 요소 추가:
     - 첫 번째 요소: 숫자 `1` 입력
     - "+" 버튼 클릭하여 추가 요소 입력 (예: `2`, `3` 등)

2. 또는 JSON 형식으로 직접 입력:
   ```json
   [1, 2, 3]
   ```

---

## 5단계: 확인 및 테스트

### 5-1. 브라우저에서 테스트

1. **페이지 접속**
   - `https://kcol.kr/pages/K-product/2H_steel_product.html?project=P1`
   - 또는 로컬: `http://localhost:8080/pages/K-product/2H_steel_product.html?project=P1`

2. **개발자 도구 열기** (F12)
   - **Console** 탭 확인

3. **예상 메시지 확인**
   - `[Firebase] Firestore 초기화 완료`
   - `[Firebase] 익명 로그인 성공` (익명 로그인 사용 시)
   - `[RBAC] 사용자 역할: viewer` (또는 editor, approver, admin)

4. **권한 확인**
   - **Viewer**: 일일입력 필드 비활성화, 저장 버튼 비활성화
   - **Editor**: 허용된 공정만 활성화, 일일입력 가능
   - **Approver/Admin**: 모든 공정 수정 가능

### 5-2. 오류 확인

**"Missing or insufficient permissions" 오류가 발생하는 경우:**

1. Firestore 규칙이 배포되었는지 확인
   - Firebase Console → Firestore Database → Rules
   - 현재 규칙이 위의 규칙과 일치하는지 확인

2. 사용자 역할이 설정되었는지 확인
   - Firestore → `user_roles` 컬렉션
   - 문서 ID가 사용자 UID와 일치하는지 확인
   - `role` 필드가 정확히 입력되었는지 확인 (소문자)

3. Authentication이 활성화되었는지 확인
   - Firebase Console → Authentication → Sign-in method
   - 익명 로그인 또는 이메일/비밀번호 로그인이 활성화되어 있는지 확인

4. 브라우저 캐시 삭제 후 다시 시도

---

## 역할별 권한 요약

| 역할 | 읽기 | 쓰기 | 비고 |
|------|------|------|------|
| **Viewer** | ✅ | ❌ | 열람만 가능, 모든 입력 필드 비활성화 |
| **Editor** | ✅ | ✅ (제한) | `allowedProcesses`에 지정된 공정만 수정 가능 |
| **Approver** | ✅ | ✅ | 모든 공정 수정 가능, 변경사항 승인 가능 |
| **Admin** | ✅ | ✅ | 모든 권한, 사용자 관리 가능 |

---

## 빠른 체크리스트

- [ ] Firebase Console 접속 및 프로젝트 선택
- [ ] Firestore 보안 규칙 배포 (Publish 버튼 클릭!)
- [ ] Authentication → 익명 로그인 활성화
- [ ] (선택) Authentication → 이메일/비밀번호 로그인 활성화
- [ ] (선택) Authentication → Users에서 사용자 생성
- [ ] Firestore → `user_roles` 컬렉션 생성
- [ ] 각 사용자에 대한 역할 문서 생성
- [ ] 브라우저에서 테스트 및 확인

---

## 문제 해결

### 규칙이 적용되지 않는 경우
1. **Publish 버튼을 클릭했는지 확인** (가장 중요!)
2. 몇 분 기다린 후 다시 시도 (규칙 배포에 시간이 걸릴 수 있음)
3. 브라우저 캐시 삭제

### 사용자가 접근할 수 없는 경우
1. `user_roles` 컬렉션에 해당 사용자의 문서가 있는지 확인
2. 문서 ID가 사용자 UID와 정확히 일치하는지 확인
3. `role` 필드가 소문자로 정확히 입력되었는지 확인

### Editor가 허용된 공정을 수정할 수 없는 경우
1. `allowedProcesses` 필드가 배열 형식인지 확인
2. 배열에 올바른 공정 번호가 포함되어 있는지 확인
3. 브라우저 콘솔에서 `[RBAC] 허용된 공정:` 메시지 확인

---

## 추가 리소스

- **상세한 역할 설정**: `RBAC_SETUP_GUIDE.md` 참조
- **Editor 권한 설정**: `EDITOR_PERMISSION_SETUP.md` 참조
- **프로덕션 보안**: `PRODUCTION_SECURITY_SETUP.md` 참조

---

## 문의

문제가 계속 발생하는 경우:
- 이메일: sbd_pmo@naver.com
- Firebase Console에서 규칙 및 데이터 구조 확인
