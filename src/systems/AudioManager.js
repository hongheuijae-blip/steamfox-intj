// src/systems/AudioManager.js

export class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.currentBGM = null;
  }

  playBGM(key, options = {}) {
    const { volume = 0.5, loop = true, fadeDuration = 500 } = options;

    // 이미 재생 중인 BGM이 있으면 페이드 아웃 후 정지
    if (this.currentBGM) {
      this.scene.tweens.add({
        targets: this.currentBGM,
        volume: 0,
        duration: fadeDuration,
        onComplete: () => {
          this.currentBGM.stop();
          this.currentBGM.destroy();
          this.currentBGM = null;
        }
      });
    }

    // 새 BGM 재생
    const bgm = this.scene.sound.add(key, { volume, loop });
    bgm.play();

    // 페이드 인
    bgm.volume = 0;
    this.scene.tweens.add({
      targets: bgm,
      volume,
      duration: fadeDuration
    });

    this.currentBGM = bgm;
  }

  stopBGM(fadeDuration = 500) {
    if (!this.currentBGM) return;

    this.scene.tweens.add({
      targets: this.currentBGM,
      volume: 0,
      duration: fadeDuration,
      onComplete: () => {
        this.currentBGM.stop();
        this.currentBGM.destroy();
        this.currentBGM = null;
      }
    });
  }
}
