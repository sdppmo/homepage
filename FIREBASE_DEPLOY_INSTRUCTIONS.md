# Firestore 보안 규칙 배포 가이드

## 문제 상황
공정표 데이터가 user UID 기준으로 저장되어, 다른 컴퓨터에서 로그인하면 데이터가 보이지 않는 문제가 발생했습니다.

## 해결 방법
코드는 이미 `PROJECT_ID` 기반으로 저장하도록 수정되어 있습니다. 이제 Firestore 보안 규칙을 배포해야 합니다.

## Firestore 보안 규칙 배포 방법

### 방법 1: Firebase Console에서 직접 배포 (권장)

1. Firebase Console 접속: https://console.firebase.google.com/
2. 프로젝트 선택: `hakdong-a80b8`
3. 왼쪽 메뉴에서 **Firestore Database** (또는 **Firestore**) 클릭
4. 상단 탭에서 **Rules** (또는 **규칙**) 클릭
5. 편집기 영역에 `firestore.rules` 파일의 내용을 복사하여 붙여넣기:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // kcolumn collection: projectId 기반 접근 허용
    // 경로: kcolumn/{projectId}_{suffix}
    // 예: kcolumn/P1_columnData, kcolumn/P1_dailyData 등
    match /kcolumn/{document=**} {
      // ⚠️ 임시: 인증 없이도 접근 가능 (테스트용)
      // 프로덕션 환경에서는 아래 주석 처리된 규칙을 사용하세요
      allow read, write: if true;
      
      // 프로덕션용 규칙 (익명 로그인 활성화 후 사용):
      // allow read, write: if request.auth != null;
    }
    
    // 기존 users/{uid} 구조가 있다면 제거하거나 마이그레이션
    // (필요한 경우에만 유지)
  }
}
```

6. **Publish** 버튼 위치:
   - 편집기 영역 **우측 상단**에 있는 **"Publish"** (또는 **"게시"**) 버튼 클릭
   - 또는 편집기 **하단**에 있는 **"Publish"** 버튼 클릭
   - 화면에 따라 위치가 다를 수 있지만, 보통 편집기 영역의 **상단 또는 하단**에 있습니다

**참고**: 
- 규칙을 수정하면 편집기 상단에 "Unsaved changes" (저장되지 않은 변경사항) 경고가 표시됩니다
- "Publish" 버튼을 클릭하면 변경사항이 즉시 배포됩니다
- 배포 후 몇 초 내에 적용됩니다

### 방법 2: Firebase CLI 사용

```bash
# Firebase CLI 설치 (없는 경우)
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 프로젝트 초기화 (이미 초기화된 경우 생략)
firebase init firestore

# 보안 규칙 배포
firebase deploy --only firestore:rules
```

## 확인 방법

1. `pages/K-product/2H_steel_product.html?project=P1` 페이지 열기
2. 브라우저 개발자 도구 콘솔에서 다음 메시지 확인:
   - `[Firebase] Firestore 초기화 완료`
   - `✅ Firebase 저장 완료 (projectId: P1)`
3. 다른 컴퓨터에서 같은 프로젝트(`?project=P1`)로 접속하여 데이터 확인

## 데이터 구조

### 변경 전 (UID 기반 - 문제 발생)
```
users/{uid}/kcolumn/{suffix}
```

### 변경 후 (projectId 기반 - 현재)
```
kcolumn/{projectId}_{suffix}
예: kcolumn/P1_columnData
    kcolumn/P1_dailyData
    kcolumn/P1_transportPlan
```

## 주의사항

- 기존 UID 기반 데이터가 있다면 마이그레이션이 필요할 수 있습니다.
- 보안 규칙 배포 후 즉시 적용됩니다.
- 테스트 환경에서 먼저 확인하는 것을 권장합니다.
