import { Scene } from "phaser";

export class CharacterSelection extends Scene {
  constructor() {
    super("CharacterSelection");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    
    this.add.image(width / 2, height / 2, "main_bg").setAlpha(0.5);

    
    this.add
      .text(width / 2, 100, "Select Your Fighter", {
        fontFamily: "Arial Black",
        fontSize: 48,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 6,
        align: "center",
      })
      .setOrigin(0.5);

    const raiders = ["Raider_1", "Raider_2", "Raider_3"];
    const startX = width / 2 - 250;
    const spacing = 250;

    raiders.forEach((raider, index) => {
      const x = startX + index * spacing;
      const y = height / 2;

      
      const sprite = this.add
        .sprite(x, y, `${raider}_Idle`, 0)
        .setScale(1.5)
        .setInteractive();

      
      const text = this.add
        .text(x, y + 100, raider.replace("_", " "), {
          fontFamily: "Arial Black",
          fontSize: 24,
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5);

      
      sprite.on("pointerover", () => {
        sprite.setScale(1.7);
        text.setColor("#ff0000");
      });

      sprite.on("pointerout", () => {
        sprite.setScale(1.5);
        text.setColor("#ffffff");
      });

      
      sprite.on("pointerdown", () => {
        this.scene.start("Game", { character: raider });
      });
    });
  }
}
