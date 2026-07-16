// firebaseClient.js
// 완전한 정상 작동 버전 (Phaser + Vite + Firebase Web SDK)

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

// ------------------------------
// 🔥 Firebase 초기화
// ------------------------------
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_WEB_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firestore 인스턴스
export const db = getFirestore(app);

// ------------------------------
// 🔥 맵 로딩
// ------------------------------
export async function loadMap(mapId) {
    try {
        const ref = doc(db, "maps", mapId);
        const snapshot = await getDoc(ref);
        return snapshot.exists() ? snapshot.data() : null;
    } catch (err) {
        console.error("loadMap error:", err);
        return null;
    }
}

// ------------------------------
// 🔥 몬스터 로딩 (지역별)
// ------------------------------
export async function loadMonstersByArea(areaId) {
    try {
        const col = collection(db, "monsters");
        const q = query(col, where("area", "==", areaId));
        const snapshot = await getDocs(q);

        const monsters = [];
        snapshot.forEach(doc => monsters.push(doc.data()));
        return monsters;
    } catch (err) {
        console.error("loadMonstersByArea error:", err);
        return [];
    }
}

// ------------------------------
// 🔥 NPC 로딩
// ------------------------------
export async function loadNPCs(areaId) {
    try {
        const col = collection(db, "npcs");
        const q = query(col, where("area", "==", areaId));
        const snapshot = await getDocs(q);

        const npcs = [];
        snapshot.forEach(doc => npcs.push(doc.data()));
        return npcs;
    } catch (err) {
        console.error("loadNPCs error:", err);
        return [];
    }
}

// ------------------------------
// 🔥 퀘스트 로딩
// ------------------------------
export async function loadQuests(areaId) {
    try {
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
    } catch (err) {
        console.error("loadQuests error:", err);
        return [];
    }
}

// ------------------------------
// 🔥 보스 로딩
// ------------------------------
export async function loadBoss(areaId) {
    try {
        const ref = doc(db, "bosses", areaId);
        const snapshot = await getDoc(ref);
        return snapshot.exists() ? snapshot.data() : null;
    } catch (err) {
        console.error("loadBoss error:", err);
        return null;
    }
}

// ------------------------------
// 🔥 플레이어 데이터 로딩
// ------------------------------
export async function loadPlayerData(playerId) {
    try {
        const ref = doc(db, "players", playerId);
        const snapshot = await getDoc(ref);
        return snapshot.exists() ? snapshot.data() : null;
    } catch (err) {
        console.error("loadPlayerData error:", err);
        return null;
    }
}

// ------------------------------
// 🔥 플레이어 데이터 저장
// ------------------------------
export async function savePlayerData(playerId, data) {
    try {
        const ref = doc(db, "players", playerId);
        await setDoc(ref, data, { merge: true });
        return true;
    } catch (err) {
        console.error("savePlayerData error:", err);
        return false;
    }
}
