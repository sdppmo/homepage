# 송도파트너스 홈페이지

K-COL 철골기둥 설계 플랫폼 - 기업 웹사이트

---

## 📁 프로젝트 구조

```
homepage/
├── assets/
│   └── images/
│       ├── background_vessel_nyc.png   # 메인 배경 이미지
│       ├── product.png                  # 제품 로고 (K-COL, SLIM-BOX 등)
│       └── sdppmo_logo.png             # 회사 로고
├── css/
│   └── styles.css                       # 스타일시트
├── js/
│   └── main.js                          # 자바스크립트
├── index.html                           # 메인 페이지
├── start-server.bat                     # 서버 시작 스크립트 (Windows)
├── start-server.ps1                     # 서버 시작 스크립트 (PowerShell)
└── README.md                            # 프로젝트 문서
```

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| **반응형 레이아웃** | 모든 해상도(4K, 1080p 등)에서 화면 전체 채움 |
| **좌측 사이드바** | 네비게이션 메뉴, 로그인 폼, 브로셔 링크 |
| **메인 콘텐츠** | 배경 이미지, 환율 정보, 뉴스 |
| **푸터** | 연락처 정보 및 파트너 로고 |

---

## 🚀 시작하기

### 방법 1: 스크립트 실행 (권장)

`start-server.bat` 파일을 **더블클릭**하면 자동으로 서버가 시작됩니다.

```
========================================
   K-COL Homepage Server Launcher
========================================

[1/2] 기존 8080 포트 프로세스 확인 중...
     완료!

[2/2] 서버 시작 중...

========================================
   서버 주소: http://localhost:8080
   종료하려면 Ctrl+C 를 누르세요
========================================
```

### 방법 2: 수동 실행

```powershell
# Python 사용
cd C:\Users\sbd\sdppmo\homepage
python -m http.server 8080
```

그 후 브라우저에서 `http://localhost:8080` 접속

---

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| **마크업** | HTML5 |
| **스타일** | CSS3 (Flexbox, Grid, CSS 변수) |
| **스크립트** | JavaScript ES6+ |
| **로컬 서버** | Python http.server |

---

## 🌐 지원 브라우저

- ✅ Chrome (최신)
- ✅ Firefox (최신)
- ✅ Edge (최신)
- ✅ Safari (최신)

---

## 📞 연락처

| 항목 | 정보 |
|------|------|
| **웹사이트** | http://www.kcol.kr |
| **이메일** | sbd_pmo@naver.com |
| **본사 주소** | 인천광역시 연수구 컨벤시아대로 42번길 77번지 |
| **서울 사무소** | 추후 공개 |
