import { savePlayerData } from "../firebaseClient.js";

export default class OverworldScene extends Phaser.Scene {
    constructor() {
        super("OverworldScene");
    }

    init(data) {
        this.overworldMap = data.overworldMap;
        this.overworldMonsters = data.overworldMonsters || [];
        this.overworldNPCs = data.overworldNPCs || [];
        this.overworldQuests = data.overworldQuests || [];
        this.dungeonMap = data.dungeonMap;
        this.dungeonMonsters = data.dungeonMonsters || [];
        this.dungeonBoss = data.dungeonBoss || null;
        this.playerData = data.playerData || {};
    }

    create() {
        // BGM
        this.bgm = this.sound.add("bgm_overworld", { loop: true, volume: 0.5 });
        this.bgm.play();

        // 맵
        this.cameras.main.setBackgroundColor("#2b2b2b");

        if (this.overworldMap) {
            const { tileSize, layers, collision, story } = this.overworldMap;

            const map = this.make.tilemap({
                data: layers,
                tileWidth: tileSize,
                tileHeight: tileSize
            });

            const tileset = map.addTilesetImage("tileset_overworld");
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

            this.storyText = this.add.text(450, 20, story || "", {
                fontSize: "14px",
                color: "#ccccff",
                wordWrap: { width: 320 }
            });
        }

        // 몬스터
        this.monsterGroup = this.physics.add.group();
        this.overworldMonsters.forEach((m, index) => {
            const x = m.spawnX ?? (600 + index * 80);
            const y = m.spawnY ?? 300;

            const monster = this.monsterGroup.create(
                x,
                y,
                `overworld_monster_${index}`
            );
            monster.setScale(2);
            monster.setCollideWorldBounds(true);
            monster.hp = m.hp;
            monster.attack = m.attack;
            monster.lastAttackTime = 0;
            monster.dropItem = m.dropItem;
            monster.name = m.name || `Monster_${index}`;
        });

        // 플레이어
        this.player = this.physics.add.sprite(400, 300, "fox_idle");
        this.player.setScale(1.5);
        this.player.setCollideWorldBounds(true);
        this.player.hp = this.playerData.hp ?? 100;
        this.player.attackPower = this.playerData.attackPower ?? 20;
        this.player.isInvulnerable = false;
        this.player.equipment = this.playerData.equipment || [];
        this.player.inventory = this.playerData.inventory || [];

        // 애니메이션
        this.createAnimations();
        this.player.play("fox_idle");

        // NPC
        this.npcGroup = this.physics.add.group();
        this.overworldNPCs.forEach((npcData, index) => {
            const npc = this.npcGroup.create(
                npcData.x ?? (200 + index * 80),
                npcData.y ?? 250,
                "npc"
            );
            npc.setImmovable(true);
            npc.dialog = npcData.dialog;
            npc.name = npcData.name;
            npc.questId = npcData.questId || null;

            this.add.text(
                npc.x - 20,
                npc.y - 40,
                npcData.name,
                { fontSize: "14px", color: "#ffffaa" }
            );
        });

        // 포탈
        this.portal = this.physics.add.sprite(800, 300, "portal");
        this.portal.setImmovable(true);

        // UI / HUD
        this.hpBarBg = this.add.rectangle(20, 20, 200, 16, 0x333333).setOrigin(0, 0);
        this.hpBar = this.add.rectangle(20, 20, 200, 16, 0xff4444).setOrigin(0, 0);

        this.inventoryText = this.add.text(20, 50, "", {
            fontSize: "14px",
            color: "#ffff00"
        });

        this.equipmentText = this.add.text(20, 120, "", {
            fontSize: "14px",
            color: "#00ffcc"
        });

        this.questText = this.add.text(20, 190, "", {
            fontSize: "14px",
            color: "#ffffff",
            wordWrap: { width: 400 }
        });

        this.dialogText = this.add.text(450, 140, "", {
            fontSize: "14px",
            color: "#ffffff",
            wordWrap: { width: 320 }
        });

        this.activeQuests = [];

        this.updateHPBar();
        this.updateInventoryUI();
        this.updateEquipmentUI();
        this.updateQuestUI();

        // 입력
        this.cursors = this.input.keyboard.createCursorKeys();
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.dodgeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ALT);
        this.specialKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.saveKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

        this.moveSpeed = 200;
        this.lastMeleeAttack = 0;
        this.lastShootAttack = 0;
        this.lastDashTime = 0;
        this.lastDodgeTime = 0;
        this.lastSpecialTime = 0;

