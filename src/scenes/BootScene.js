import { loadAllMonsters } from "../firebaseClient.js";

export default class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");
    }

    async preload() {
        const loadingText = this.add.text(400, 300, "Loading...", {
            fontSize: "24px",
            color: "#ffffff"
        }).setOrigin(0.5);

        // 플레이어 기본 이미지
        this.load.image("fox_idle", "https://dummyimage.com/64x64/ffffff/000000&text=Fox");

        // 🔥 Firestore에서 모든 몬스터 로딩
        const monsters = await loadAllMonsters();
        this.monsters = monsters;

        // 🔥 Drive 이미지 여러 개 자동 로딩
        monsters.forEach((m, index) => {
            this.load.image(`monster_${index}`, m.imageUrl);
        });
    }

    create() {
        this.scene.start("OverworldScene", {
            monsters: this.monsters
        });
    }
}
