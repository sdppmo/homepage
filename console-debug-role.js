// ============================================================
// 상세 역할 디버깅 스크립트
// 브라우저 콘솔에서 복사하여 실행하세요
// ============================================================

(async function() {
    console.log('=== 🔍 상세 역할 디버깅 ===\n');
    
    // Step 1: 기본 상태 확인
    console.log('📋 Step 1: 기본 변수 확인');
    console.log('   window.userRole:', window.userRole);
    console.log('   window.allowedProcesses:', window.allowedProcesses);
    console.log('   typeof setUserRole:', typeof setUserRole);
    console.log('   typeof loadUserRoleFromFirebase:', typeof loadUserRoleFromFirebase);
    console.log('   typeof initFirebase:', typeof initFirebase);
    
    // Step 2: Firebase 초기화
    console.log('\n📋 Step 2: Firebase 초기화');
    if (typeof firebase === 'undefined') {
        console.error('❌ firebase 객체가 없습니다. 페이지를 새로고침하세요.');
        return;
    }
    console.log('   ✅ firebase 객체 존재');
    console.log('   firebase.apps.length:', firebase.apps.length);
    
    if (typeof initFirebase === 'function') {
        const result = initFirebase();
        console.log('   initFirebase() 결과:', result);
    } else {
        console.error('❌ initFirebase() 함수가 없습니다.');
    }
    
    // Step 3: 로그인 상태
    console.log('\n📋 Step 3: 로그인 상태');
    let auth = null;
    if (typeof firebaseAuth !== 'undefined' && firebaseAuth !== null) {
        auth = firebaseAuth;
        console.log('   ✅ firebaseAuth 변수 사용');
    } else if (firebase && firebase.auth) {
        auth = firebase.auth();
        console.log('   ✅ firebase.auth() 직접 사용');
    } else {
        console.error('❌ Firebase Auth를 사용할 수 없습니다.');
        return;
    }
    
    const user = auth.currentUser;
    if (!user) {
        console.error('❌ 로그인되지 않았습니다.');
        console.log('💡 로그인 방법:');
        console.log('   auth.signInWithEmailAndPassword("email@example.com", "password")');
        return;
    }
    
    console.log('   ✅ 로그인됨');
    console.log('   UID:', user.uid);
    console.log('   Email:', user.email);
    console.log('   isAnonymous:', user.isAnonymous);
    
    // Step 4: PROJECT_ID 확인
    console.log('\n📋 Step 4: 프로젝트 ID 확인');
    const projectId = typeof PROJECT_ID !== 'undefined' ? PROJECT_ID : 'P1';
    console.log('   PROJECT_ID:', projectId);
    
    // Step 5: Firestore 멤버 문서 직접 조회
    console.log('\n📋 Step 5: Firestore 멤버 문서 조회');
    try {
        let db = null;
        if (typeof firebaseDb !== 'undefined' && firebaseDb !== null) {
            db = firebaseDb;
            console.log('   ✅ firebaseDb 변수 사용');
        } else if (firebase && firebase.firestore) {
            db = firebase.firestore();
            console.log('   ✅ firebase.firestore() 직접 사용');
        } else {
            console.error('❌ Firestore를 사용할 수 없습니다.');
            return;
        }
        
        const memberRef = db.collection('projects').doc(projectId)
            .collection('members').doc(user.uid);
        
        console.log('   Firestore 경로:', 'projects/' + projectId + '/members/' + user.uid);
        
        const memberDoc = await memberRef.get();
        
        if (!memberDoc.exists) {
            console.error('❌ 멤버 문서가 존재하지 않습니다!');
            console.log('\n💡 해결 방법:');
            console.log('   1. Firebase Console → Firestore Database');
            console.log('   2. projects → ' + projectId + ' → members');
            console.log('   3. "Add document" 클릭');
            console.log('   4. Document ID: ' + user.uid);
            console.log('   5. 필드 추가:');
            console.log('      role: "admin" (string)');
            console.log('      allowedProcesses: [] (array)');
            console.log('   6. "Save" 클릭');
            return;
        }
        
        const memberData = memberDoc.data();
        console.log('   ✅ 멤버 문서 존재');
        console.log('   문서 데이터:', memberData);
        console.log('   role:', memberData.role, '(타입:', typeof memberData.role + ')');
        console.log('   allowedProcesses:', memberData.allowedProcesses, '(타입:', typeof memberData.allowedProcesses + ')');
        
        // Step 6: loadUserRoleFromFirebase() 테스트
        console.log('\n📋 Step 6: loadUserRoleFromFirebase() 테스트');
        if (typeof loadUserRoleFromFirebase === 'function') {
            try {
                const roleData = await loadUserRoleFromFirebase();
                console.log('   loadUserRoleFromFirebase() 결과:', roleData);
                if (roleData) {
                    console.log('   ✅ 역할 로드 성공');
                    console.log('      role:', roleData.role);
                    console.log('      allowedProcesses:', roleData.allowedProcesses);
                } else {
                    console.error('   ❌ 역할 로드 실패 (null 반환)');
                }
            } catch (error) {
                console.error('   ❌ loadUserRoleFromFirebase() 오류:', error);
            }
        } else {
            console.error('   ❌ loadUserRoleFromFirebase() 함수가 없습니다.');
        }
        
        // Step 7: setUserRole() 수동 호출
        console.log('\n📋 Step 7: setUserRole() 수동 호출');
        if (typeof setUserRole === 'function') {
            const normalizedProcesses = Array.isArray(memberData.allowedProcesses) 
                ? memberData.allowedProcesses.map(p => parseInt(p)).filter(p => !isNaN(p))
                : [];
            
            console.log('   setUserRole("' + memberData.role + '", ' + JSON.stringify(normalizedProcesses) + ') 호출 중...');
            setUserRole(memberData.role, normalizedProcesses);
            
            console.log('   ✅ setUserRole() 호출 완료');
            console.log('   window.userRole:', window.userRole);
            console.log('   window.allowedProcesses:', window.allowedProcesses);
            
            // localStorage 확인
            console.log('\n📋 Step 8: localStorage 확인');
            console.log('   localStorage["kcol:userRole"]:', localStorage.getItem('kcol:userRole'));
            console.log('   localStorage["kcol:allowedProcesses"]:', localStorage.getItem('kcol:allowedProcesses'));
            
        } else {
            console.error('   ❌ setUserRole() 함수가 없습니다.');
        }
        
    } catch (error) {
        console.error('❌ Firestore 조회 오류:', error);
        console.error('   오류 코드:', error.code);
        console.error('   오류 메시지:', error.message);
        console.error('   스택:', error.stack);
    }
    
    console.log('\n=== ✅ 디버깅 완료 ===');
    console.log('\n💡 다음 명령어로 역할 확인:');
    console.log('   console.log("역할:", window.userRole);');
    console.log('   console.log("허용 공정:", window.allowedProcesses);');
})();
