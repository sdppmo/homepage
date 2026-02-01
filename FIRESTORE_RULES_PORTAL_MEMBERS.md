# Firestore Rules - Portal Members 구조 변경

> 작성일: 2026-01-25  
> 목적: Portal Members 구조 변경 및 Security Rules 수정

---

## 📋 변경 사항

### 구조 변경

**이전 구조:**
```
/portal_members/{uid}
```

**새로운 구조:**
```
/projects/{projectId}/portal_members/{uid}
```

### 이유

1. **프로젝트별 포털 역할 관리**: 각 프로젝트마다 다른 포털 역할을 가질 수 있음
2. **일관성**: 프로젝트 관련 데이터를 `projects/{projectId}` 하위에 통합
3. **권한 관리 용이**: 프로젝트 멤버만 해당 프로젝트의 포털 역할을 확인 가능

---

## 🔒 Security Rules

### 새로운 Rules

```javascript
match /projects/{projectId} {
  // ... 기존 rules ...
  
  // 포털 역할 정보 (참고/표시 용도만, 읽기 전용)
  // 프로젝트 권한의 단일 진실 소스는 projects/{projectId}/members/{uid}로 유지
  match /portal_members/{uid} {
    allow read: if isSignedInNonAnon() && request.auth.uid == uid;
    allow write: if false; // 쓰기 완전 차단 (읽기 전용)
  }
}
```

### 권한 정책

- **읽기**: 본인만 자신의 포털 역할 문서를 읽을 수 있음
- **쓰기**: 완전 차단 (읽기 전용)
- **프로젝트 권한**: `projects/{projectId}/members/{uid}`가 단일 진실 소스

---

## 📝 코드 변경

### `loadPortalRole` 함수 수정

**이전:**
```javascript
const snap = await firebaseDb.collection("portal_members").doc(uid).get();
```

**새로운:**
```javascript
const snap = await firebaseDb.collection("projects").doc(window.PROJECT_ID)
    .collection("portal_members").doc(uid).get();
```

---

## 🔄 마이그레이션

### Firestore 데이터 마이그레이션

기존 `/portal_members/{uid}` 데이터를 `/projects/{projectId}/portal_members/{uid}`로 이동해야 합니다.

**마이그레이션 스크립트 예시:**
```javascript
// Firebase Console에서 실행하거나 Cloud Function으로 실행
const admin = require('firebase-admin');
const db = admin.firestore();

async function migratePortalMembers() {
  const portalMembers = await db.collection('portal_members').get();
  
  for (const doc of portalMembers.docs) {
    const uid = doc.id;
    const data = doc.data();
    
    // 각 프로젝트에 복사 (또는 특정 프로젝트에만 복사)
    const projects = await db.collection('projects').get();
    for (const projectDoc of projects.docs) {
      const projectId = projectDoc.id;
      await db.collection('projects').doc(projectId)
        .collection('portal_members').doc(uid).set(data);
    }
  }
  
  console.log('마이그레이션 완료');
}
```

---

## ⚠️ 중요 사항

### 프로젝트 권한의 단일 진실 소스

- **프로젝트 권한**: `projects/{projectId}/members/{uid}.role`이 단일 진실 소스
- **포털 역할**: `projects/{projectId}/portal_members/{uid}.portalRole`은 참고/표시 용도만
- **포털 admin ≠ 프로젝트 admin**: 포털 admin이라도 프로젝트 admin은 별도로 부여해야 함

### 보안

- 포털 역할 문서는 읽기 전용 (쓰기 완전 차단)
- 본인만 자신의 포털 역할을 읽을 수 있음
- 프로젝트 멤버가 아니어도 포털 역할은 읽을 수 있음 (참고용)

---

## 🔄 대안: 기존 구조 유지 (옵션 B)

구조 변경이 어려운 경우, 기존 `/portal_members/{uid}` 구조를 유지하고 읽기 전용 룰만 추가:

```javascript
// 루트 레벨 portal_members (읽기 전용)
match /portal_members/{uid} {
  allow read: if isSignedInNonAnon() && request.auth.uid == uid;
  allow write: if false; // 쓰기 완전 차단
}
```

이 경우 코드 변경 없이 Rules만 추가하면 됩니다.

---

**작성일**: 2026-01-25
