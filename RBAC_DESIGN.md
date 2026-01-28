# 역할 기반 접근 제어(RBAC) 설계

## 역할 정의

### 1. Viewer (열람자)
- **권한**: 공정표 열람만 가능
- **제한사항**: 
  - 데이터 읽기만 가능 (read)
  - 데이터 수정 불가 (write 불가)
  - UI에서 입력 필드 비활성화

### 2. Editor (편집자)
- **권한**: 공정진행율 및 날짜 수정 가능
- **제한사항**:
  - 데이터 읽기 가능 (read)
  - 공정진행율 수정 가능
  - 날짜 수정 가능
  - 변경사항은 승인 대기 상태로 저장 (pending)
  - 즉시 적용되지 않음

### 3. Approver (승인자)
- **권한**: 변경사항 승인
- **제한사항**:
  - 데이터 읽기 가능 (read)
  - 승인 대기 중인 변경사항 확인 및 승인/거부 가능
  - 승인된 변경사항만 실제 데이터에 반영

### 4. Admin (관리자)
- **권한**: 사용자 및 권한 관리
- **제한사항**:
  - 모든 권한 (read, write)
  - 사용자 역할 변경
  - 사용자 추가/삭제
  - 모든 변경사항 즉시 적용 (승인 불필요)

## 데이터 구조

### Firestore Collection: `kcolumn`
```
kcolumn/{projectId}_{suffix}
  - data: { ... }  // 실제 데이터
  - pendingChanges: {  // 승인 대기 중인 변경사항
      [userId]: {
        changes: { ... },
        timestamp: timestamp,
        status: 'pending' | 'approved' | 'rejected'
      }
    }
  - metadata: {
      lastModified: timestamp,
      lastModifiedBy: userId,
      version: number
    }
```

### Firestore Collection: `user_roles` (또는 Supabase 연동)
```
user_roles/{userId}
  - userId: string
  - role: 'viewer' | 'editor' | 'approver' | 'admin'
  - projectId: string (optional, 프로젝트별 역할)
  - updatedAt: timestamp
```

## Firestore 보안 규칙

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 역할 가져오기 헬퍼 함수
    function getUserRole() {
      return get(/databases/$(database)/documents/user_roles/$(request.auth.uid)).data.role;
    }
    
    match /kcolumn/{document=**} {
      // Viewer: 읽기만 가능
      allow read: if request.auth != null;
      
      // Editor: 읽기 + pendingChanges에 쓰기
      allow write: if request.auth != null && 
        (getUserRole() == 'editor' || getUserRole() == 'approver' || getUserRole() == 'admin');
      
      // Approver: pendingChanges 승인/거부
      allow update: if request.auth != null && 
        (getUserRole() == 'approver' || getUserRole() == 'admin');
      
      // Admin: 모든 권한
      allow read, write: if request.auth != null && getUserRole() == 'admin';
    }
    
    match /user_roles/{userId} {
      // Admin만 사용자 역할 관리 가능
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/user_roles/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## UI 제어 로직

### Viewer
- 모든 입력 필드 `disabled` 또는 `readonly`
- 저장 버튼 숨김
- 승인 버튼 숨김

### Editor
- 입력 필드 활성화
- 저장 버튼 표시 ("변경사항 저장 (승인 대기)")
- 저장 시 `pendingChanges`에 저장
- 승인 대기 중인 변경사항 표시

### Approver
- 입력 필드 활성화 (선택사항)
- 승인 대기 목록 표시
- 승인/거부 버튼 표시
- 승인 시 실제 데이터에 반영

### Admin
- 모든 기능 활성화
- 사용자 관리 메뉴 표시
- 변경사항 즉시 적용 (승인 불필요)

## 승인 워크플로우

1. **Editor가 변경사항 저장**
   - `pendingChanges[userId]`에 저장
   - `status: 'pending'`
   - 실제 데이터는 변경하지 않음

2. **Approver가 승인 대기 목록 확인**
   - `pendingChanges`에서 `status: 'pending'` 항목 조회
   - 변경사항 미리보기 표시

3. **Approver가 승인/거부**
   - 승인: `pendingChanges[userId].status = 'approved'` → 실제 데이터에 반영 → `pendingChanges[userId]` 삭제
   - 거부: `pendingChanges[userId].status = 'rejected'` → `pendingChanges[userId]` 삭제

4. **Admin은 즉시 적용**
   - 변경사항을 `pendingChanges`에 저장하지 않고 직접 데이터에 반영

## 구현 단계

1. ✅ Firestore 사용자 역할 스키마 설계
2. ⏳ Firestore 보안 규칙에 역할 기반 접근 제어 추가
3. ⏳ 프론트엔드에서 역할에 따른 UI 제어 구현
4. ⏳ 변경사항 승인 워크플로우 구현
5. ⏳ Admin 사용자 및 권한 관리 UI 구현
