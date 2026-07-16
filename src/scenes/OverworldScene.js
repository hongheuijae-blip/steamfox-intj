export default class OverworldScene extends Phaser.Scene {
    constructor() {
        super("OverworldScene");
    }

    init(data) {
        this.monsters = data.monsters || [];
    }

    create() {
        this.cameras.main.setBackgroundColor("#2b2b2b");

        // 🔥 여러 몬스터 자동 스폰
        this.monsterGroup = this.physics.add.group();

        this.monsters.forEach((m, index) => {
            const monster = this.monsterGroup.create(
                600 + index * 80,
                300,
                `monster_${index}`
            );

            monster.setScale(2);
            monster.setCollideWorldBounds(true);

            monster.hp = m.hp;
            monster.attack = m.attack;
            monster.lastAttackTime = 0;
        });

        // 플레이어 생성
        this.player = this.physics.add.sprite(400, 300, "fox_idle");
        this.player.setScale(1.5);
        this.player.setCollideWorldBounds(true);
        this.player.hp = 100;

        this.cursors = this.input.keyboard.createCursorKeys();
        this.moveSpeed = 200;

        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.hpText = this.add.text(20, 20, `HP: ${this.player.hp}`, {
            fontSize: "20px",
            color: "#ffffff"
        });
    }

    update(time) {
        this.handlePlayerMovement();
        this.handleMonsterAI(time);
    }

    handlePlayerMovement() {
        const speed = this.moveSpeed;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
        else if (this.cursors.right.isDown) this.player.setVelocityX(speed);

        if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
        else if (this.cursors.down.isDown) this.player.setVelocityY(speed);
    }

    handleMonsterAI(time) {
        const player = this.player;

        this.monsterGroup.children.iterate(monster => {
            if (!monster) return;

            const distance = Phaser.Math.Distance.Between(
                monster.x, monster.y,
                player.x, player.y
            );

            const chaseRange = 300;
            const attackRange = 60;

            // 추적
            if (distance < chaseRange && distance > attackRange) {
                const angle = Phaser.Math.Angle.Between(
                    monster.x, monster.y,
                    player.x, player.y
                );

                const speed = 100;

                monster.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
            } else {
                monster.setVelocity(0);
            }

            // 공격
            if (distance <= attackRange) {
                if (time > monster.lastAttackTime + 1000) {
                    monster.lastAttackTime = time;

                    player.hp -= monster.attack;
                    this.hpText.setText(`HP: ${player.hp}`);

                    this.cameras.main.shake(100, 0.005);

                    if (player.hp <= 0) {
                        player.setTint(0xff0000);
                        player.setVelocity(0);
                    }
                }
            }
        });
    }
}
