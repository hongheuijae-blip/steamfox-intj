import fs from "fs";
import path from "path";
import { saveToFirestore } from "./firestore.js";
import { uploadToDrive } from "./drive.js";

/**
 * 1) AI로 게임 데이터 자동 생성 (몬스터, 무기, 지역 등)
 * 지금은 테스트용 더미 데이터 → 나중에 Claude API 연결
 */
function generateGameData() {
    const monsterId = "monster_" + Date.now();

    const data = {
        id: monsterId,
        name: "Steam Fox Golem",
        type: "mechanical",
        hp: Math.floor(Math.random() * 200 + 100),
        attack: Math.floor(Math.random() * 40 + 10),
        description: "스팀펑크 코어로 움직이는 여우형 골렘.",
        createdAt: new Date().toISOString()
    };

    return data;
}

/**
 * 2) 이미지 프롬프트 자동 생성 (나중에 AI 이미지 생성 연결)
 * 지금은 테스트용 PNG 생성
 */
function generateTestImage(monsterId) {
    const outputPath = path.join(process.cwd(), "images", `${monsterId}.png`);

    // 64x64 흰색 PNG 더미 생성
    const pngBuffer = Buffer.from(
        "89504E470D0A1A0A0000000D4948445200000040000000400806000000AA6971DE0000000A49444154789C6360F8CF80010005FE02FEA7D60000000049454E44AE426082",
        "hex"
    );

    fs.writeFileSync(outputPath, pngBuffer);
    return outputPath;
}

/**
 * 3) 전체 자동 생성 파이프라인 실행
 */
async function runPipeline() {
    console.log("🚀 자동 생성 파이프라인 시작");

    // 1) 게임 데이터 생성
    const data = generateGameData();
    console.log("🧬 데이터 생성:", data);

    // 2) 테스트 이미지 생성
    const imagePath = generateTestImage(data.id);
    console.log("🎨 이미지 생성:", imagePath);

    // 3) Google Drive 업로드
    const buffer = fs.readFileSync(imagePath);
    const driveId = await uploadToDrive(buffer, `${data.id}.png`, "image/png");

    // 4) Firestore 저장
    const finalData = {
        ...data,
        imageDriveId: driveId,
        imageUrl: `https://drive.google.com/uc?id=${driveId}`
    };

    await saveToFirestore("monsters", data.id, finalData);

    // 5) Phaser용 JSON 생성
    const outputJson = path.join(process.cwd(), "generated_monsters.json");
    fs.writeFileSync(outputJson, JSON.stringify(finalData, null, 2));

    console.log("🎉 자동 생성 파이프라인 완료!");
    console.log("📄 결과 JSON:", outputJson);
}

runPipeline();
