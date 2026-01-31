// ============================================================
// Firebase 콘솔 로그인 헬퍼 스크립트
// 브라우저 콘솔에서 복사하여 실행하세요
// ============================================================

// 방법 1: 페이지의 initFirebase() 함수 사용 (권장)
async function consoleLogin(email, password) {
    console.log('🔍 Firebase 초기화 확인 중...');
    
    // 1. Firebase SDK 로드 확인
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase SDK가 로드되지 않았습니다. 페이지를 새로고침하세요.');
        return;
    }
    
    // 2. 페이지의 initFirebase() 함수 사용
    if (typeof initFirebase === 'function') {
        const initialized = initFirebase();
        if (!initialized) {
            console.error('❌ Firebase 초기화 실패');
            return;
        }
        console.log('✅ Firebase 초기화 완료');
    } else {
        // initFirebase()가 없으면 직접 확인
        if (firebase.apps.length === 0) {
            console.error('❌ Firebase가 초기화되지 않았습니다. firebase-config.js가 로드되었는지 확인하세요.');
            return;
        }
        console.log('✅ Firebase 이미 초기화됨');
    }
    
    // 3. firebaseAuth 변수 사용 (페이지에서 설정됨)
    let auth = null;
    if (typeof firebaseAuth !== 'undefined' && firebaseAuth !== null) {
        auth = firebaseAuth;
        console.log('✅ firebaseAuth 변수 사용');
    } else if (typeof firebase !== 'undefined' && firebase.auth) {
        auth = firebase.auth();
        console.log('✅ firebase.auth() 직접 사용');
    } else {
        console.error('❌ Firebase Auth를 사용할 수 없습니다.');
        return;
    }
    
    // 4. 로그인 시도
    try {
        console.log('🔐 로그인 시도 중...', email);
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('✅ 로그인 성공!');
        console.log('   UID:', userCredential.user.uid);
        console.log('   Email:', userCredential.user.email);
        console.log('💡 페이지를 새로고침하면 역할이 로드됩니다: location.reload()');
        return userCredential;
    } catch (error) {
        console.error('❌ 로그인 실패:', error.code);
        console.error('   메시지:', error.message);
        if (error.code === 'auth/invalid-login-credentials') {
            console.log('💡 이메일/비밀번호가 올바르지 않습니다. Firebase Console에서 확인하세요.');
        } else if (error.code === 'auth/user-not-found') {
            console.log('💡 사용자가 존재하지 않습니다. Firebase Console에서 사용자를 생성하세요.');
        }
        throw error;
    }
}

// 방법 2: 직접 firebase.auth() 사용 (간단한 버전)
async function quickLogin(email, password) {
    // Firebase SDK 로드 대기
    let attempts = 0;
    while (typeof firebase === 'undefined' && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
    }
    
    if (typeof firebase === 'undefined') {
        throw new Error('Firebase SDK가 로드되지 않았습니다. 페이지를 새로고침하세요.');
    }
    
    if (firebase.apps.length === 0) {
        throw new Error('Firebase가 초기화되지 않았습니다.');
    }
    
    if (!firebase.auth) {
        throw new Error('firebase.auth가 사용할 수 없습니다.');
    }
    
    const auth = firebase.auth();
    return await auth.signInWithEmailAndPassword(email, password);
}

// 사용 예시:
// consoleLogin('your-email@example.com', 'your-password')
//   .then(() => location.reload())
//   .catch(err => console.error(err));

// 또는:
// quickLogin('your-email@example.com', 'your-password')
//   .then(() => location.reload())
//   .catch(err => console.error(err));

console.log('✅ 콘솔 로그인 헬퍼 로드됨');
console.log('💡 사용법: consoleLogin("email@example.com", "password")');
console.log('💡 또는: quickLogin("email@example.com", "password")');