        this.projectiles = this.physics.add.group();

        // 충돌
        if (this.collisionLayer) {
            this.physics.add.collider(this.player, this.collisionLayer);
            this.physics.add.collider(this.monsterGroup, this.collisionLayer);
        }
        this.physics.add.collider(this.player, this.npcGroup);

        this.physics.add.overlap(this.player, this.portal, () => {
            this.enterDungeon();
        });

        this.physics.add.overlap(this.player, this.npcGroup, (player, npc) => {
            if (this.interactKey.isDown) {
                this.handleNPCInteraction(npc);
            }
        });

        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }

    update(time) {
        this.handlePlayerMovement();
        this.handleSkills(time);
        this.handleMonsterAI(time);
        this.handlePlayerAttack(time);

        if (Phaser.Input.Keyboard.JustDown(this.saveKey)) {
            this.saveGame();
        }
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

        if (this.specialKey.isDown && time > this.lastSpecialTime + 3000) {
            this.lastSpecialTime = time;

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

            this.cameras.main.flash(200, 255, 255, 255);
        }
    }

    handlePlayerAttack(time) {
        if (this.attackKey.isDown && time > this.lastMeleeAttack + 500) {
            this.lastMeleeAttack = time;

            this.player.play("fox_attack");
            this.sound.play("sfx_attack", { volume: 0.7 });

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
                        this.sound.play("sfx_hit", { volume: 0.7 });

                        this.cameras.main.shake(100, 0.005);

                        if (player.hp <= 0) {
                            player.play("fox_die");
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

        this.checkQuestProgress(monster);
    }

    pickupItem(item) {
        const data = item.itemData;
        this.player.inventory.push(data);
        this.updateInventoryUI();
        this.sound.play("sfx_item", { volume: 0.7 });
        item.destroy();
    }

    handleNPCInteraction(npc) {
        let text = `${npc.name}: ${npc.dialog}`;

        if (npc.questId) {
            const quest = this.overworldQuests.find(q => q.id === npc.questId);
            if (quest) {
                text += `\n\n[Quest] ${quest.title}\n${quest.description}`;
                this.acceptQuest(quest);
            }
        }

        this.dialogText.setText(text);
    }

    acceptQuest(quest) {
        if (!this.activeQuests.find(q => q.id === quest.id)) {
            this.activeQuests.push({ ...quest, progress: 0, completed: false });
            this.updateQuestUI();
        }
    }

    checkQuestProgress(monster) {
        this.activeQuests.forEach(q => {
            if (q.type === "kill" && q.targetMonster === monster.name && !q.completed) {
                q.progress += 1;
                if (q.progress >= q.required) {
                    q.completed = true;
                }
            }
        });

        this.updateQuestUI();
    }

    updateHPBar() {
        const ratio = Phaser.Math.Clamp(this.player.hp / 100, 0, 1);
        this.hpBar.width = 200 * ratio;
    }

    updateInventoryUI() {
        const list = this.player.inventory || [];
        this.inventoryText.setText(
            "Inventory:\n" +
            (list.length
                ? list.map(i => `${i.name} (${i.rarity})`).join("\n")
                : "(empty)")
        );
    }

    updateEquipmentUI() {
        const list = this.player.equipment || [];
        this.equipmentText.setText(
            "Equipment:\n" +
            (list.length
                ? list.map(e => `${e.slot}: ${e.name}`).join("\n")
                : "(none)")
        );
    }

    updateQuestUI() {
        const list = this.activeQuests || [];
        this.questText.setText(
            "Quests:\n" +
            (list.length
                ? list.map(q =>
                    `${q.title} - ${q.completed ? "완료" : `${q.progress}/${q.required}`}`
                ).join("\n")
                : "(no active quests)")
        );
    }

    async saveGame() {
        await savePlayerData("player_001", {
            hp: this.player.hp,
            attackPower: this.player.attackPower,
            inventory: this.player.inventory,
            equipment: this.player.equipment
        });

        this.dialogText.setText("게임이 저장되었습니다.");
    }

    enterDungeon() {
        this.bgm.stop();
        this.scene.start("DungeonScene", {
            mapData: this.dungeonMap,
            monsters: this.dungeonMonsters,
            boss: this.dungeonBoss,
            playerData: {
                hp: this.player.hp,
                attackPower: this.player.attackPower,
                inventory: this.player.inventory,
                equipment: this.player.equipment
            }
        });
    }
}
