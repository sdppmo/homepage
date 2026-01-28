# 프로덕션 보안 강화 가이드

## 개요
프로덕션 환경에서 Firestore 데이터 보안을 강화하기 위한 설정 가이드입니다.

## 현재 상태
- ✅ Firestore 규칙: `request.auth != null` (인증 필수)
- ✅ 익명 로그인 코드: 활성화됨
- ⚠️ Firebase Console 설정 필요: 익명 로그인 활성화

## 필수 단계: Firebase Console에서 익명 로그인 활성화

### 1. Firebase Console 접속
- https://console.firebase.google.com/
- 프로젝트 선택: **`hakdong-a80b8`**

### 2. Authentication 메뉴로 이동
- 왼쪽 메뉴에서 **Authentication** 클릭
- 상단 탭에서 **Sign-in method** (또는 **로그인 방법**) 클릭

### 3. 익명 로그인 활성화
- **Sign-in providers** 목록에서 **Anonymous** (익명) 찾기
- **Anonymous** 클릭
- **Enable** (사용) 토글을 **ON**으로 변경
- **Save** (저장) 클릭

### 4. Firestore 규칙 배포
- 왼쪽 메뉴에서 **Firestore Database** 클릭
- 상단 탭에서 **Rules** (또는 **규칙**) 클릭
- 아래 규칙이 적용되어 있는지 확인:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /kcolumn/{document=**} {
      // 프로덕션용 규칙: 인증된 사용자만 접근 가능
      allow read, write: if request.auth != null;
    }
  }
}
```

- 규칙이 다르면 위 내용으로 변경 후 **Publish** 클릭

## 확인 방법

### 1. 브라우저 콘솔 확인
1. `2H_steel_product.html?project=P1` 페이지 열기
2. 개발자 도구(F12) → Console 탭 확인
3. 다음 메시지가 나타나야 합니다:
   - `[Firebase] Firestore 초기화 완료`
   - `[Firebase] 인증되지 않은 사용자 - 익명 로그인 시도`
   - `[Firebase] 익명 로그인 성공`

### 2. Firestore 접근 확인
- "Missing or insufficient permissions" 오류가 나타나지 않아야 합니다
- 데이터 저장 및 로드가 정상적으로 작동해야 합니다

## 보안 수준

### 현재 설정 (프로덕션)
- ✅ **인증 필수**: `request.auth != null` 규칙으로 인증된 사용자만 접근 가능
- ✅ **익명 로그인**: 이메일/비밀번호 없이도 임시 계정으로 접근 가능
- ✅ **프로젝트 기반 데이터**: `projectId` 기반으로 데이터 분리

### 추가 보안 강화 (선택사항)
더 강한 보안이 필요한 경우:

1. **이메일/비밀번호 인증 추가**
   - Firebase Console → Authentication → Sign-in method → Email/Password → Enable
   - 코드에서 `auth.signInWithEmailAndPassword()` 사용

2. **프로젝트별 접근 제어**
   - Firestore 규칙에서 `projectId` 검증 추가
   - 예: `request.auth != null && document.id.matches('P1_.*')`

3. **사용자별 권한 관리**
   - Firestore에 사용자 권한 테이블 생성
   - 규칙에서 사용자 권한 확인

## 문제 해결

### 익명 로그인이 실패하는 경우
- Firebase Console에서 익명 로그인이 활성화되었는지 확인
- 브라우저 콘솔에서 오류 메시지 확인
- Firebase 프로젝트 설정 확인

### Firestore 권한 오류가 계속 발생하는 경우
- Firestore 규칙이 배포되었는지 확인
- 규칙이 `request.auth != null`로 설정되어 있는지 확인
- 브라우저 캐시 삭제 후 다시 시도

## 참고
- 익명 로그인은 사용자에게 이메일이나 비밀번호 없이 임시 계정을 생성합니다
- 각 브라우저/디바이스마다 고유한 익명 계정이 생성됩니다
- 실제 사용자 인증이 필요한 경우, Firebase Email/Password 인증을 추가로 설정할 수 있습니다
