# 역할 및 권한 정리 요약

## 📋 역할 시스템 개요

### 역할 종류
1. **Viewer (열람자)**: 읽기 전용
2. **Editor (편집자)**: 허용된 공정만 수정 가능
3. **Approver (승인자)**: 모든 공정 수정 가능 (운송차수계획 제외)
4. **Admin (관리자)**: 모든 권한 (운송차수계획 포함)

---

## 🔐 권한 체크 위치

### 1. 일일입력 저장 (`saveSelectedColumns`)
- ✅ Viewer: 차단
- ✅ Editor: 허용된 공정만 저장 가능
- ✅ Admin/Approver: 모든 공정 저장 가능

### 2. 기둥 상태 저장 (`saveColumnStatus`)
- ✅ Viewer: 차단
- ✅ Editor: 허용된 공정만 저장 가능
- ✅ Admin/Approver: 모든 공정 저장 가능

### 3. 공정별 엑셀 업로드 (`handleProcessExcelFile`)
- ✅ Viewer: 차단
- ✅ Editor: 허용된 공정만 업로드 가능 (허용되지 않은 공정 데이터는 자동 스킵)
- ✅ Admin/Approver: 모든 공정 업로드 가능

### 4. 운송차수계획 엑셀 업로드 (`handleTransportPlanFile`)
- ✅ **Admin만 사용 가능**
- ❌ Viewer/Editor/Approver: 차단

### 5. 운송물량산정 엑셀 업로드 (`handleTransportVolumeFile`)
- ✅ Viewer: 차단
- ✅ Editor: 공정 5가 허용된 경우만 업로드 가능
- ✅ Admin/Approver: 업로드 가능

### 6. 운송차수계획 관련 함수들
- ✅ `saveTransportPlan()`: Admin만 사용 가능
- ✅ `addTransportTrip()`: Admin만 사용 가능
- ✅ `removeTransportTrip()`: Admin만 사용 가능
- ✅ `editTransportTrip()`: Admin만 사용 가능
- ✅ `toggleColumnForTransport()`: Admin만 사용 가능
- ✅ `showPanel('transport')`: Admin만 접근 가능

---

## 👥 Editor 역할 설정 (4가지)

### Editor 1
```javascript
setUserRole('editor', [1])
```
- **공정 1만**: 주기둥커팅

### Editor 2
```javascript
setUserRole('editor', [2])
```
- **공정 2만**: 기둥소부재가공

### Editor 3
```javascript
setUserRole('editor', [3, 4, 5])
```
- **공정 3, 4, 5**: 주기둥조립, 소부재조립, 현장배송

### Editor 4
```javascript
setUserRole('editor', [6])
```
- **공정 6만**: 현장설치

---

## 🚚 운송차수계획 (Admin 전용)

### 제한된 기능
- ✅ 엑셀 업로드
- ✅ 차수 추가/삭제/수정
- ✅ 기둥 선택/해제
- ✅ 운송차수계획 저장
- ✅ 패널 접근

### UI 제어
- Admin: 모든 입력 필드와 버튼 활성화
- Admin 외: 모든 입력 필드와 버튼 비활성화 (읽기 전용)

---

## 💾 데이터 저장

### 저장 방식
- **localStorage 기반**: 브라우저 로컬 저장소에 저장
- **Firebase 제거**: Firebase 관련 코드 완전 제거

### 저장 키
- `kcol:{PROJECT_ID}:steelColumnData` - 기둥 데이터
- `kcol:{PROJECT_ID}:steelColumnDaily` - 일일 데이터
- `kcol:{PROJECT_ID}:transportPlan` - 운송차수계획
- `kcol:{PROJECT_ID}:userRole` - 사용자 역할
- `kcol:{PROJECT_ID}:allowedProcesses` - Editor 허용 공정

---

## 🔧 역할 설정 방법

### 콘솔에서 설정
```javascript
// Admin
setUserRole('admin');

// Editor 1 (공정 1만)
setUserRole('editor', [1]);

// Editor 2 (공정 2만)
setUserRole('editor', [2]);

// Editor 3 (공정 3, 4, 5)
setUserRole('editor', [3, 4, 5]);

// Editor 4 (공정 6만)
setUserRole('editor', [6]);

// Viewer
setUserRole('viewer');
```

### 역할 확인
```javascript
// 현재 역할 확인
userRole();

// 허용된 공정 확인
allowedProcesses();
```

---

## ✅ 검증 완료 사항

1. ✅ Firebase 관련 코드 제거 완료
2. ✅ 역할 시스템 (localStorage 기반) 구현 완료
3. ✅ Editor 권한 체크 (4가지 설정) 구현 완료
4. ✅ Admin 권한 (모든 공정 입력 가능) 구현 완료
5. ✅ 운송차수계획 (Admin 전용) 구현 완료
6. ✅ 엑셀 업로드 권한 체크 구현 완료
7. ✅ UI 제어 (역할별 버튼/입력 필드 활성화/비활성화) 구현 완료

---

## 📝 주의사항

1. **운송차수계획**: Admin만 사용 가능 (Editor 3가 공정 5를 허용받아도 사용 불가)
2. **엑셀 업로드**: Editor는 허용된 공정 데이터만 업로드됨 (허용되지 않은 공정 데이터는 자동 스킵)
3. **역할 저장**: localStorage에 저장되므로 브라우저를 닫아도 유지됨
4. **기본 역할**: 기본값은 'admin' (역할이 설정되지 않은 경우)

---

## 🐛 알려진 이슈

없음

---

**최종 업데이트**: 2026-01-25
