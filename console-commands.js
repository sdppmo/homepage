// 콘솔 디버깅 명령어 - 브라우저 콘솔에 직접 붙여넣기
// 복사 시 코드 블록만 복사하세요 (```javascript 제외)

// ============================================
// 0. 권한 오류 진단
// ============================================
function diagnosePermissionError() {
    console.log('=== 권한 오류 진단 ===\n');
    
    // 1. 로그인 상태 확인
    const user = firebase.auth().currentUser;
    console.log('1. 로그인 상태:');
    if (!user) {
        console.log('   ❌ 로그인되지 않았습니다.');
        console.log('   해결: firebase.auth().signInWithEmailAndPassword("email", "password")');
        return;
    }
    console.log('   ✅ 로그인됨');
    console.log('   - UID:', user.uid);
    console.log('   - Email:', user.email || '(없음)');
    console.log('   - 익명 사용자:', user.isAnonymous ? '⚠️ 예 (차단됨)' : '✅ 아니오');
    
    if (user.isAnonymous) {
        console.log('\n   ⚠️ 익명 사용자는 접근할 수 없습니다.');
        console.log('   해결: Email/Password로 로그인하세요.');
        return;
    }
    console.log('');
    
    // 2. 프로젝트 ID 확인
    const projectId = new URLSearchParams(window.location.search).get('project') || 'P1';
    console.log('2. 프로젝트 정보:');
    console.log('   - 프로젝트 ID:', projectId);
    console.log('   - Firestore 경로: projects/' + projectId + '/members/' + user.uid);
    console.log('');
    
    // 3. Firestore 직접 확인 (권한 테스트)
    console.log('3. Firestore 권한 테스트:');
    const db = firebase.firestore();
    db.collection('projects').doc(projectId)
        .collection('members').doc(user.uid)
        .get()
        .then(doc => {
            if (doc.exists) {
            console.log('   ✅ 멤버 문서 존재');
            console.log('   - 데이터:', doc.data());
            console.log('   - 역할:', doc.data().role);
            console.log('   - 허용 공정:', doc.data().allowedProcesses);
        } else {
            console.log('   ⚠️ 멤버 문서가 없습니다.');
            console.log('   해결: Admin에게 멤버 추가를 요청하세요.');
        }
        })
        .catch(error => {
            console.error('   ❌ Firestore 읽기 오류:', error.code);
            console.error('   - 메시지:', error.message);
            if (error.code === 'permission-denied') {
                console.log('\n   🔧 가능한 원인:');
                console.log('   1. Firestore Rules가 제대로 배포되지 않았을 수 있습니다.');
                console.log('   2. 사용자가 로그인했지만 인증 토큰이 만료되었을 수 있습니다.');
                console.log('   해결: 페이지를 새로고침하거나 다시 로그인하세요.');
            }
        });
}

// 실행: diagnosePermissionError();

// ============================================
// 1. 기본 상태 확인 (안전한 버전)
// ============================================
function checkBasicStatus() {
    console.log('=== 현재 상태 ===');
    
    // 로그인 확인
    const user = firebase.auth().currentUser;
    if (!user) {
        console.log('❌ 로그인되지 않았습니다.');
        return;
    }
    
    console.log('역할:', window.userRole || '(없음)');
    console.log('허용 공정:', window.allowedProcesses || []);
    
    const adminSettings = document.getElementById('admin-role-settings');
    console.log('Admin 설정 영역:', adminSettings?.style.display || '(없음)');
    
    // Firestore 역할 확인 (에러 처리 포함)
    loadUserRoleFromFirebase()
        .then(role => {
            console.log('=== Firestore 역할 ===');
            if (role) {
                console.log('역할:', role.role);
                console.log('허용 공정:', role.allowedProcesses);
            } else {
                console.log('⚠️ Firestore에 역할 문서가 없습니다.');
            }
        })
        .catch(error => {
            console.error('❌ Firestore 역할 로드 실패:', error.message);
            console.log('💡 diagnosePermissionError()를 실행하여 원인을 확인하세요.');
        });
}

