# ⚠️ 긴급: Firestore 규칙 배포 필요

## 현재 상황
`2H_steel_product.html` 페이지에서 **"Missing or insufficient permissions"** 오류가 계속 발생하고 있습니다.

**원인**: Firestore 보안 규칙이 아직 배포되지 않았거나, 이전 규칙(`request.auth != null`)이 여전히 적용되고 있습니다.

## 즉시 해결 방법

### 1단계: Firebase Console 접속
1. https://console.firebase.google.com/ 접속
2. 프로젝트 선택: **`hakdong-a80b8`**

### 2단계: Firestore 규칙 편집
1. 왼쪽 메뉴에서 **Firestore Database** 클릭
2. 상단 탭에서 **Rules** (또는 **규칙**) 클릭
3. 편집기 영역의 **모든 내용을 삭제**하고 아래 규칙을 **정확히** 복사하여 붙여넣기:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /kcolumn/{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 3단계: 규칙 배포 (중요!)
1. 편집기 **우측 상단** 또는 **하단**에서 **"Publish"** (또는 **"게시"**) 버튼 찾기
2. **"Publish"** 버튼 클릭
3. 배포 완료 메시지 확인 (몇 초 소요)

### 4단계: 확인
1. 브라우저에서 `2H_steel_product.html?project=P1` 페이지 새로고침
2. 개발자 도구(F12) → Console 탭 확인
3. **"Missing or insufficient permissions"** 오류가 사라졌는지 확인

## 주의사항

⚠️ **이 규칙(`if true`)은 테스트용입니다.**
- 모든 사용자가 인증 없이 데이터에 접근할 수 있습니다
- 프로덕션 환경에서는 보안을 강화해야 합니다

## 프로덕션용 규칙 (나중에 적용)

익명 로그인을 활성화한 후 다음 규칙을 사용하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /kcolumn/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 문제 해결

**여전히 오류가 발생하는 경우:**
1. Firebase Console에서 규칙이 정확히 배포되었는지 확인
2. 브라우저 캐시 삭제 후 다시 시도
3. Firebase Console → Firestore Database → Rules에서 현재 규칙 확인
