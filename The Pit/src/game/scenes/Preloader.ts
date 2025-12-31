import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  preload() {
    
    this.load.image("main_bg", "Background.png");

    
    this.load.audio("heroic_theme", "Sounds/Heroic.mp3");
    this.load.audio("Cheer", "Sounds/Cheer.mp3");
    this.load.audio("Zombie", "Sounds/Zombie.mp3");
    this.load.audio("Zombie2", "Sounds/Zombie2.mp3");
    this.load.audio("FemaleZombie", "Sounds/FemaleZombie.mp3");
    this.load.audio("ZombieDying", "Sounds/ZombieDying.mp3");
    this.load.audio("ZombieScreech", "Sounds/ZombieScreech.mp3");

    
    this.load.setPath("assets");
    this.load.image("floor", "floor_tile.png");
    
    this.load.image("player_placeholder", "player_placeholder.png");

    
    this.load.spritesheet("Raider_1_Idle", "Raider_1/Idle.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("Raider_1_Run", "Raider_1/Run.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("Raider_1_Attack", "Raider_1/Attack_1.png", {
      frameWidth: 128,
      frameHeight: 128,
    });

    
    this.load.spritesheet("Raider_2_Idle", "Raider_2/Idle.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("Raider_2_Run", "Raider_2/Run.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    
    this.load.spritesheet("Raider_2_Attack", "Raider_2/Attack.png", {
      frameWidth: 128,
      frameHeight: 128,
    });

    
    this.load.spritesheet("Raider_3_Idle", "Raider_3/Idle.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("Raider_3_Run", "Raider_3/Run.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("Raider_3_Attack", "Raider_3/Attack_1.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    
    this.load.image("wall", "wall_stone.png");

    
    const crowdTypes = [
      "City_men_1",
      "City_men_2",
      "City_men_3",
      "Gangsters_1",
      "Gangsters_2",
      "Gangsters_3",
      "Homeless_1",
      "Homeless_2",
      "Homeless_3",
      "Trader_1",
      "Trader_2",
      "Trader_3",
    ];

    crowdTypes.forEach((type) => {
      
      this.load.spritesheet(`${type}_Idle`, `${type}/Idle.png`, {
        frameWidth: 128,
        frameHeight: 128,
      });
    });

    
    const zombies = ["Zombie_1", "Zombie_2", "Zombie_3", "Zombie_4"];
    const actions = ["Idle", "Walk", "Attack", "Hurt", "Dead"];

    zombies.forEach((zombie) => {
      actions.forEach((action) => {
        this.load.spritesheet(
          `${zombie}_${action}`,
          `${zombie}/${action}.png`,
          { frameWidth: 128, frameHeight: 128 }
        );
      });
    });
  }

  create() {
    this.scene.start("MainMenu");
  }
}
