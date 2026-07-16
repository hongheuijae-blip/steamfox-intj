import { initializeFirestoreData } from "../firebaseInitData.js";
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
        // Firestore 초기 데이터 자동 생성 (최초 1회 실행)
        await initializeFirestoreData();

        const loadingText = this.add.text(400, 300, "Loading...", {
            fontSize: "24px",
            color: "#ffffff"
        }).setOrigin(0.5);

        // 기본 플레이어 스프라이트
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

        // 기본 이펙트/오브젝트
        this.load.image("projectile", "https://dummyimage.com/16x16/00ccff/000000&text=*");
        this.load.image("item_loot", "https://dummyimage.com/32x32/ffcc00/000000&text=Loot");
        this.load.image("portal", "https://dummyimage.com/32x32/6633ff/ffffff&text=P");
        this.load.image("npc", "https://dummyimage.com/32x48/ff9999/000000&text=NPC");
        this.load.image("boss", "https://dummyimage.com/96x96/ff00ff/000000&text=BOSS");

        // BGM 슬롯
        this.load.audio("bgm_overworld", "audio/overworld_bgm.mp3");
        this.load.audio("bgm_dungeon", "audio/dungeon_bgm.mp3");
        this.load.audio("bgm_boss", "audio/boss_bgm.mp3");
        this.load.audio("bgm_village", "audio/village_bgm.mp3");
        this.load.audio("bgm_story", "audio/story_bgm.mp3");

        // Firestore 데이터 로딩
        this.overworldMap = await loadMap("overworld_latest");
        if (this.overworldMap?.tilesetUrl) {
            this.load.image("tileset_overworld", this.overworldMap.tilesetUrl);
        }

        this.dungeonMap = await loadMap("dungeon_latest");
        if (this.dungeonMap?.tilesetUrl) {
            this.load.image("tileset_dungeon", this.dungeonMap.tilesetUrl);
        }

        this.overworldMonsters = await loadMonstersByArea("overworld");
        this.overworldMonsters.forEach((m, index) => {
            this.load.image(`overworld_monster_${index}`, m.imageUrl);
        });

        this.dungeonMonsters = await loadMonstersByArea("dungeon");
        this.dungeonMonsters.forEach((m, index) => {
            this.load.image(`dungeon_monster_${index}`, m.imageUrl);
        });

        this.overworldNPCs = await loadNPCs("overworld");
        this.overworldQuests = await loadQuests("overworld");
        this.playerData = await loadPlayerData("player_001");
        this.dungeonBoss = await loadBoss("dungeon");
    }

    create() {
        // MBTI 캐릭터 생성 씬으로 이동
        this.scene.start("CharacterTestScene", {
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

// src/scenes/BootScene.js

import Phaser from "phaser";
import { AudioManager } from "../systems/AudioManager.js";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // 🔹 이미지/타일/스프라이트 등 기존 리소스 로드가 있다면 여기 유지

    // 🔹 BGM 오디오 로드 (public/audio 기준)
    this.load.audio("bgm_overworld", "audio/overworld_bgm.mp3");
    this.load.audio("bgm_dungeon", "audio/dungeon_bgm.mp3");
    this.load.audio("bgm_boss", "audio/boss_bgm.mp3");
    this.load.audio("bgm_village", "audio/village_bgm.mp3");
    this.load.audio("bgm_story", "audio/story_bgm.mp3");
  }

  create() {
    // 🔹 전역 오디오 매니저 생성
    this.game.audioManager = new AudioManager(this);

    // 🔹 기본 BGM 재생 (예: 필드)
    this.game.audioManager.playBGM("bgm_overworld");

    // 🔹 다음 씬으로 넘어가는 로직이 있다면 그대로 유지
    // this.scene.start("MainScene");
  }
}
