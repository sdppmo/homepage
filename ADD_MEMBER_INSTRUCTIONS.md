# 멤버 추가 가이드 - UID: ABMTizFOBIhnybijDfI259vzicl1

## 🎯 목표
사용자 UID `ABMTizFOBIhnybijDfI259vzicl1`를 프로젝트 P1의 멤버로 추가

---

## 방법 1: Firebase Console에서 수동 추가 (첫 번째 Admin인 경우)

### 단계별 가이드

1. **Firebase Console 접속**
   - https://console.firebase.google.com
   - 프로젝트 선택

2. **Firestore Database → Data 탭**

3. **컬렉션 경로 생성/확인**
   ```
   projects → P1 → members → ABMTizFOBIhnybijDfI259vzicl1
   ```

4. **문서 생성/편집**
   - 문서 ID: `ABMTizFOBIhnybijDfI259vzicl1`
   - 필드 추가:
     ```
     role: "editor" (string)
     allowedProcesses: [1, 2, 3, 4, 5] (array, 허용할 공정 번호)
     ```
   - **참고**: `allowedProcesses`는 편집 가능한 공정 번호 배열입니다. 예: `[1, 2, 3]` 또는 `[3, 4, 5]`

5. **저장**

6. **페이지 새로고침**
   - `http://localhost:8080/pages/K-product/2H_steel_product.html?project=P1`
   - 또는 브라우저에서 F5

---

## 방법 2: 브라우저 콘솔에서 추가 (기존 Admin이 있는 경우)

**주의:** 이미 Admin 권한을 가진 사용자가 로그인한 상태에서만 작동합니다.

### Editor로 추가 (권장 - 특정 공정만 편집 가능)

브라우저 콘솔(F12)에서 다음 코드 실행:

```javascript
// Editor로 추가 (공정 1, 2, 3, 4, 5 허용 예시)
const targetUID = 'ABMTizFOBIhnybijDfI259vzicl1';
const allowedProcesses = [1, 2, 3, 4, 5]; // 허용할 공정 번호 배열 (필요에 따라 수정)

if (typeof setEditorByUID === 'function') {
    setEditorByUID(targetUID, allowedProcesses).then(success => {
        if (success) {
            console.log('✅ Editor 추가 완료! 페이지를 새로고침하세요.');
            console.log('💡 허용된 공정:', allowedProcesses.join(', '));
            setTimeout(() => location.reload(), 1000);
        } else {
            console.error('❌ Editor 추가 실패. 콘솔을 확인하세요.');
        }
    });
} else {
    console.error('❌ setEditorByUID 함수를 찾을 수 없습니다.');
    console.log('💡 페이지가 완전히 로드된 후 다시 시도하세요.');
}
```

**공정 번호 수정 방법:**
- `allowedProcesses = [1, 2, 3]` - 공정 1, 2, 3만 편집 가능
- `allowedProcesses = [3, 4, 5]` - 공정 3, 4, 5만 편집 가능
- `allowedProcesses = [1, 2, 3, 4, 5]` - 공정 1~5 모두 편집 가능

### Admin으로 추가

```javascript
// Admin으로 추가 (모든 공정 편집 가능)
const targetUID = 'ABMTizFOBIhnybijDfI259vzicl1';
if (typeof setAdminByUID === 'function') {
    setAdminByUID(targetUID).then(success => {
        if (success) {
            console.log('✅ Admin 추가 완료! 페이지를 새로고침하세요.');
            setTimeout(() => location.reload(), 1000);
        } else {
            console.error('❌ Admin 추가 실패. 콘솔을 확인하세요.');
        }
    });
} else {
    console.error('❌ setAdminByUID 함수를 찾을 수 없습니다.');
    console.log('💡 페이지가 완전히 로드된 후 다시 시도하세요.');
}
```

### Viewer로 추가 (읽기 전용)

```javascript
// Viewer로 추가 (읽기 전용)
const targetUID = 'ABMTizFOBIhnybijDfI259vzicl1';
if (typeof setViewerByUID === 'function') {
    setViewerByUID(targetUID).then(success => {
        if (success) {
            console.log('✅ Viewer 추가 완료! 페이지를 새로고침하세요.');
            setTimeout(() => location.reload(), 1000);
        } else {
            console.error('❌ Viewer 추가 실패. 콘솔을 확인하세요.');
        }
    });
} else {
    console.error('❌ setViewerByUID 함수를 찾을 수 없습니다.');
}
```


---

## 🔍 확인 방법

멤버 추가 후 다음을 확인하세요:

1. **Firebase Console에서 확인**
   - Firestore Database → Data
   - `projects/P1/members/ABMTizFOBIhnybijDfI259vzicl1` 문서가 존재하는지 확인
   - `role` 필드가 올바르게 설정되었는지 확인

2. **페이지 접속 확인**
   - 해당 UID로 로그인한 상태에서
   - `http://localhost:8080/pages/K-product/2H_steel_product.html?project=P1` 접속
   - 접근 차단 메시지가 사라지고 정상적으로 페이지가 로드되는지 확인

---

## ⚠️ 중요 사항

### Firestore Rules 제약

- **멤버가 아닌 사용자는 자신을 Admin으로 승격시킬 수 없음**
  - `members` 쓰기는 Admin만 가능
  - 따라서 첫 번째 Admin은 Firebase Console에서 수동으로 생성해야 함

### 권한 오류 발생 시

- **"permission-denied" 오류**: Admin 권한이 없거나 멤버 문서가 없음
- **해결**: Firebase Console에서 첫 번째 Admin 생성 또는 다른 Admin에게 요청

---

## 📋 역할별 권한

| 역할 | 권한 |
|------|------|
| **admin** | 모든 공정 읽기/쓰기 가능, 멤버 관리 가능 |
| **editor** | `allowedProcesses`에 지정된 공정만 읽기/쓰기 가능 |
| **viewer** | 모든 공정 읽기만 가능 (쓰기 불가) |

---

**작성일**: 2026-01-25  
**대상 UID**: ABMTizFOBIhnybijDfI259vzicl1  
**프로젝트**: P1  
**역할**: Editor (특정 공정만 편집 가능)
