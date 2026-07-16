export default class DungeonScene extends Phaser.Scene {
    constructor() {
        super("DungeonScene");
    }

    init(data) {
        this.mapData = data.mapData;
        this.monsters = data.monsters || [];
        this.bossData = data.boss || null;
        this.playerData = data.playerData || {};
    }

    create() {
        this.bgm = this.sound.add("bgm_dungeon", { loop: true, volume: 0.6 });
        this.bgm.play();

        this.cameras.main.setBackgroundColor("#1b1b1b");

        if (this.mapData) {
            const { tileSize, layers, collision, story } = this.mapData;

            const map = this.make.tilemap({
                data: layers,
                tileWidth: tileSize,
                tileHeight: tileSize
            });

            const tileset = map.addTilesetImage("tileset_dungeon");
            this.groundLayer = map.createLayer(0, tileset, 0, 0);

            if (collision) {
                const collisionMap = this.make.tilemap({
                    data: collision,
                    tileWidth: tileSize,
                    tileHeight: tileSize
                });

                const collisionLayer = collisionMap.createLayer(0, tileset, 0, 0);
                collisionLayer.setCollisionBetween(1, 999);
                this.collisionLayer = collisionLayer;
            }

            this.storyText = this.add.text(20, 20, story || "", {
                fontSize: "14px",
                color: "#ccccff",
                wordWrap: { width: 400 }
            });
        }

        this.player = this.physics.add.sprite(400, 300, "fox_idle");
        this.player.setScale(1.5);
        this.player.setCollideWorldBounds(true);
        this.player.hp = this.playerData.hp ?? 100;
        this.player.maxHp = 100;
        this.player.mp = this.playerData.mp ?? 50;
        this.player.maxMp = 50;
        this.player.attackPower = this.playerData.attackPower ?? 20;
        this.player.isInvulnerable = false;
        this.player.equipment = this.playerData.equipment || [];
        this.inventory = this.playerData.inventory || [];

        this.createAnimations();
        this.player.play("fox_idle");

        this.monsterGroup = this.physics.add.group();
        this.spawnWave(1);

        if (this.bossData) {
            this.boss = this.physics.add.sprite(
                this.bossData.x ?? 700,
                this.bossData.y ?? 300,
                "boss"
            );
            this.boss.setScale(2);
            this.boss.setCollideWorldBounds(true);
            this.boss.hp = this.bossData.hp ?? 300;
            this.boss.maxHp = this.boss.hp;
            this.boss.attack = this.bossData.attack ?? 20;
            this.boss.lastAttackTime = 0;
            this.boss.phase = 1;
            this.boss.nextPatternTime = 0;
        }

        this.hpBarBg = this.add.rectangle(20, 50, 200, 16, 0x333333).setOrigin(0, 0);
        this.hpBar = this.add.rectangle(20, 50, 200, 16, 0xff4444).setOrigin(0, 0);

        this.mpBarBg = this.add.rectangle(20, 70, 200, 12, 0x333333).setOrigin(0, 0);
        this.mpBar = this.add.rectangle(20, 70, 200, 12, 0x4444ff).setOrigin(0, 0);

        this.inventoryText = this.add.text(20, 90, "", {
            fontSize: "14px",
            color: "#ffff00"
        });

        this.waveText = this.add.text(20, 160, "Wave: 1", {
            fontSize: "16px",
            color: "#ff6666"
        });

        this.bossText = this.add.text(20, 190, "", {
            fontSize: "16px",
            color: "#ff00ff"
        });

        this.updateHPBar();
        this.updateMPBar();
        this.updateInventoryUI();
        this.updateBossUI();

        this.cursors = this.input.keyboard.createCursorKeys();
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.dodgeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ALT);
        this.specialKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        this.moveSpeed = 200;
        this.lastMeleeAttack = 0;
        this.lastShootAttack = 0;
        this.lastDashTime = 0;
        this.lastDodgeTime = 0;
        this.lastSpecialTime = 0;

        this.projectiles = this.physics.add.group();

        if (this.collisionLayer) {
            this.physics.add.collider(this.player, this.collisionLayer);
            this.physics.add.collider(this.monsterGroup, this.collisionLayer);
            if (this.boss) this.physics.add.collider(this.boss, this.collisionLayer);
        }

        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }

    update(time) {
        this.handlePlayerMovement();
        this.handleSkills(time);
        this.handleMonsterAI(time);
        this.handlePlayerAttack(time);
        this.handleBossAI(time);
        this.checkWaveClear();
    }

    createAnimations() {
        this.anims.create({
            key: "fox_idle",
            frames: [{ key: "fox_idle" }],
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({
            key: "fox_walk",
            frames: this.anims.generateFrameNumbers("fox_walk", { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: "fox_attack",
            frames: this.anims.generateFrameNumbers("fox_attack", { start: 0, end: 2 }),
            frameRate: 10,
            repeat: 0
        });

        this.anims.create({
            key: "fox_hit",
            frames: this.anims.generateFrameNumbers("fox_hit", { start: 0, end: 2 }),
            frameRate: 10,
            repeat: 0
        });

        this.anims.create({
            key: "fox_die",
            frames: this.anims.generateFrameNumbers("fox_die", { start: 0, end: 2 }),
            frameRate: 6,
            repeat: 0
        });
    }

    spawnWave(waveNumber) {
        this.currentWave = waveNumber;
        this.monsterGroup.clear(true, true);

        this.monsters.forEach((m, index) => {
            const monster = this.monsterGroup.create(
                600 + index * 80,
                300,
                `dungeon_monster_${index}`
            );
            monster.setScale(2);
            monster.setCollideWorldBounds(true);
            monster.hp = (m.hp ?? 50) + (waveNumber - 1) * 10;
            monster.attack = (m.attack ?? 5) + (waveNumber - 1) * 2;
            monster.lastAttackTime = 0;
            monster.dropItem = m.dropItem;
        });

        this.waveText.setText(`Wave: ${waveNumber}`);
    }

    handlePlayerMovement() {
        const speed = this.moveSpeed;
        this.player.setVelocity(0);

        let moving = false;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            moving = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            moving = true;
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            moving = true;
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
            moving = true;
        }

        if (moving) {
            if (this.player.anims.currentAnim?.key !== "fox_walk") {
                this.player.play("fox_walk");
            }
        } else {
            if (this.player.anims.currentAnim?.key !== "fox_idle") {
                this.player.play("fox_idle");
            }
        }
    }

    handleSkills(time) {
        if (this.dashKey.isDown && time > this.lastDashTime + 1000) {
            this.lastDashTime = time;
            const dashSpeed = 500;
            const vx = this.player.body.velocity.x;
            const vy = this.player.body.velocity.y;
            if (vx !== 0 || vy !== 0) {
                this.player.setVelocity(vx * (dashSpeed / this.moveSpeed), vy * (dashSpeed / this.moveSpeed));
            }
        }

        if (this.dodgeKey.isDown && time > this.lastDodgeTime + 1500) {
            this.lastDodgeTime = time;
            this.player.isInvulnerable = true;
            this.player.setAlpha(0.5);
            this.time.delayedCall(500, () => {
                this.player.isInvulnerable = false;
                this.player.setAlpha(1);
            });
        }

        if (this.specialKey.isDown && time > this.lastSpecialTime + 3000 && this.player.mp >= 10) {
            this.lastSpecialTime = time;
            this.player.mp -= 10;
            this.updateMPBar();

            this.monsterGroup.children.iterate(monster => {
                const distance = Phaser.Math.Distance.Between(
                    monster.x, monster.y,
                    this.player.x, this.player.y
                );

                if (distance < 150) {
                    monster.hp -= this.player.attackPower * 2;
                    monster.setTint(0xff4444);

                    if (monster.hp <= 0) {
                        this.killMonster(monster);
                    }
                }
            });

            if (this.boss) {
                const distance = Phaser.Math.Distance.Between(
                    this.boss.x, this.boss.y,
                    this.player.x, this.player.y
                );

                if (distance < 200) {
                    this.boss.hp -= this.player.attackPower * 2;
                    this.updateBossUI();
                    if (this.boss.hp <= 0) {
                        this.killBoss();
                    }
                }
            }

            this.cameras.main.flash(200, 255, 255, 255);
        }
    }

    handlePlayerAttack(time) {
        if (this.attackKey.isDown && time > this.lastMeleeAttack + 500) {
            this.lastMeleeAttack = time;

            this.player.play("fox_attack");

            this.monsterGroup.children.iterate(monster => {
                const distance = Phaser.Math.Distance.Between(
                    monster.x, monster.y,
                    this.player.x, this.player.y
                );

                if (distance < 70) {
                    monster.hp -= this.player.attackPower;
                    monster.setTint(0xffaaaa);

                    if (monster.hp <= 0) {
                        this.killMonster(monster);
                    }
                }
            });

            if (this.boss) {
                const distance = Phaser.Math.Distance.Between(
                    this.boss.x, this.boss.y,
                    this.player.x, this.player.y
                );

                if (distance < 80) {
                    this.boss.hp -= this.player.attackPower;
                    this.updateBossUI();
                    if (this.boss.hp <= 0) {
                        this.killBoss();
                    }
                }
            }
        }

        if (this.shootKey.isDown && time > this.lastShootAttack + 800) {
            this.lastShootAttack = time;

            const projectile = this.projectiles.create(
                this.player.x,
                this.player.y,
                "projectile"
            );

            projectile.setScale(1.2);

            const angle = Phaser.Math.Angle.Between(
                this.player.x,
                this.player.y,
                this.input.activePointer.worldX,
                this.input.activePointer.worldY
            );

            const speed = 300;

            projectile.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );

            projectile.damage = this.player.attackPower * 0.75;

            this.physics.add.overlap(projectile, this.monsterGroup, (proj, monster) => {
                monster.hp -= proj.damage;
                proj.destroy();
                monster.setTint(0xffaaaa);

                if (monster.hp <= 0) {
                    this.killMonster(monster);
                }
            });

            if (this.boss) {
                this.physics.add.overlap(projectile, this.boss, (proj, boss) => {
                    boss.hp -= proj.damage;
                    proj.destroy();
                    this.updateBossUI();
                    if (boss.hp <= 0) {
                        this.killBoss();
                    }
                });
            }
        }
    }

    handleMonsterAI(time) {
        const player = this.player;

        this.monsterGroup.children.iterate(monster => {
            if (!monster || !monster.active) return;

            const distance = Phaser.Math.Distance.Between(
                monster.x, monster.y,
                player.x, player.y
            );

            const chaseRange = 300;
            const attackRange = 60;

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

            if (distance <= attackRange) {
                if (time > monster.lastAttackTime + 1000) {
                    monster.lastAttackTime = time;

                    if (!player.isInvulnerable) {
                        player.hp -= monster.attack;
                        this.updateHPBar();

                        this.cameras.main.shake(100, 0.005);

                        if (player.hp <= 0) {
                            this.player.play("fox_die");
                            this.player.setVelocity(0);
                        }
                    }
                }
            }
        });
    }

    handleBossAI(time) {
        if (!this.boss || !this.boss.active) return;

        const player = this.player;

        const distance = Phaser.Math.Distance.Between(
            this.boss.x, this.boss.y,
            player.x, player.y
        );

        const chaseRange = 400;
        const attackRange = 80;

        if (distance < chaseRange && distance > attackRange) {
            const angle = Phaser.Math.Angle.Between(
                this.boss.x, this.boss.y,
                player.x, player.y
            );

            const speed = 120;

            this.boss.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
        } else {
            this.boss.setVelocity(0);
        }

        if (distance <= attackRange) {
            if (time > this.boss.lastAttackTime + 800) {
                this.boss.lastAttackTime = time;

                if (!player.isInvulnerable) {
                    player.hp -= this.boss.attack;
                    this.updateHPBar();

                    this.cameras.main.shake(200, 0.01);

                    if (player.hp <= 0) {
                        this.player.play("fox_die");
                        this.player.setVelocity(0);
                    }
                }
            }
        }

        // 보스 패턴 자동 생성 (돌진/광역/소환)
        if (time > this.boss.nextPatternTime + 3000) {
            this.boss.nextPatternTime = time;

            const pattern = Phaser.Math.Between(1, 3);

            if (pattern === 1) {
                this.bossChargeAttack();
            } else if (pattern === 2) {
                this.bossAoEAttack();
            } else if (pattern === 3) {
                this.bossSummonMinions();
            }
        }

        // 페이즈 전환
        if (this.boss.hp < this.boss.maxHp * 0.5 && this.boss.phase === 1) {
            this.boss.phase = 2;
            this.boss.attack += 10;
            this.bossText.setText("Boss: Phase 2!");

            if (this.bgm) this.bgm.stop();
            this.bossBgm = this.sound.add("bgm_boss", { loop: true, volume: 0.8 });
            this.bossBgm.play();
        }
    }

    bossChargeAttack() {
        const angle = Phaser.Math.Angle.Between(
            this.boss.x, this.boss.y,
            this.player.x, this.player.y
        );

        const speed = 300;

        this.boss.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

        this.time.delayedCall(500, () => {
            this.boss.setVelocity(0);
        });
    }

    bossAoEAttack() {
        const radius = 200;

        const circle = this.add.circle(this.boss.x, this.boss.y, radius, 0xff0000, 0.2);
        this.time.delayedCall(400, () => {
            const distance = Phaser.Math.Distance.Between(
                this.boss.x, this.boss.y,
                this.player.x, this.player.y
            );

            if (distance < radius && !this.player.isInvulnerable) {
                this.player.hp -= this.boss.attack * 1.5;
                this.updateHPBar();
                this.cameras.main.shake(200, 0.02);
            }

            circle.destroy();
        });
    }

    bossSummonMinions() {
        if (!this.monsters || this.monsters.length === 0) return;

        for (let i = 0; i < 2; i++) {
            const mData = this.monsters[Phaser.Math.Between(0, this.monsters.length - 1)];
            const monster = this.monsterGroup.create(
                this.boss.x + Phaser.Math.Between(-80, 80),
                this.boss.y + Phaser.Math.Between(-80, 80),
                `dungeon_monster_${Phaser.Math.Between(0, this.monsters.length - 1)}`
            );
            monster.setScale(2);
            monster.setCollideWorldBounds(true);
            monster.hp = (mData.hp ?? 50) + 20;
            monster.attack = (mData.attack ?? 5) + 5;
            monster.lastAttackTime = 0;
            monster.dropItem = mData.dropItem;
        }
    }

    killMonster(monster) {
        monster.setVelocity(0);
        monster.setTint(0xff0000);

        const itemData = monster.dropItem;

        if (itemData) {
            const item = this.physics.add.sprite(monster.x, monster.y, "item_loot");
            item.setScale(1.2);
            item.itemData = itemData;

            this.physics.add.overlap(this.player, item, () => {
                this.pickupItem(item);
            });
        }

        monster.destroy();
    }

    killBoss() {
        this.boss.setVelocity(0);
        this.boss.setTint(0xff0000);
        this.bossText.setText("Boss: Defeated!");
        this.cameras.main.flash(500, 255, 255, 0);
        this.boss.destroy();
    }

    pickupItem(item) {
        const data = item.itemData;
        this.inventory.push(data);
        this.updateInventoryUI();
        item.destroy();
    }

    updateHPBar() {
        const ratio = Phaser.Math.Clamp(this.player.hp / this.player.maxHp, 0, 1);
        this.hpBar.width = 200 * ratio;
    }

    updateMPBar() {
        const ratio = Phaser.Math.Clamp(this.player.mp / this.player.maxMp, 0, 1);
        this.mpBar.width = 200 * ratio;
    }

    updateInventoryUI() {
        this.inventoryText.setText(
            "Inventory:\n" +
            (this.inventory.length
                ? this.inventory.map(i => `${i.name} (${i.rarity})`).join("\n")
                : "(empty)")
        );
    }

    updateBossUI() {
        if (!this.boss) {
            this.bossText.setText("Boss: None");
            return;
        }

        this.bossText.setText(`Boss HP: ${this.boss.hp}/${this.boss.maxHp}`);
    }

    checkWaveClear() {
        if (this.monsterGroup.countActive(true) === 0 && (!this.boss || !this.boss.active)) {
            this.spawnWave(this.currentWave + 1);
        }
    }
}
