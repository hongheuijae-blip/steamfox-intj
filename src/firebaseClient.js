import { initializeApp } from "firebase/app";
import {
    getFirestore,
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where,
    setDoc
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

// 맵 로딩 (오버월드/던전)
export async function loadMap(mapId) {
    const ref = doc(db, "maps", mapId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return snapshot.data();
}

// 특정 지역 몬스터 로딩
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

// 특정 지역 퀘스트 로딩
export async function loadQuests(areaId) {
    const col = collection(db, "quests");
    const q = query(col, where("area", "==", areaId));
    const snapshot = await getDocs(q);
    const quests = [];
    snapshot.forEach(doc => {
        quests.push({
            id: doc.id,
            ...doc.data()
        });
    });
    return quests;
}

// 보스 데이터 로딩
export async function loadBoss(areaId) {
    const ref = doc(db, "bosses", areaId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return snapshot.data();
}

// 플레이어 데이터 로딩
export async function loadPlayerData(playerId) {
    const ref = doc(db, "players", playerId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return snapshot.data();
}

// 플레이어 데이터 저장 (세이브)
export async function savePlayerData(playerId, data) {
    const ref = doc(db, "players", playerId);
    await setDoc(ref, data, { merge: true });
}
