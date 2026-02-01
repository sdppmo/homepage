#!/usr/bin/env python3
"""
Portal Members 마이그레이션 스크립트 (Python)

기존: /portal_members/{uid}
새로운: /projects/P1/portal_members/{uid}

사용법:
    python scripts/migrate-portal-members.py

환경 변수:
    GOOGLE_APPLICATION_CREDENTIALS: Firebase Admin SDK 서비스 계정 키 경로
    또는 FIREBASE_PROJECT_ID: Firebase 프로젝트 ID
"""

import os
import sys
from firebase_admin import credentials, firestore, initialize_app

def migrate_portal_members():
    print("=" * 40)
    print("  Portal Members 마이그레이션")
    print("=" * 40)
    print()

    project_id = "P1"  # P1만 마이그레이션 (하드코딩)
    print(f"📋 대상 프로젝트: {project_id} (하드코딩)")
    print("⚠️  주의: 이 스크립트는 P1 프로젝트만 마이그레이션합니다.")
    print()

    # Firebase Admin 초기화
    try:
        service_account_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        firebase_project_id = os.environ.get("FIREBASE_PROJECT_ID")

        if service_account_path:
            cred = credentials.Certificate(service_account_path)
            initialize_app(cred)
        elif firebase_project_id:
            initialize_app(options={"projectId": firebase_project_id})
        else:
            print("❌ 오류: GOOGLE_APPLICATION_CREDENTIALS 또는 FIREBASE_PROJECT_ID 환경 변수가 필요합니다.")
            print()
            print("사용법:")
            print("  export GOOGLE_APPLICATION_CREDENTIALS=\"/path/to/serviceAccountKey.json\"")
            print("  python scripts/migrate-portal-members.py")
            print()
            print("또는:")
            print("  export FIREBASE_PROJECT_ID=\"your-project-id\"")
            print("  python scripts/migrate-portal-members.py")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Firebase Admin 초기화 실패: {e}")
        sys.exit(1)

    db = firestore.client()

    try:
        # 1. 기존 portal_members 컬렉션 읽기
        print("[1/4] 기존 portal_members 데이터 읽기 중...")
        portal_members_ref = db.collection("portal_members")
        portal_members_docs = portal_members_ref.stream()

        portal_members_list = list(portal_members_docs)
        if not portal_members_list:
            print("✅ 기존 portal_members 데이터가 없습니다. 마이그레이션할 데이터가 없습니다.")
            return

        print(f"   발견된 문서 수: {len(portal_members_list)}개")
        print()

        # 2. 마이그레이션 대상 확인
        print("[2/4] 마이그레이션 대상 확인 중...")
        to_migrate = []
        for doc in portal_members_list:
            uid = doc.id
            data = doc.to_dict()

            # 이미 새 경로에 데이터가 있는지 확인
            new_doc_ref = (
                db.collection("projects")
                .document(project_id)
                .collection("portal_members")
                .document(uid)
            )
            new_doc = new_doc_ref.get()

            if new_doc.exists:
                print(f"   ⚠️  {uid}: 이미 새 경로에 존재 (건너뜀)")
            else:
                to_migrate.append({"uid": uid, "data": data})
                print(f"   ✅ {uid}: 마이그레이션 대상")
        print()

        if not to_migrate:
            print("✅ 모든 데이터가 이미 마이그레이션되었습니다.")
            return

        # 3. 사용자 확인
        print("[3/4] 마이그레이션 확인")
        print(f"   마이그레이션할 문서 수: {len(to_migrate)}개")
        print()
        answer = input("마이그레이션을 진행하시겠습니까? (yes/no): ")

        if answer.lower() not in ["yes", "y"]:
            print("❌ 마이그레이션이 취소되었습니다.")
            return
        print()

        # 4. 마이그레이션 실행
        print("[4/4] 마이그레이션 실행 중...")
        success_count = 0
        fail_count = 0

        for item in to_migrate:
            uid = item["uid"]
            data = item["data"]
            try:
                (
                    db.collection("projects")
                    .document(project_id)
                    .collection("portal_members")
                    .document(uid)
                    .set(data)
                )
                print(f"   ✅ {uid}: 마이그레이션 완료")
                success_count += 1
            except Exception as e:
                print(f"   ❌ {uid}: 마이그레이션 실패 - {e}")
                fail_count += 1
        print()

        # 5. 결과 요약
        print("=" * 40)
        print("  마이그레이션 완료")
        print("=" * 40)
        print(f"   성공: {success_count}개")
        print(f"   실패: {fail_count}개")
        print()

        # 6. 기존 데이터 삭제 여부 확인
        if success_count > 0:
            print("⚠️  기존 /portal_members 데이터 삭제")
            print("   마이그레이션이 완료되었으므로 기존 데이터를 삭제할 수 있습니다.")
            delete_answer = input("기존 /portal_members 데이터를 삭제하시겠습니까? (yes/no): ")

            if delete_answer.lower() in ["yes", "y"]:
                print()
                print("기존 데이터 삭제 중...")
                for doc in portal_members_list:
                    try:
                        doc.reference.delete()
                        print(f"   ✅ {doc.id}: 삭제 완료")
                    except Exception as e:
                        print(f"   ❌ {doc.id}: 삭제 실패 - {e}")
                print()
                print("✅ 기존 데이터 삭제 완료")
            else:
                print("⚠️  기존 데이터는 유지됩니다. Firestore Rules에서 읽기 차단하세요.")

        print()
        print("✅ 마이그레이션 프로세스 완료!")
        print()
        print("다음 단계:")
        print("  1. Firestore Rules 배포 (기존 /portal_members 경로 차단)")
        print("  2. 페이지 새로고침하여 정상 동작 확인")

    except Exception as e:
        print(f"❌ 마이그레이션 중 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    migrate_portal_members()
