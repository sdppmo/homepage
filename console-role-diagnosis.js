// ============================================================
// 역할 진단 스크립트
// 브라우저 콘솔에서 복사하여 실행하세요
// ============================================================

async function diagnoseRole() {
    console.log('=== 🔍 역할 진단 시작 ===\n');
    
    // 1. Firebase 초기화 확인
    console.log('1️⃣ Firebase 초기화 확인...');
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase SDK가 로드되지 않았습니다.');
        return;
    }
    console.log('✅ Firebase SDK 로드됨');
    
    if (typeof initFirebase === 'function') {
        const initialized = initFirebase();
        if (!initialized) {
            console.error('❌ Firebase 초기화 실패');
            return;
        }
        console.log('✅ Firebase 초기화 완료');
    } else {
        console.warn('⚠️ initFirebase() 함수를 찾을 수 없습니다.');
    }
    
    // 2. 로그인 상태 확인
    console.log('\n2️⃣ 로그인 상태 확인...');
    let auth = null;
    if (typeof firebaseAuth !== 'undefined' && firebaseAuth !== null) {
        auth = firebaseAuth;
    } else if (firebase && firebase.auth) {
        auth = firebase.auth();
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
    
    console.log('✅ 로그인됨');
    console.log('   UID:', user.uid);
    console.log('   Email:', user.email || '(없음)');
    console.log('   익명 사용자:', user.isAnonymous ? '⚠️ 예' : '✅ 아니오');
    
    if (user.isAnonymous) {
        console.error('❌ 익명 사용자는 역할을 로드할 수 없습니다.');
        return;
    }
    
    // 3. Firestore 멤버 문서 확인
    console.log('\n3️⃣ Firestore 멤버 문서 확인...');
    
    // PROJECT_ID 확인
    let projectId = 'P1'; // 기본값
    if (typeof PROJECT_ID !== 'undefined') {
        projectId = PROJECT_ID;
    } else {
        // URL에서 추출 시도
        const urlParams = new URLSearchParams(window.location.search);
        projectId = urlParams.get('project') || 'P1';
    }
    console.log('   프로젝트 ID:', projectId);
    console.log('   Firestore 경로: projects/' + projectId + '/members/' + user.uid);
    
    try {
        let db = null;
        if (typeof firebaseDb !== 'undefined' && firebaseDb !== null) {
            db = firebaseDb;
        } else if (firebase && firebase.firestore) {
            db = firebase.firestore();
        } else {
            console.error('❌ Firestore를 사용할 수 없습니다.');
            return;
        }
        
        const memberDoc = await db.collection('projects').doc(projectId)
            .collection('members').doc(user.uid).get();
        
        if (!memberDoc.exists) {
            console.error('❌ 멤버 문서가 존재하지 않습니다!');
            console.log('\n💡 해결 방법:');
            console.log('   1. Firebase Console → Firestore Database');
            console.log('   2. 경로: projects → ' + projectId + ' → members');
            console.log('   3. "Add document" 클릭');
            console.log('   4. Document ID: ' + user.uid);
            console.log('   5. 필드 추가:');
            console.log('      - role: "admin" (string)');
            console.log('      - allowedProcesses: [] (array)');
            console.log('   6. "Save" 클릭');
            return;
        }
        
        const memberData = memberDoc.data();
        console.log('✅ 멤버 문서 존재');
        console.log('   문서 데이터:', memberData);
        console.log('   role 필드:', memberData.role, '(타입:', typeof memberData.role + ')');
        console.log('   allowedProcesses 필드:', memberData.allowedProcesses, '(타입:', typeof memberData.allowedProcesses + ')');
        
        // 4. loadUserRoleFromFirebase() 테스트
        console.log('\n4️⃣ loadUserRoleFromFirebase() 테스트...');
        if (typeof loadUserRoleFromFirebase === 'function') {
            const roleData = await loadUserRoleFromFirebase();
            if (roleData) {
                console.log('✅ 역할 로드 성공');
                console.log('   role:', roleData.role);
                console.log('   allowedProcesses:', roleData.allowedProcesses);
            } else {
                console.error('❌ 역할 로드 실패 (null 반환)');
            }
        } else {
            console.error('❌ loadUserRoleFromFirebase() 함수를 찾을 수 없습니다.');
        }
        
        // 5. window.userRole 확인
        console.log('\n5️⃣ window.userRole 확인...');
        console.log('   window.userRole:', window.userRole);
        console.log('   window.allowedProcesses:', window.allowedProcesses);
        
        if (!window.userRole) {
            console.warn('⚠️ window.userRole이 설정되지 않았습니다.');
            console.log('💡 setUserRole()을 수동으로 호출하세요:');
            console.log('   setUserRole("' + memberData.role + '", ' + JSON.stringify(memberData.allowedProcesses || []) + ')');
        }
        
        // 6. 수동으로 역할 설정 제안
        console.log('\n6️⃣ 수동 역할 설정...');
        if (typeof setUserRole === 'function') {
            console.log('💡 다음 명령어로 역할을 수동 설정할 수 있습니다:');
            console.log('   setUserRole("' + memberData.role + '", ' + JSON.stringify(memberData.allowedProcesses || []) + ')');
        } else {
            console.error('❌ setUserRole() 함수를 찾을 수 없습니다.');
        }
        
    } catch (error) {
        console.error('❌ Firestore 조회 오류:', error);
        console.error('   오류 코드:', error.code);
        console.error('   오류 메시지:', error.message);
        
        if (error.code === 'permission-denied') {
            console.log('\n💡 권한 오류 해결 방법:');
            console.log('   1. Firestore Security Rules 확인');
            console.log('   2. projects/' + projectId + '/members/{uid} read 권한 확인');
            console.log('   3. 본인 UID로 읽기 권한이 있는지 확인');
        }
    }
    
    console.log('\n=== ✅ 진단 완료 ===');
}

// 실행
diagnoseRole();
