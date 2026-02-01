// ============================================================
// Firebase v9 Modular SDK 초기화
// ============================================================

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase Config (firebase-config.js에서 가져오거나 직접 설정)
const firebaseConfig = {
  apiKey: "AIzaSyDIuTX7eQVscRl5GJxtKVWHeF7MCfCbFPc",
  authDomain: "hakdong-a80b8.firebaseapp.com",
  projectId: "hakdong-a80b8",
  storageBucket: "hakdong-a80b8.firebasestorage.app",
  messagingSenderId: "578179103785",
  appId: "1:578179103785:web:b8daecb0ac24924e30b038",
  measurementId: "G-E5G02CLNQK"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Auth 인스턴스
export const auth = getAuth(app);

// Firestore 인스턴스
export const db = getFirestore(app);

// Auth State 변경 리스너 (페이지 로드 시 즉시 UID 출력)
auth.onAuthStateChanged((user) => {
  console.log("current uid =", user?.uid);
});
