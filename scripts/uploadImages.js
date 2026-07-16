import fs from "fs";
import path from "path";
import mime from "mime-types";
import { uploadToDrive } from "./drive.js";
import { saveToFirestore } from "./firestore.js";

/**
 * /images 폴더 안의 PNG 파일을 자동 스캔하여
 * Google Drive 업로드 + Firestore 저장 + JSON 생성까지 처리
 */
async function processImages() {
    const imagesDir = path.join(process.cwd(), "images");

    if (!fs.existsSync(imagesDir)) {
        console.error("❌ images 폴더가 존재하지 않습니다.");
        return;
    }

    const files = fs.readdirSync(imagesDir).filter(file => file.endsWith(".png"));

    if (files.length === 0) {
        console.log("⚠️ 업로드할 PNG 파일이 없습니다.");
        return;
    }

    console.log(`📁 발견된 PNG 파일: ${files.length}개`);

    const results = {};

    for (const file of files) {
        const filePath = path.join(imagesDir, file);
        const buffer = fs.readFileSync(filePath);
        const mimeType = mime.lookup(file) || "image/png";

        console.log(`📤 업로드 중: ${file}`);

        try {
            // 1) Google Drive 업로드
            const driveId = await uploadToDrive(buffer, file, mimeType);

            // 2) Firestore 저장
            const docId = file.replace(".png", "");
            const data = {
                filename: file,
                driveId,
                driveUrl: `https://drive.google.com/uc?id=${driveId}`,
                uploadedAt: new Date().toISOString()
            };

            await saveToFirestore("images", docId, data);

            // 3) JSON 결과에 추가
            results[docId] = data;

        } catch (error) {
            console.error(`❌ 처리 실패: ${file}`, error);
        }
    }

    // 4) Phaser에서 로딩 가능한 JSON 생성
    const outputPath = path.join(process.cwd(), "images.json");
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

    console.log("🎉 이미지 자동 업로드 완료!");
    console.log(`📄 결과 JSON 생성: images.json`);
}

processImages();
