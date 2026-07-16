import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

// 🔐 Firebase 서비스 계정 로드
// firebase-service-account.json은 .gitignore로 보호됨
const serviceAccount = JSON.parse(
    fs.readFileSync("firebase-service-account.json", "utf8")
);

// 🔥 Firebase Admin 초기화
initializeApp({
    credential: cert(serviceAccount)
});

// 📘 Firestore 인스턴스
const db = getFirestore();

/**
 * Firestore에 문서를 저장하는 함수
 * @param {string} collectionName - 저장할 컬렉션 이름
 * @param {string} docId - 문서 ID
 * @param {object} data - 저장할 데이터
 */
export async function saveToFirestore(collectionName, docId, data) {
    try {
        await db.collection(collectionName).doc(docId).set(data);
        console.log(`🔥 Firestore 저장 완료: ${collectionName}/${docId}`);
    } catch (error) {
        console.error("❌ Firestore 저장 실패:", error);
    }
}

/**
 * Firestore에서 문서를 불러오는 함수
 * @param {string} collectionName - 컬렉션 이름
 * @param {string} docId - 문서 ID
 */
export async function loadFromFirestore(collectionName, docId) {
    try {
        const doc = await db.collection(collectionName).doc(docId).get();
        if (!doc.exists) {
            console.log("⚠️ 문서가 존재하지 않습니다.");
            return null;
        }
        console.log(`📥 Firestore 로드 완료: ${collectionName}/${docId}`);
        return doc.data();
    } catch (error) {
        console.error("❌ Firestore 로드 실패:", error);
        return null;
    }
}
