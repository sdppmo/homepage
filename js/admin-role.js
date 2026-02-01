// ===== Admin role 관리 (Firebase v9 Modular SDK) =====
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase.js";

let currentUserRole = null;

// 내 role 불러오기 (에러 처리 포함)
async function loadMyRole(uid) {
  try {
    const ref = doc(db, "user_roles", uid);
    const snap = await getDoc(ref);
    
    if (!snap.exists()) {
      console.log("ℹ️ user_roles 문서가 없습니다:", uid);
      return null;
    }
    
    const role = snap.data().role;
    console.log("✅ Role 로드 성공:", role);
    return role;
  } catch (error) {
    console.error("❌ Role 로드 오류:", error);
    // 권한 오류인 경우 null 반환
    if (error.code === "permission-denied") {
      console.warn("⚠️ 권한 오류: user_roles 문서를 읽을 수 없습니다.");
      return null;
    }
    throw error;
  }
}

// Admin role 설정 (Rules에서 admin만 허용되어야 함)
async function setAdminRoleInFirestore(targetUid) {
  try {
    const ref = doc(db, "user_roles", targetUid);
    await setDoc(
      ref,
      { role: "admin", updatedAt: serverTimestamp() },
      { merge: true }
    );
    console.log("✅ Admin role set:", targetUid);
  } catch (error) {
    console.error("❌ Admin role 설정 오류:", error);
    
    // 권한 오류인 경우 명확한 메시지
    if (error.code === "permission-denied") {
      throw new Error("권한이 없습니다. Admin만 다른 사용자에게 Admin role을 부여할 수 있습니다.");
    }
    
    throw error;
  }
}

// 로그인 상태 변경 시 role 확인
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.log("❌ 로그인 안됨");
    currentUserRole = null;
    
    // admin UI 숨김
    const adminPanel = document.getElementById("adminPanel");
    if (adminPanel) {
      adminPanel.style.display = "none";
    }
    return;
  }

  try {
    currentUserRole = await loadMyRole(user.uid);
    console.log("👤 currentUserRole =", currentUserRole);

    // admin UI 표시/숨김
    const adminPanel = document.getElementById("adminPanel");
    if (adminPanel) {
      adminPanel.style.display = currentUserRole === "admin" ? "block" : "none";
    }
  } catch (error) {
    console.error("❌ Role 확인 중 오류:", error);
    currentUserRole = null;
    
    // 오류 발생 시 UI 숨김
    const adminPanel = document.getElementById("adminPanel");
    if (adminPanel) {
      adminPanel.style.display = "none";
    }
  }
});

// Admin 지정 버튼 이벤트 리스너 (DOM 로드 후 등록)
function setupAdminButton() {
  const btn = document.getElementById("setAdminBtn");
  if (!btn) {
    console.warn("⚠️ setAdminBtn 버튼을 찾을 수 없습니다.");
    return;
  }

  // 기존 리스너 제거 (중복 방지)
  btn.replaceWith(btn.cloneNode(true));
  const newBtn = document.getElementById("setAdminBtn");

  newBtn.addEventListener("click", async () => {
    // 🔒 가드: admin이 아니면 실행 차단
    if (currentUserRole !== "admin") {
      alert("관리자만 실행할 수 있습니다.");
      return;
    }

    const targetUid = document.getElementById("adminUidInput")?.value?.trim();
    if (!targetUid) {
      alert("UID를 입력하세요.");
      return;
    }

    // 버튼 비활성화 (중복 클릭 방지)
    newBtn.disabled = true;
    newBtn.textContent = "처리 중...";

    try {
      await setAdminRoleInFirestore(targetUid);
      alert("✅ Admin 지정 완료");
      // 입력 필드 초기화
      const input = document.getElementById("adminUidInput");
      if (input) {
        input.value = "";
      }
    } catch (error) {
      console.error("❌ Admin role 설정 오류:", error);
      alert("❌ 오류: " + error.message);
    } finally {
      // 버튼 활성화
      newBtn.disabled = false;
      newBtn.textContent = "Admin 지정";
    }
  });
}

// DOM 로드 후 버튼 설정
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupAdminButton);
} else {
  setupAdminButton();
}

// Export functions for external use
export { loadMyRole, setAdminRoleInFirestore, currentUserRole };
