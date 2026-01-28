# Firebase 익명 로그인 활성화 가이드

## 문제 상황
`2H_steel_product.html` 페이지에서 Firestore 접근 시 "Missing or insufficient permissions" 오류가 발생합니다.

**원인**: Firestore 보안 규칙이 `request.auth != null`을 요구하지만, 사용자가 인증되지 않은 상태입니다.

## 해결 방법: Firebase 익명 로그인 활성화

### 1. Firebase Console 접속
- https://console.firebase.google.com/
- 프로젝트 선택: `hakdong-a80b8`

### 2. Authentication 메뉴로 이동
- 왼쪽 메뉴에서 **Authentication** 클릭
- 상단 탭에서 **Sign-in method** (또는 **로그인 방법**) 클릭

### 3. 익명 로그인 활성화
- **Sign-in providers** 목록에서 **Anonymous** (익명) 찾기
- **Anonymous** 클릭
- **Enable** (사용) 토글을 **ON**으로 변경
- **Save** (저장) 클릭

### 4. 확인
- `2H_steel_product.html?project=P1` 페이지 새로고침
- 브라우저 콘솔에서 `[Firebase] 익명 로그인 성공` 메시지 확인
- Firestore 권한 오류가 사라져야 합니다

## 대안: Firestore 규칙 수정 (테스트용, 보안 위험)

**주의**: 이 방법은 보안상 권장하지 않습니다. 프로덕션 환경에서는 사용하지 마세요.

Firebase Console → Firestore Database → Rules에서 다음 규칙으로 변경:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /kcolumn/{document=**} {
      // ⚠️ 경고: 인증 없이 모든 사용자가 접근 가능 (테스트용만)
      allow read, write: if true;
    }
  }
}
```

**권장**: 익명 로그인을 활성화하는 방법 1을 사용하세요.

## 참고
- 익명 로그인은 사용자에게 이메일이나 비밀번호 없이 임시 계정을 생성합니다
- Firestore 규칙에서 `request.auth != null`을 만족하므로 접근이 가능합니다
- 실제 사용자 인증이 필요한 경우, Firebase Email/Password 인증을 추가로 설정할 수 있습니다
