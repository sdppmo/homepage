// ============================================================
// Firebase v9 Modular SDK - Admin Role Management
// user_roles/{uid} 구조 사용
// ============================================================

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";

// Firebase 초기화 (이미 초기화되어 있다면 제거)
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);

// ============================================================
// 1. Admin 판별 함수
// ============================================================

/**
 * 현재 로그인한 사용자가 Admin인지 확인
 * @returns {Promise<boolean>} Admin 여부
 */
export async function isAdmin() {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log("❌ 로그인되지 않았습니다.");
      return false;
    }
    
    const db = getFirestore();
    const userRoleRef = doc(db, "user_roles", user.uid);
    const userRoleSnap = await getDoc(userRoleRef);
    
    if (!userRoleSnap.exists()) {
      console.log("❌ user_roles 문서가 없습니다.");
      return false;
    }
    
    const userRoleData = userRoleSnap.data();
    const isAdminUser = userRoleData.role === "admin";
    
    console.log(isAdminUser ? "✅ Admin입니다." : "❌ Admin이 아닙니다.");
    return isAdminUser;
  } catch (error) {
    console.error("❌ Admin 판별 오류:", error);
    return false;
  }
}

/**
 * 특정 UID가 Admin인지 확인
 * @param {string} uid - 확인할 사용자 UID
 * @returns {Promise<boolean>} Admin 여부
 */
export async function isAdminByUID(uid) {
  try {
    const db = getFirestore();
    const userRoleRef = doc(db, "user_roles", uid);
    const userRoleSnap = await getDoc(userRoleRef);
    
    if (!userRoleSnap.exists()) {
      return false;
    }
    
    const userRoleData = userRoleSnap.data();
    return userRoleData.role === "admin";
  } catch (error) {
    console.error("❌ Admin 판별 오류:", error);
    return false;
  }
}

// ============================================================
// 2. Admin 지정 함수
// ============================================================

/**
 * 특정 UID에 Admin role 부여 (현재 사용자가 Admin인 경우만)
 * @param {string} targetUID - Admin role을 부여할 사용자 UID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function grantAdminRole(targetUID) {
  try {
    // 1. 현재 사용자가 Admin인지 확인
    const currentUserIsAdmin = await isAdmin();
    if (!currentUserIsAdmin) {
      return {
        success: false,
        message: "❌ Admin 권한이 없습니다. Admin만 다른 사용자에게 Admin role을 부여할 수 있습니다."
      };
    }
    
    // 2. 대상 UID 확인
    if (!targetUID || typeof targetUID !== "string") {
      return {
        success: false,
        message: "❌ 유효하지 않은 UID입니다."
      };
    }
    
    // 3. Firestore에 Admin role 부여
    const db = getFirestore();
    const userRoleRef = doc(db, "user_roles", targetUID);
    
    // 문서가 있으면 업데이트, 없으면 생성
    const userRoleSnap = await getDoc(userRoleRef);
    if (userRoleSnap.exists()) {
      await updateDoc(userRoleRef, {
        role: "admin",
        updatedAt: new Date()
      });
    } else {
      await setDoc(userRoleRef, {
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    console.log(`✅ Admin role 부여 완료: ${targetUID}`);
    return {
      success: true,
      message: `✅ ${targetUID}에게 Admin role을 부여했습니다.`
    };
  } catch (error) {
    console.error("❌ Admin role 부여 오류:", error);
    return {
      success: false,
      message: `❌ 오류: ${error.message}`
    };
  }
}

/**
 * 특정 UID의 Admin role 제거 (현재 사용자가 Admin인 경우만)
 * @param {string} targetUID - Admin role을 제거할 사용자 UID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function revokeAdminRole(targetUID) {
  try {
    // 1. 현재 사용자가 Admin인지 확인
    const currentUserIsAdmin = await isAdmin();
    if (!currentUserIsAdmin) {
      return {
        success: false,
        message: "❌ Admin 권한이 없습니다."
      };
    }
    
    // 2. 자기 자신의 Admin role 제거 방지
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === targetUID) {
      return {
        success: false,
        message: "❌ 자신의 Admin role은 제거할 수 없습니다."
      };
    }
    
    // 3. Firestore에서 role을 "user"로 변경 (또는 삭제)
    const db = getFirestore();
    const userRoleRef = doc(db, "user_roles", targetUID);
    
    await updateDoc(userRoleRef, {
      role: "user",
      updatedAt: new Date()
    });
    
    console.log(`✅ Admin role 제거 완료: ${targetUID}`);
    return {
      success: true,
      message: `✅ ${targetUID}의 Admin role을 제거했습니다.`
    };
  } catch (error) {
    console.error("❌ Admin role 제거 오류:", error);
    return {
      success: false,
      message: `❌ 오류: ${error.message}`
    };
  }
}

// ============================================================
// 3. Auth State 리스너로 Admin Panel UI 제어
// ============================================================

/**
 * Auth State 변경 시 Admin Panel UI 제어
 */
export function setupAdminPanelControl() {
  const auth = getAuth();
  
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userIsAdmin = await isAdmin();
      toggleAdminPanel(userIsAdmin);
    } else {
      toggleAdminPanel(false);
    }
  });
}

/**
 * Admin Panel UI 표시/숨김 제어
 * @param {boolean} isAdmin - Admin 여부
 */
function toggleAdminPanel(isAdmin) {
  const adminPanel = document.getElementById("adminPanel");
  const adminOnlyElements = document.querySelectorAll(".admin-only");
  
  if (adminPanel) {
    adminPanel.style.display = isAdmin ? "block" : "none";
  }
  
  adminOnlyElements.forEach((element) => {
    element.style.display = isAdmin ? "" : "none";
  });
  
  console.log(isAdmin ? "✅ Admin Panel 표시" : "❌ Admin Panel 숨김");
}

// ============================================================
// 4. 사용 예시
// ============================================================

/*
// 페이지 로드 시 Admin Panel 제어
setupAdminPanelControl();

// Admin 여부 확인
const checkAdmin = async () => {
  const adminStatus = await isAdmin();
  console.log("Admin 여부:", adminStatus);
};

// 다른 사용자에게 Admin role 부여
const grantAdmin = async () => {
  const targetUID = "user-uid-here";
  const result = await grantAdminRole(targetUID);
  console.log(result.message);
};
*/
