export default class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");
    }

    preload() {
        // 기본 로딩 텍스트
        const loadingText = this.add.text(400, 300, "Loading...", {
            fontSize: "24px",
            color: "#ffffff"
        });
        loadingText.setOrigin(0.5);

        // 🔧 기본 테스트용 이미지 (나중에 Firestore/Drive로 교체)
        this.load.image("fox_idle", "https://dummyimage.com/64x64/ffffff/000000&text=Fox");
    }

    create() {
        // BootScene → OverworldScene으로 이동
        this.scene.start("OverworldScene");
    }
}
