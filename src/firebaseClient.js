// Firebase Web SDK
import { initializeApp } from "firebase/app";
import {
    getFirestore,
    doc,
    getDoc,
    collection,
    getDocs
} from "firebase/firestore";

// 🔥 클라이언트용 Firebase 설정 (환경변수 사용)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_WEB_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * 🔹 단일 몬스터 로딩
 */
export async function loadMonster(monsterId) {
    const ref = doc(db, "monsters", monsterId);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) return null;
    return snapshot.data();
}

/**
 * 🔹 모든 몬스터 로딩
 */
export async function loadAllMonsters() {
    const col = collection(db, "monsters");
    const snapshot = await getDocs(col);

    const monsters = [];
    snapshot.forEach(doc => monsters.push(doc.data()));
    return monsters;
}

/**
 * 🔹 맵 데이터 로딩
 */
export async function loadMap(mapId) {
    const ref = doc(db, "maps", mapId);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) return null;
    return snapshot.data();
}
