export default class DungeonScene extends Phaser.Scene {
    constructor() {
        super("DungeonScene");
    }

    init(data) {
        this.mapData = data.mapData;
        this.monsters = data.monsters || [];
    }

    create() {
        this.cameras.main.setBackgroundColor("#1b1b1b");

        if (this.mapData) {
            const { tileSize, layers, collision } = this.mapData;

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
        }

        this.monsterGroup = this.physics.add.group();
        this.monsters.forEach((m, index) => {
            const monster = this.monsterGroup.create(
                600 + index * 80,
                300,
                `dungeon_monster_${index}`
            );
            monster.setScale(2);
            monster.setCollideWorldBounds(true);
            monster.hp = m.hp;
            monster.attack = m.attack;
            monster.lastAttackTime = 0;
            monster.dropItem = m.dropItem;
        });

        this.player = this.physics.add.sprite(400, 300, "fox_idle");
        this.player.setScale(1.5);
        this.player.setCollideWorldBounds(true);
        this.player.hp = 100;
        this.player.isInvulnerable = false;

        this.inventory = [];
        this.inventoryText = this.add.text(20, 80, "Inventory:", {
            fontSize: "18px",
            color: "#ffff00"
        });

        this.hpText = this.add.text(20, 20, `HP: ${this.player.hp}`, {
            fontSize: "20px",
            color: "#ffffff"
        });

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
        }

        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }

    update(time) {
        this.handlePlayerMovement();
        this.handleSkills(time);
        this.handleMonsterAI(time);
        this.handlePlayerAttack(time);
    }

    handlePlayerMovement() {
        const speed = this.moveSpeed;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
        else if (this.cursors.right.isDown) this.player.setVelocityX(speed);

        if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
        else if (this.cursors.down.isDown) this.player.setVelocityY(speed);
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

        if (this.specialKey.isDown && time > this.lastSpecialTime + 3000) {
            this.lastSpecialTime = time;

            this.monsterGroup.children.iterate(monster => {
                const distance = Phaser.Math.Distance.Between(
                    monster.x, monster.y,
                    this.player.x, this.player.y
                );

                if (distance < 150) {
                    monster.hp -= 40;
                    monster.setTint(0xff4444);

                    if (monster.hp <= 0) {
                        this.killMonster(monster);
                    }
                }
            });

            this.cameras.main.flash(200, 255, 255, 255);
        }
    }

    handlePlayerAttack(time) {
        if (this.attackKey.isDown && time > this.lastMeleeAttack + 500) {
            this.lastMeleeAttack = time;

            this.monsterGroup.children.iterate(monster => {
                const distance = Phaser.Math.Distance.Between(
                    monster.x, monster.y,
                    this.player.x, this.player.y
                );

                if (distance < 70) {
                    monster.hp -= 20;
                    monster.setTint(0xffaaaa);

                    if (monster.hp <= 0) {
                        this.killMonster(monster);
                    }
                }
            });
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

            projectile.damage = 15;

            this.physics.add.overlap(projectile, this.monsterGroup, (proj, monster) => {
                monster.hp -= proj.damage;
                proj.destroy();
                monster.setTint(0xffaaaa);

                if (monster.hp <= 0) {
                    this.killMonster(monster);
                }
            });
        }
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
                        this.hpText.setText(`HP: ${player.hp}`);

                        this.cameras.main.shake(100, 0.005);

                        if (player.hp <= 0) {
                            player.setTint(0xff0000);
                            player.setVelocity(0);
                        }
                    }
                }
            }
        });
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

    pickupItem(item) {
        const data = item.itemData;
        this.inventory.push(data);

        this.inventoryText.setText(
            "Inventory:\n" +
            this.inventory.map(i => `${i.name} (${i.rarity})`).join("\n")
        );

        item.destroy();
    }
}
