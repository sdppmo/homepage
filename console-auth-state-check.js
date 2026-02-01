// ============================================================
// Firebase Auth State 확인 스크립트 (v8 compat 방식)
// 브라우저 콘솔에서 복사하여 실행하세요
// ============================================================

// 방법 1: 현재 프로젝트 방식 (v8 compat)
(function() {
    console.log('=== 🔥 Firebase Auth State 확인 (v8 compat) ===\n');
    
    // Firebase 초기화
    if (typeof initFirebase === 'function') {
        const initialized = initFirebase();
        if (!initialized) {
            console.error('❌ Firebase 초기화 실패');
            return;
        }
    }
    
    // firebaseAuth 변수 사용
    let auth = null;
    if (typeof firebaseAuth !== 'undefined' && firebaseAuth !== null) {
        auth = firebaseAuth;
        console.log('✅ firebaseAuth 변수 사용');
    } else if (firebase && firebase.auth) {
        auth = firebase.auth();
        console.log('✅ firebase.auth() 직접 사용');
    } else {
        console.error('❌ Firebase Auth를 사용할 수 없습니다.');
        return;
    }
    
    // 현재 사용자 확인
    const currentUser = auth.currentUser;
    console.log('📋 현재 사용자:');
    if (currentUser) {
        console.log('   ✅ 로그인됨');
        console.log('   UID:', currentUser.uid);
        console.log('   Email:', currentUser.email || '(없음)');
        console.log('   isAnonymous:', currentUser.isAnonymous);
    } else {
        console.log('   ❌ 로그인되지 않음');
    }
    
    // Auth State 변경 리스너 등록
    console.log('\n📋 Auth State 변경 리스너 등록...');
    const unsubscribe = auth.onAuthStateChanged((user) => {
        console.log('🔥 [Auth State 변경]');
        if (user) {
            console.log('   ✅ 로그인됨');
            console.log('   UID:', user.uid);
            console.log('   Email:', user.email || '(없음)');
            console.log('   isAnonymous:', user.isAnonymous);
        } else {
            console.log('   ❌ 로그아웃됨');
        }
    });
    
    console.log('✅ 리스너 등록 완료');
    console.log('💡 리스너 해제: unsubscribe()');
    
    // 전역 변수로 저장 (나중에 해제 가능하도록)
    window.authStateUnsubscribe = unsubscribe;
    
    console.log('\n💡 리스너 해제 방법:');
    console.log('   window.authStateUnsubscribe()');
})();

// ============================================================
// 방법 2: v9 모듈 방식 (현재 프로젝트에서는 작동하지 않음)
// ============================================================
/*
// 주의: 현재 프로젝트는 v8 compat를 사용하므로 이 코드는 작동하지 않습니다.
// v9 모듈을 사용하려면 프로젝트를 v9로 마이그레이션해야 합니다.

import { onAuthStateChanged } from "firebase/auth";

onAuthStateChanged(auth, (user) => {
  console.log("🔥 current uid =", user?.uid);
});
*/
