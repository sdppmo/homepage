/**
 * Portal Members 마이그레이션 스크립트
 * 
 * 기존: /portal_members/{uid}
 * 새로운: /projects/P1/portal_members/{uid}
 * 
 * 사용법:
 *   node scripts/migrate-portal-members.js
 * 
 * 환경 변수:
 *   GOOGLE_APPLICATION_CREDENTIALS: Firebase Admin SDK 서비스 계정 키 경로
 *   또는 FIREBASE_PROJECT_ID: Firebase 프로젝트 ID
 */

const admin = require('firebase-admin');
const readline = require('readline');

// 환경 변수에서 서비스 계정 키 경로 확인
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
let projectId = process.env.FIREBASE_PROJECT_ID;

// 프로젝트 ID가 없으면 기본값 사용 (hakdong-a80b8)
if (!projectId) {
  projectId = 'hakdong-a80b8';
  console.log(`ℹ️  프로젝트 ID를 환경 변수에서 찾지 못해 기본값 사용: ${projectId}`);
}

if (!serviceAccountPath && !projectId) {
  console.error('❌ 오류: GOOGLE_APPLICATION_CREDENTIALS 또는 FIREBASE_PROJECT_ID 환경 변수가 필요합니다.');
  console.log('\n사용법:');
  console.log('  export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"');
  console.log('  node scripts/migrate-portal-members.js');
  console.log('\n또는:');
  console.log('  export FIREBASE_PROJECT_ID="your-project-id"');
  console.log('  node scripts/migrate-portal-members.js');
  process.exit(1);
}

// Firebase Admin 초기화
try {
  if (serviceAccountPath) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log(`✅ 서비스 계정 키로 초기화: ${serviceAccountPath}`);
  } else {
    // 프로젝트 ID만 있으면 기본 인증 사용 (gcloud CLI 또는 환경에서)
    // 주의: 이 방법은 gcloud CLI가 설정되어 있거나 Application Default Credentials가 필요합니다
    admin.initializeApp({
      projectId: projectId
    });
    console.log(`✅ 프로젝트 ID로 초기화: ${projectId}`);
    console.log('⚠️  주의: gcloud CLI 인증 또는 Application Default Credentials가 필요할 수 있습니다.');
  }
} catch (error) {
  console.error('❌ Firebase Admin 초기화 실패:', error.message);
  console.error('\n💡 해결 방법:');
  console.error('   1. 서비스 계정 키 파일 생성:');
  console.error('      Firebase Console → 프로젝트 설정 → 서비스 계정 → "새 비공개 키 생성"');
  console.error('   2. 환경 변수 설정:');
  console.error('      $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\path\\to\\serviceAccountKey.json"');
  process.exit(1);
}

const db = admin.firestore();

// 사용자 입력을 받기 위한 인터페이스
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function migratePortalMembers() {
  console.log('========================================');
  console.log('  Portal Members 마이그레이션');
  console.log('========================================');
  console.log('');

  const projectId = 'P1'; // P1만 마이그레이션 (하드코딩)
  console.log(`📋 대상 프로젝트: ${projectId} (하드코딩)`);
  console.log('⚠️  주의: 이 스크립트는 P1 프로젝트만 마이그레이션합니다.');
  console.log('');

  try {
    // 1. 기존 portal_members 컬렉션 읽기
    console.log('[1/4] 기존 portal_members 데이터 읽기 중...');
    const portalMembersSnapshot = await db.collection('portal_members').get();
    
    if (portalMembersSnapshot.empty) {
      console.log('✅ 기존 portal_members 데이터가 없습니다. 마이그레이션할 데이터가 없습니다.');
      rl.close();
      return;
    }

    console.log(`   발견된 문서 수: ${portalMembersSnapshot.size}개`);
    console.log('');

    // 2. 마이그레이션 대상 확인
    console.log('[2/4] 마이그레이션 대상 확인 중...');
    const toMigrate = [];
    for (const doc of portalMembersSnapshot.docs) {
      const uid = doc.id;
      const data = doc.data();
      
      // 이미 새 경로에 데이터가 있는지 확인
      const newDocRef = db.collection('projects').doc(projectId)
        .collection('portal_members').doc(uid);
      const newDoc = await newDocRef.get();
      
      if (newDoc.exists) {
        console.log(`   ⚠️  ${uid}: 이미 새 경로에 존재 (건너뜀)`);
      } else {
        toMigrate.push({ uid, data });
        console.log(`   ✅ ${uid}: 마이그레이션 대상`);
      }
    }
    console.log('');

    if (toMigrate.length === 0) {
      console.log('✅ 모든 데이터가 이미 마이그레이션되었습니다.');
      rl.close();
      return;
    }

    // 3. 사용자 확인
    console.log('[3/4] 마이그레이션 확인');
    console.log(`   마이그레이션할 문서 수: ${toMigrate.length}개`);
    console.log('');
    const answer = await question('마이그레이션을 진행하시겠습니까? (yes/no): ');
    
    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('❌ 마이그레이션이 취소되었습니다.');
      rl.close();
      return;
    }
    console.log('');

    // 4. 마이그레이션 실행
    console.log('[4/4] 마이그레이션 실행 중...');
    let successCount = 0;
    let failCount = 0;

    for (const { uid, data } of toMigrate) {
      try {
        await db.collection('projects').doc(projectId)
          .collection('portal_members').doc(uid).set(data);
        console.log(`   ✅ ${uid}: 마이그레이션 완료`);
        successCount++;
      } catch (error) {
        console.error(`   ❌ ${uid}: 마이그레이션 실패 - ${error.message}`);
        failCount++;
      }
    }
    console.log('');

    // 5. 결과 요약
    console.log('========================================');
    console.log('  마이그레이션 완료');
    console.log('========================================');
    console.log(`   성공: ${successCount}개`);
    console.log(`   실패: ${failCount}개`);
    console.log('');

    // 6. 기존 데이터 삭제 여부 확인
    if (successCount > 0) {
      console.log('⚠️  기존 /portal_members 데이터 삭제');
      console.log('   마이그레이션이 완료되었으므로 기존 데이터를 삭제할 수 있습니다.');
      const deleteAnswer = await question('기존 /portal_members 데이터를 삭제하시겠습니까? (yes/no): ');
      
      if (deleteAnswer.toLowerCase() === 'yes' || deleteAnswer.toLowerCase() === 'y') {
        console.log('');
        console.log('기존 데이터 삭제 중...');
        for (const doc of portalMembersSnapshot.docs) {
          try {
            await doc.ref.delete();
            console.log(`   ✅ ${doc.id}: 삭제 완료`);
          } catch (error) {
            console.error(`   ❌ ${doc.id}: 삭제 실패 - ${error.message}`);
          }
        }
        console.log('');
        console.log('✅ 기존 데이터 삭제 완료');
      } else {
        console.log('⚠️  기존 데이터는 유지됩니다. Firestore Rules에서 읽기 차단하세요.');
      }
    }

    console.log('');
    console.log('✅ 마이그레이션 프로세스 완료!');
    console.log('');
    console.log('다음 단계:');
    console.log('  1. Firestore Rules 배포 (기존 /portal_members 경로 차단)');
    console.log('  2. 페이지 새로고침하여 정상 동작 확인');

  } catch (error) {
    console.error('❌ 마이그레이션 중 오류 발생:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// 실행
migratePortalMembers()
  .then(() => {
    console.log('');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 치명적 오류:', error);
    process.exit(1);
  });
