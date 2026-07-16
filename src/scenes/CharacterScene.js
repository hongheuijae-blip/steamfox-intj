// src/scenes/CharacterScene.js

export default class CharacterScene extends Phaser.Scene {
    constructor() {
        super("CharacterScene");
    }

    init(data) {
        this.mbti = data.mbti;
    }

    create() {
        this.add.text(400, 80, "캐릭터 생성 결과", {
            fontSize: "32px",
            color: "#ffffff"
        }).setOrigin(0.5);

        const animal = this.getAnimalByMBTI(this.mbti);

        this.add.text(400, 200, `MBTI: ${this.mbti}`, {
            fontSize: "28px",
            color: "#ccccff"
        }).setOrigin(0.5);

        this.add.text(400, 260, `캐릭터 타입: ${animal}`, {
            fontSize: "28px",
            color: "#ffcc00"
        }).setOrigin(0.5);

        this.add.text(400, 340, "(이미지는 나중에 AI 파이프라인 연결 예정)", {
            fontSize: "18px",
            color: "#888888"
        }).setOrigin(0.5);

        this.add.text(400, 420, "Press ENTER to start game", {
            fontSize: "24px",
            color: "#00ffcc"
        }).setOrigin(0.5);

        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.scene.start("OverworldScene", {
                playerData: {
                    characterType: this.getAnimalByMBTI(this.mbti),
                    mbti: this.mbti
                }
            });
        }
    }

    getAnimalByMBTI(mbti) {
        const map = {
            INTJ: "Fox",
            INTP: "Fox",
            INFJ: "Cat",
            INFP: "Cat",
            ISTJ: "Bear",
            ISFJ: "Bear",
            ISTP: "Wolf",
            ISFP: "Wolf",
            ENTJ: "Eagle",
            ENTP: "Eagle",
            ENFJ: "Deer",
            ENFP: "Deer",
            ESTJ: "Lion",
            ESFJ: "Lion",
            ESTP: "Tiger",
            ESFP: "Tiger"
        };

        return map[mbti] || "Fox";
    }
}
