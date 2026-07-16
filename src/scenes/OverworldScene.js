export default class OverworldScene extends Phaser.Scene {
    constructor() {
        super("OverworldScene");
    }

    init(data) {
        // BootScene에서 전달된 Firestore 몬스터 데이터
        this.monsterData = data.monsterData || null;
    }

    create() {
        // 기본 배경 색
        this.cameras.main.setBackgroundColor("#2b2b2b");

        // 🔥 Firestore에서 로딩된 몬스터 스폰
        if (this.monsterData) {
            this.monster = this.physics.add.sprite(
                500, 300, "monsterImage"
            );
            this.monster.setScale(2);

            // 몬스터 정보 표시
            this.add.text(
                20, 20,
                `${this.monsterData.name}\nHP: ${this.monsterData.hp}\nATK: ${this.monsterData.attack}`,
                { fontSize: "20px", color: "#ffffff" }
            );
        }

        // 플레이어 생성
        this.player = this.physics.add.sprite(400, 300, "fox_idle");
        this.player.setScale(1.5);
        this.player.setCollideWorldBounds(true);

        // 방향키 입력
        this.cursors = this.input.keyboard.createCursorKeys();

        // 이동 속도
        this.moveSpeed = 200;

        // 화면 중앙 카메라
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }

    update() {
        const speed = this.moveSpeed;

        // 매 프레임마다 속도 초기화
        this.player.setVelocity(0);

        // 좌우 이동
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
        }

        // 상하 이동
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
        }
    }
}
