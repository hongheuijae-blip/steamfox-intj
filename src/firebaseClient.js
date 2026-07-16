// Firebase Web SDK
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// 🔥 클라이언트용 Firebase 설정 (Web SDK)
const firebaseConfig = {
    apiKey: process.env.FIREBASE_WEB_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Firestore에서 몬스터 데이터 로드
 */
export async function loadMonster(monsterId) {
    const ref = doc(db, "monsters", monsterId);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
        console.warn("⚠️ 몬스터 데이터 없음:", monsterId);
        return null;
    }

    return snapshot.data();
}
