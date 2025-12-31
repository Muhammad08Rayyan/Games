import { Scene, GameObjects } from "phaser";

export class MainMenu extends Scene {
  background: GameObjects.Image;
  playButton: GameObjects.Text;

  constructor() {
    super("MainMenu");
  }

  preload() {}

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.background = this.add.image(width / 2, height / 2, "main_bg");

    const scaleX = width / this.background.width;
    const scaleY = height / this.background.height;
    const scale = Math.max(scaleX, scaleY);
    this.background.setScale(scale).setScrollFactor(0);

    if (!this.sound.get("heroic_theme")) {
      const music = this.sound.add("heroic_theme", {
        loop: true,
        volume: 0.5,
      });
      music.play();
    }

    this.playButton = this.add
      .text(width / 2, height - 100, "PLAY", {
        fontFamily: "Arial Black",
        fontSize: 64,
        color: "#ff0000",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#330000",
          blur: 5,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: this.playButton,
      scale: { from: 1, to: 1.1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.playButton.on("pointerdown", () => {
      this.scene.start("CharacterSelection");
    });

    this.playButton.on("pointerover", () => {
      this.playButton.setStyle({ color: "#ff4444" });
    });

    this.playButton.on("pointerout", () => {
      this.playButton.setStyle({ color: "#ff0000" });
    });
  }
}
