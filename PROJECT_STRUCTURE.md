# 실시간 공정관리 웹앱 프로젝트 구조

## 프로젝트 개요
Next.js App Router + Firebase를 사용한 실시간 공정관리 웹앱

## 디렉토리 구조

```
production-schedule-app/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # 루트 레이아웃
│   ├── page.tsx                 # 홈 페이지 (프로젝트 목록)
│   ├── login/
│   │   └── page.tsx             # 로그인 페이지
│   ├── projects/
│   │   └── [projectId]/
│   │       └── page.tsx         # 공정표 페이지
│   └── api/                     # API 라우트 (필요시)
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx        # 로그인 폼
│   │   └── AuthGuard.tsx        # 인증 가드
│   ├── projects/
│   │   ├── ProjectList.tsx      # 프로젝트 목록
│   │   ├── ProjectCard.tsx      # 프로젝트 카드
│   │   └── ProjectSelector.tsx  # 프로젝트 선택기
│   ├── schedule/
│   │   ├── GanttChart.tsx      # Gantt Chart 컴포넌트
│   │   ├── ScheduleTable.tsx   # 공정표 테이블
│   │   └── ExcelUpload.tsx      # 엑셀 업로드
│   └── common/
│       ├── Loading.tsx          # 로딩 컴포넌트
│       └── ErrorBoundary.tsx    # 에러 바운더리
├── lib/
│   ├── firebase/
│   │   ├── config.ts            # Firebase 설정
│   │   ├── auth.ts              # 인증 유틸리티
│   │   └── firestore.ts         # Firestore 유틸리티
│   ├── hooks/
│   │   ├── useAuth.ts           # 인증 훅
│   │   ├── useProject.ts        # 프로젝트 훅
│   │   └── useSchedule.ts       # 공정표 훅 (onSnapshot)
│   └── utils/
│       ├── excelParser.ts       # 엑셀 파서
│       └── permissions.ts       # 권한 체크
├── types/
│   ├── project.ts               # 프로젝트 타입
│   ├── schedule.ts              # 공정표 타입
│   └── user.ts                  # 사용자 타입
├── firestore.rules              # Firestore 보안 규칙
├── package.json
├── tsconfig.json
└── next.config.js
```

## Firestore 데이터 구조

```
projects/{projectId}
  - name: string
  - createdAt: timestamp
  - updatedAt: timestamp
  - members: {
      {uid}: {
        role: "admin" | "editor" | "viewer"
        allowedProcesses?: number[]  // editor만 해당
      }
    }

schedules/{projectId}
  - tasks: [
      {
        id: string
        name: string
        process: number  // 1-6
        startDate: timestamp
        endDate: timestamp
        progress: number
        dependencies?: string[]
      }
    ]
  - updatedAt: timestamp
  - updatedBy: string (uid)
```

## 주요 기능

1. **인증**
   - 이메일/비밀번호 로그인 필수
   - 익명 접근 완전 차단
   - 로그인하지 않으면 모든 페이지 접근 불가

2. **실시간 동기화**
   - Firestore onSnapshot 사용
   - 여러 사용자 동시 작업 지원
   - 실시간 업데이트 반영

3. **권한 관리**
   - admin: 모든 공정 입력/삭제 + 차수계획
   - editor1: 공정1만
   - editor2: 공정2만
   - editor3: 공정3,4,5
   - editor4: 공정6만
   - viewer: 읽기 전용

4. **Gantt Chart**
   - gantt-task-react 라이브러리 사용
   - 실시간 업데이트 반영

5. **엑셀 연동**
   - xlsx 파일 업로드
   - Firestore schedules로 자동 변환
   - 실시간 반영
