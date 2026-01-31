# Firebase 로드 확인 가이드

> 작성일: 2026-01-25  
> 목적: `firebase is not defined` 오류 해결

---

## 🔍 문제: `firebase is not defined`

이 오류는 다음 경우에 발생합니다:
1. 다른 페이지에서 콘솔을 열었을 때
2. 페이지가 완전히 로드되기 전에 코드를 실행했을 때
3. Firebase SDK가 로드되지 않았을 때

---

## ✅ 해결 방법

### Step 1: 올바른 페이지에서 실행

**반드시 다음 페이지에서 콘솔을 열어야 합니다:**
```
http://localhost:8080/pages/K-product/2H_steel_product.html?project=P1
```

다른 페이지(예: `index.html`, `login.html`)에서는 `firebase`가 정의되지 않을 수 있습니다.

---

### Step 2: Firebase 로드 확인

올바른 페이지에서 다음 코드를 실행하세요:

```javascript
// Firebase 로드 확인
console.log('=== Firebase 로드 확인 ===');
console.log('firebase 객체:', typeof firebase !== 'undefined' ? '✅ 로드됨' : '❌ 로드 안 됨');

if (typeof firebase !== 'undefined') {
    console.log('firebase.apps:', firebase.apps);
    console.log('firebase.apps.length:', firebase.apps.length);
    
    if (firebase.apps.length > 0) {
        console.log('✅ Firebase 앱이 초기화되었습니다.');
    } else {
        console.log('⚠️ Firebase 앱이 초기화되지 않았습니다.');
    }
} else {
    console.error('❌ Firebase SDK가 로드되지 않았습니다.');
    console.log('💡 페이지를 새로고침하세요 (F5)');
    console.log('💡 올바른 페이지인지 확인하세요: 2H_steel_product.html?project=P1');
}
```

---

### Step 3: 페이지 새로고침

Firebase가 로드되지 않았다면:

1. 페이지 새로고침 (F5)
2. 개발자 도구 콘솔 다시 열기 (F12)
3. Step 2 코드 다시 실행

---

### Step 4: 로그인 (Firebase 로드 확인 후)

Firebase가 로드되었다면 로그인:

```javascript
// Firebase 로드 확인
if (typeof firebase === 'undefined') {
    console.error('❌ Firebase가 로드되지 않았습니다. 페이지를 새로고침하세요.');
} else {
    // 로그인 시도
    firebase.auth().signInWithEmailAndPassword("teddy1092@gmail.com", "비밀번호")
        .then((userCredential) => {
            console.log('✅ 로그인 성공!');
            console.log('UID:', userCredential.user.uid);
            console.log('Email:', userCredential.user.email);
            location.reload();
        })
        .catch((error) => {
            console.error('❌ 로그인 실패:', error);
        });
}
```

---

## 📋 체크리스트

- [ ] 올바른 페이지에서 실행 중인가? (`2H_steel_product.html?project=P1`)
- [ ] 페이지가 완전히 로드되었는가?
- [ ] 개발자 도구 콘솔이 열려 있는가?
- [ ] Firebase 로드 확인 코드를 실행했는가?

---

**작성 완료일**: 2026-01-25
