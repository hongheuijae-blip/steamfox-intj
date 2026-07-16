import { db } from "./firebaseClient.js";
import { doc, setDoc } from "firebase/firestore";

export async function initializeFirestoreData() {
  // maps
  await setDoc(doc(db, "maps", "overworld_latest"), {
    name: "overworld",
    tilesetUrl: "placeholder",
    tileSize: 32,
    layers: [],
    collision: [],
    story: "placeholder"
  });

  // monsters
  await setDoc(doc(db, "monsters", "placeholder_monster_01"), {
    name: "placeholder",
    area: "overworld",
    hp: 50,
    attack: 5,
    imageUrl: "placeholder",
    dropItem: { name: "placeholder", rarity: "common" }
  });

  // npcs
  await setDoc(doc(db, "npcs", "placeholder_npc_01"), {
    name: "NPC Placeholder",
    area: "overworld",
    dialog: "안녕하세요! 테스트 NPC입니다.",
    questId: "placeholder_quest_01",
    x: 200,
    y: 250
  });

  // quests
  await setDoc(doc(db, "quests", "placeholder_quest_01"), {
    title: "테스트 퀘스트",
    description: "몬스터 한 마리를 처치하세요.",
    type: "kill",
    targetMonster: "placeholder",
    required: 1
  });

  // bosses
  await setDoc(doc(db, "bosses", "dungeon"), {
    name: "Dungeon Boss Placeholder",
    hp: 500,
    attack: 20,
    imageUrl: "placeholder"
  });

  // players
  await setDoc(doc(db, "players", "player_001"), {
    characterType: "Fox",
    mbti: "INTJ",
    hp: 100,
    mp: 50,
    attackPower: 20,
    inventory: [],
    equipment: []
  });

  console.log("🔥 Firestore 초기 데이터 자동 생성 완료!");
}
