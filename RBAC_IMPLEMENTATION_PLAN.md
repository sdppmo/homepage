# 역할 기반 접근 제어(RBAC) 구현 계획

## 구현 단계

### Phase 1: 기본 구조 (현재)
1. ✅ Firestore 규칙 업데이트 - 역할 기반 접근 제어
2. ⏳ 사용자 역할 관리 시스템 추가
3. ⏳ 프론트엔드에서 역할 확인 함수 추가

### Phase 2: UI 제어
4. ⏳ Viewer: 읽기 전용 모드 (입력 필드 비활성화)
5. ⏳ Editor: 수정 가능하지만 승인 대기 상태로 저장
6. ⏳ Approver: 승인 대기 목록 확인 및 승인/거부
7. ⏳ Admin: 모든 권한 + 사용자 관리 UI

### Phase 3: 승인 워크플로우
8. ⏳ pendingChanges 구조 구현
9. ⏳ Editor가 변경사항을 pendingChanges에 저장
10. ⏳ Approver가 승인 대기 목록 확인
11. ⏳ Approver가 승인/거부 처리

### Phase 4: Admin 기능
12. ⏳ 사용자 역할 관리 UI
13. ⏳ 사용자 추가/삭제 기능
14. ⏳ 역할 변경 기능

## 데이터 구조

### user_roles 컬렉션
```
user_roles/{userId}
  - userId: string
  - role: 'viewer' | 'editor' | 'approver' | 'admin'
  - projectId: string (optional, 프로젝트별 역할)
  - updatedAt: timestamp
  - updatedBy: userId
```

### kcolumn 문서 구조 (확장)
```
kcolumn/{projectId}_{suffix}
  - data: { ... }  // 실제 데이터
  - pendingChanges: {
      [userId]: {
        changes: { ... },
        timestamp: timestamp,
        status: 'pending' | 'approved' | 'rejected',
        message: string (optional)
      }
    }
  - metadata: {
      lastModified: timestamp,
      lastModifiedBy: userId,
      version: number
    }
```

## 다음 단계
1. 사용자 역할 확인 함수 구현
2. UI 제어 로직 추가
3. 승인 워크플로우 구현
