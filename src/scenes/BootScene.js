import { loadMonster } from "../firebaseClient.js";

export default class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");
    }

    async preload() {
        // 기본 로딩 텍스트
        const loadingText = this.add.text(400, 300, "Loading...", {
            fontSize: "24px",
            color: "#ffffff"
        }).setOrigin(0.5);

        // 🔧 기본 테스트용 이미지 (플레이어)
        this.load.image("fox_idle", "https://dummyimage.com/64x64/ffffff/000000&text=Fox");

        // 🔥 Firestore에서 자동 생성된 몬스터 데이터 로드
        const monsterId = "monster_latest"; // 나중에 generate.js에서 최신 ID 저장 가능
        const monsterData = await loadMonster(monsterId);

        if (!monsterData) {
            console.warn("⚠️ Firestore 몬스터 데이터 없음");
        } else {
            this.monsterData = monsterData;

            // 🔥 Drive 이미지 로딩
            this.load.image(
                "monsterImage",
                monsterData.imageUrl
            );
        }
    }

    create() {
        // OverworldScene으로 데이터 전달
        this.scene.start("OverworldScene", {
            monsterData: this.monsterData
        });
    }
}
