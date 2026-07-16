import {
    loadMap,
    loadMonstersByArea,
    loadNPCs,
    loadQuests,
    loadPlayerData,
    loadBoss
} from "../firebaseClient.js";

export default class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");
    }

    async preload() {
        const loadingText = this.add.text(400, 300, "Loading...", {
            fontSize: "24px",
            color: "#ffffff"
        }).setOrigin(0.5);

        // 기본 리소스
        this.load.image("fox_idle", "https://dummyimage.com/64x64/ffffff/000000&text=Fox");
        this.load.spritesheet("fox_walk", "https://dummyimage.com/192x64/ffffff/000000&text=Walk", {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet("fox_attack", "https://dummyimage.com/192x64/ffffff/000000&text=Atk", {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet("fox_hit", "https://dummyimage.com/192x64/ff9999/000000&text=Hit", {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet("fox_die", "https://dummyimage.com/192x64/ff0000/000000&text=Die", {
            frameWidth: 64,
            frameHeight: 64
        });

        this.load.image("projectile", "https://dummyimage.com/16x16/00ccff/000000&text=*");
        this.load.image("item_loot", "https://dummyimage.com/32x32/ffcc00/000000&text=Loot");
        this.load.image("portal", "https://dummyimage.com/32x32/6633ff/ffffff&text=P");
        this.load.image("npc", "https://dummyimage.com/32x48/ff9999/000000&text=NPC");
        this.load.image("boss", "https://dummyimage.com/96x96/ff00ff/000000&text=BOSS");

        // BGM / SFX
        this.load.audio("bgm_overworld", "https://example.com/bgm_overworld.mp3");
        this.load.audio("bgm_dungeon", "https://example.com/bgm_dungeon.mp3");
        this.load.audio("bgm_boss", "https://example.com/bgm_boss.mp3");
        this.load.audio("sfx_attack", "https://example.com/sfx_attack.mp3");
        this.load.audio("sfx_hit", "https://example.com/sfx_hit.mp3");
        this.load.audio("sfx_item", "https://example.com/sfx_item.mp3");

        // 맵
        this.overworldMap = await loadMap("overworld_latest");
        if (this.overworldMap?.tilesetUrl) {
            this.load.image("tileset_overworld", this.overworldMap.tilesetUrl);
        }

        this.dungeonMap = await loadMap("dungeon_latest");
        if (this.dungeonMap?.tilesetUrl) {
            this.load.image("tileset_dungeon", this.dungeonMap.tilesetUrl);
        }

        // 몬스터
        this.overworldMonsters = await loadMonstersByArea("overworld");
        this.overworldMonsters.forEach((m, index) => {
            this.load.image(`overworld_monster_${index}`, m.imageUrl);
        });

        this.dungeonMonsters = await loadMonstersByArea("dungeon");
        this.dungeonMonsters.forEach((m, index) => {
            this.load.image(`dungeon_monster_${index}`, m.imageUrl);
        });

        // NPC / 퀘스트 / 플레이어 / 보스
        this.overworldNPCs = await loadNPCs("overworld");
        this.overworldQuests = await loadQuests("overworld");
        this.playerData = await loadPlayerData("player_001");
        this.dungeonBoss = await loadBoss("dungeon");
    }

    create() {
        this.scene.start("OverworldScene", {
            overworldMap: this.overworldMap,
            overworldMonsters: this.overworldMonsters,
            overworldNPCs: this.overworldNPCs,
            overworldQuests: this.overworldQuests,
            dungeonMap: this.dungeonMap,
            dungeonMonsters: this.dungeonMonsters,
            dungeonBoss: this.dungeonBoss,
            playerData: this.playerData
        });
    }
}
