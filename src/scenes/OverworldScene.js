export default class OverworldScene extends Phaser.Scene {
    constructor() {
        super("OverworldScene");
    }

    create() {
        // 기본 배경 색
        this.cameras.main.setBackgroundColor("#2b2b2b");

        // 캐릭터 생성 (BootScene에서 로딩한 이미지 사용)
        this.player = this.physics.add.sprite(400, 300, "fox_idle");
        this.player.setScale(1.5); // 테스트용 확대
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
