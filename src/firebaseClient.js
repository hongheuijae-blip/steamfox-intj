import { initializeApp } from "firebase/app";
import {
    getFirestore,
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_WEB_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// 단일 맵 로딩 (overworld, dungeon 등)
export async function loadMap(mapId) {
    const ref = doc(db, "maps", mapId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return snapshot.data();
}

// 모든 몬스터 로딩
export async function loadAllMonsters() {
    const col = collection(db, "monsters");
    const snapshot = await getDocs(col);
    const monsters = [];
    snapshot.forEach(doc => monsters.push(doc.data()));
    return monsters;
}

// 특정 지역(overworld/dungeon) 몬스터 로딩
export async function loadMonstersByArea(areaId) {
    const col = collection(db, "monsters");
    const q = query(col, where("area", "==", areaId));
    const snapshot = await getDocs(q);
    const monsters = [];
    snapshot.forEach(doc => monsters.push(doc.data()));
    return monsters;
}

// 특정 지역 NPC 로딩
export async function loadNPCs(areaId) {
    const col = collection(db, "npcs");
    const q = query(col, where("area", "==", areaId));
    const snapshot = await getDocs(q);
    const npcs = [];
    snapshot.forEach(doc => npcs.push(doc.data()));
    return npcs;
}
