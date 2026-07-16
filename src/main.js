import BootScene from "./scenes/BootScene.js";
import OverworldScene from "./scenes/OverworldScene.js";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#1a1a1a",

    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    scene: [BootScene, OverworldScene]
};

const game = new Phaser.Game(config);

export default game;
