import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { uploadToDrive } from "./drive.js";
import { saveToFirestore } from "./firestore.js";

/**
 * Claude API 클라이언트 생성
 */
const client = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY
});

/**
 * 1) Claude로 게임 데이터 자동 생성
 */
async function generateGameDataWithClaude() {
    console.log("🤖 Claude에게 게임 데이터 생성 요청 중...");

    const prompt = `
당신은 스팀펑크 ARPG 게임의 데이터 생성 엔진입니다.
다음 형식으로 몬스터 데이터를 생성하세요:

{
  "name": "",
  "type": "",
  "hp": 숫자,
  "attack": 숫자,
  "description": "",
  "tags": ["", ""]
}

조건:
- 세계관은 스팀펑크 + INTJ 여우 탐구자
- 몬스터는 기계/증기 기반
- 설명은 1~2문장
`;

    const response = await client.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 300,
        messages: [
            { role: "user", content: prompt }
        ]
    });

    const text = response.content[0].text;
    const json = JSON.parse(text);

    const monsterId = "monster_" + Date.now();

    return {
        id: monsterId,
        ...json,
        createdAt: new Date().toISOString()
    };
}

/**
 * 2) Claude로 이미지 프롬프트 생성
 */
async function generateImagePrompt(name, description) {
    console.log("🎨 Claude에게 이미지 프롬프트 생성 요청 중...");

    const prompt = `
당신은 스팀펑크 ARPG 게임의 이미지 프롬프트 생성 엔진입니다.
다음 몬스터를 위한 이미지 프롬프트를 생성하세요:

몬스터 이름: ${name}
설명: ${description}

출력 형식:
"prompt": "이미지 프롬프트 내용"
`;

    const response = await client.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 200,
        messages: [
            { role: "user", content: prompt }
        ]
    });

    const text = response.content[0].text;
    const json = JSON.parse(text);

    return json.prompt;
}

/**
 * 3) 테스트용 PNG 생성 (나중에 AI 이미지 생성으로 교체)
 */
function generateTestImage(monsterId) {
    const outputPath = path.join(process.cwd(), "images", `${monsterId}.png`);

    const pngBuffer = Buffer.from(
        "89504E470D0A1A0A0000000D4948445200000040000000400806000000AA6971DE0000000A49444154789C6360F8CF80010005FE02FEA7D60000000049454E44AE426082",
        "hex"
    );

    fs.writeFileSync(outputPath, pngBuffer);
    return outputPath;
}

/**
 * 4) 전체 자동 생성 파이프라인 실행
 */
async function runPipeline() {
    console.log("🚀 Claude 기반 자동 생성 파이프라인 시작");

    // 1) Claude로 게임 데이터 생성
    const data = await generateGameDataWithClaude();
    console.log("🧬 생성된 몬스터 데이터:", data);

    // 2) Claude로 이미지 프롬프트 생성
    const imagePrompt = await generateImagePrompt(data.name, data.description);
    console.log("🎨 생성된 이미지 프롬프트:", imagePrompt);

    // 3) 테스트 이미지 생성
    const imagePath = generateTestImage(data.id);
    console.log("🖼️ 이미지 생성:", imagePath);

    // 4) Google Drive 업로드
    const buffer = fs.readFileSync(imagePath);
    const driveId = await uploadToDrive(buffer, `${data.id}.png`, "image/png");

    // 5) Firestore 저장
    const finalData = {
        ...data,
        imagePrompt,
        imageDriveId: driveId,
        imageUrl: `https://drive.google.com/uc?id=${driveId}`
    };

    await saveToFirestore("monsters", data.id, finalData);

    // 6) Phaser용 JSON 생성
    const outputJson = path.join(process.cwd(), "generated_monsters.json");
    fs.writeFileSync(outputJson, JSON.stringify(finalData, null, 2));

    console.log("🎉 Claude 기반 자동 생성 파이프라인 완료!");
    console.log("📄 결과 JSON:", outputJson);
}

runPipeline();
