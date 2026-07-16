// src/scenes/CharacterTestScene.js

export default class CharacterTestScene extends Phaser.Scene {
    constructor() {
        super("CharacterTestScene");
    }

    create() {
        this.add.text(400, 80, "간이 MBTI 검사", {
            fontSize: "32px",
            color: "#ffffff"
        }).setOrigin(0.5);

        // MBTI 질문 (간단 4문항)
        this.questions = [
            { key: "EI", text: "사람들과 함께 있을 때 에너지가 생긴다 (E) / 혼자 있을 때 충전된다 (I)" },
            { key: "SN", text: "현실적이고 사실 중심 (S) / 직관적이고 상상 중심 (N)" },
            { key: "TF", text: "논리적 판단 (T) / 감정적 판단 (F)" },
            { key: "JP", text: "계획적 (J) / 즉흥적 (P)" }
        ];

        this.answers = {
            EI: null,
            SN: null,
            TF: null,
            JP: null
        };

        this.currentIndex = 0;

        this.questionText = this.add.text(400, 200, "", {
            fontSize: "20px",
            color: "#ffffff",
            wordWrap: { width: 600 }
        }).setOrigin(0.5);

        this.choiceA = this.add.text(400, 300, "", {
            fontSize: "24px",
            color: "#00ffcc"
        }).setOrigin(0.5).setInteractive();

        this.choiceB = this.add.text(400, 360, "", {
            fontSize: "24px",
            color: "#ffcc00"
        }).setOrigin(0.5).setInteractive();

        this.choiceA.on("pointerdown", () => this.selectAnswer("A"));
        this.choiceB.on("pointerdown", () => this.selectAnswer("B"));

        this.showQuestion();
    }

    showQuestion() {
        const q = this.questions[this.currentIndex];
        this.questionText.setText(q.text);

        if (q.key === "EI") {
            this.choiceA.setText("E");
            this.choiceB.setText("I");
        } else if (q.key === "SN") {
            this.choiceA.setText("S");
            this.choiceB.setText("N");
        } else if (q.key === "TF") {
            this.choiceA.setText("T");
            this.choiceB.setText("F");
        } else if (q.key === "JP") {
            this.choiceA.setText("J");
            this.choiceB.setText("P");
        }
    }

    selectAnswer(answer) {
        const q = this.questions[this.currentIndex];
        this.answers[q.key] = answer === "A" ? this.choiceA.text : this.choiceB.text;

        this.currentIndex++;

        if (this.currentIndex >= this.questions.length) {
            this.finishMBTI();
        } else {
            this.showQuestion();
        }
    }

    finishMBTI() {
        const mbti =
            this.answers.EI +
            this.answers.SN +
            this.answers.TF +
            this.answers.JP;

        this.scene.start("CharacterScene", { mbti });
    }
}
