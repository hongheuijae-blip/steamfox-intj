import {
    loadMap,
    loadMonstersByArea,
    loadNPCs,
    loadQuests,
    loadPlayerData
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
        this.load.image("projectile", "https://dummyimage.com/16x16/00ccff/000000&text=*");
        this.load.image("item_loot", "https://dummyimage.com/32x32/ffcc00/000000&text=Loot");
        this.load.image("portal", "https://dummyimage.com/32x32/6633ff/ffffff&text=P");
        this.load.image("npc", "https://dummyimage.com/32x48/ff9999/000000&text=NPC");

        // 오버월드/던전 맵
        this.overworldMap = await loadMap("overworld_latest");
        if (this.overworldMap?.tilesetUrl) {
            this.load.image("tileset_overworld", this.overworldMap.tilesetUrl);
        }

        this.dungeonMap = await loadMap("dungeon_latest");
        if (this.dungeonMap?.tilesetUrl) {
            this.load.image("tileset_dungeon", this.dungeonMap.tilesetUrl);
        }

        // 몬스터 (오버월드/던전)
        this.overworldMonsters = await loadMonstersByArea("overworld");
        this.overworldMonsters.forEach((m, index) => {
            this.load.image(`overworld_monster_${index}`, m.imageUrl);
        });

        this.dungeonMonsters = await loadMonstersByArea("dungeon");
        this.dungeonMonsters.forEach((m, index) => {
            this.load.image(`dungeon_monster_${index}`, m.imageUrl);
        });

        // NPC + 퀘스트 + 플레이어 데이터
        this.overworldNPCs = await loadNPCs("overworld");
        this.overworldQuests = await loadQuests("overworld");
        this.playerData = await loadPlayerData("player_001"); // 임의 ID
    }

    create() {
        this.scene.start("OverworldScene", {
            overworldMap: this.overworldMap,
            overworldMonsters: this.overworldMonsters,
            overworldNPCs: this.overworldNPCs,
            overworldQuests: this.overworldQuests,
            dungeonMap: this.dungeonMap,
            dungeonMonsters: this.dungeonMonsters,
            playerData: this.playerData
        });
    }
}