// 실행: checkBasicStatus();

// ============================================
// 2. 전체 상태 한 번에 확인
// ============================================
async function checkAllStatus() {
    console.log('=== 전체 상태 확인 ===\n');
    
    // 1. 인증 상태
    const user = firebase.auth().currentUser;
    console.log('1. 인증 상태:');
    console.log('   - 로그인:', user ? 'OK' : 'NO');
    if (user) {
        console.log('   - UID:', user.uid);
        console.log('   - Email:', user.email || '(none)');
        console.log('   - 익명:', user.isAnonymous ? 'YES' : 'NO');
    }
    console.log('');
    
    // 2. 로컬 역할
    console.log('2. 로컬 역할:');
    console.log('   - 역할:', window.userRole || '(none)');
    console.log('   - 허용 공정:', window.allowedProcesses || []);
    console.log('');
    
    // 3. Firestore 역할 (에러 처리)
    console.log('3. Firestore 역할:');
    try {
        const firestoreRole = await loadUserRoleFromFirebase();
        if (firestoreRole) {
            console.log('   - 역할:', firestoreRole.role);
            console.log('   - 허용 공정:', firestoreRole.allowedProcesses);
        } else {
            console.log('   - Firestore에 역할 문서가 없습니다.');
        }
    } catch (error) {
        console.error('   - 오류:', error.code, error.message);
        console.log('   💡 diagnosePermissionError()를 실행하여 원인을 확인하세요.');
    }
    console.log('');
    
    // 4. UI 상태
    console.log('4. UI 상태:');
    const adminSettings = document.getElementById('admin-role-settings');
    console.log('   - Admin 설정 영역:', adminSettings?.style.display === 'block' ? '표시됨' : '숨김');
    
    const workDateInput = document.getElementById('work-date');
    console.log('   - 작업일 입력:', workDateInput?.disabled ? '비활성화' : '활성화');
    console.log('');
    
    // 5. 프로젝트 정보
    const projectId = new URLSearchParams(window.location.search).get('project') || 'P1';
    console.log('5. 프로젝트 정보:');
    console.log('   - 프로젝트 ID:', projectId);
    if (user) {
        console.log('   - Firestore 경로: projects/' + projectId + '/members/' + user.uid);
    }
}

// 실행: checkAllStatus();

// ============================================
// 3. 역할 재적용
// ============================================
async function reloadRole() {
    console.log('역할 재로드 중...');
    try {
        await loadUserRole();
        applyRoleBasedUI();
        console.log('역할 재적용 완료');
        console.log('현재 역할:', window.userRole);
    } catch (error) {
        console.error('역할 재로드 실패:', error.message);
        console.log('💡 diagnosePermissionError()를 실행하여 원인을 확인하세요.');
    }
}

// 실행: reloadRole();

// ============================================
// 4. Firestore 멤버 문서 확인
// ============================================
function checkFirestoreMember() {
    const db = firebase.firestore();
    const projectId = new URLSearchParams(window.location.search).get('project') || 'P1';
    const uid = firebase.auth().currentUser?.uid;

    if (!uid) {
        console.error('로그인된 사용자가 없습니다.');
        return;
    }

    console.log('=== Firestore 멤버 문서 확인 ===');
    console.log('경로: projects/' + projectId + '/members/' + uid);
    
    db.collection('projects').doc(projectId)
        .collection('members').doc(uid)
        .get()
        .then(doc => {
            if (doc.exists) {
                console.log('✅ 문서 존재');
                console.log('데이터:', doc.data());
                console.log('역할:', doc.data().role);
                console.log('허용 공정:', doc.data().allowedProcesses);
            } else {
                console.log('⚠️ 문서가 없습니다.');
                console.log('해결: Admin에게 멤버 추가를 요청하세요.');
            }
        })
        .catch(error => {
            console.error('❌ 오류:', error.code, error.message);
            if (error.code === 'permission-denied') {
                console.log('💡 권한 오류입니다. diagnosePermissionError()를 실행하세요.');
            }
        });
}

// 실행: checkFirestoreMember();
