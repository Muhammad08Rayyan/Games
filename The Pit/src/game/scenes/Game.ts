import { Scene } from "phaser";
import { Zombie } from "../entities/Zombie";

export class Game extends Scene {
  player: Phaser.Physics.Arcade.Sprite;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  spaceKey: Phaser.Input.Keyboard.Key;
  selectedCharacter: string;
  isAttacking: boolean = false;

  health: number = 100;
  maxHealth: number = 100;
  healthBar: Phaser.GameObjects.Graphics;
  attackHitbox: Phaser.GameObjects.Zone;
  facing: string = "down";
  lastHitTime: number = 0;
  isGameOver: boolean = false;
  isGamePaused: boolean = false;
  pauseStartTime: number = 0;
  gameOver() {
    this.isGameOver = true;
    this.physics.pause();
    this.player.setTint(0x555555);
    this.gameText.setText("GAME OVER");
    this.gameText.setAlpha(1);

    this.time.delayedCall(3000, () => {
      this.scene.start("MainMenu");
    });
  }

  level: number = 1;
  zombiesKilled: number = 0;
  zombiesPerLevel: number = 10;
  zombiesSpawnedInLevel: number = 0;

  levelText: Phaser.GameObjects.Text;
  scoreText: Phaser.GameObjects.Text;
  gameText: Phaser.GameObjects.Text;

  zombies: Phaser.Physics.Arcade.Group;
  spawnTimer: number = 0;
  waveCount: number = 0;

  constructor() {
    super("Game");
  }

  init(data: any) {
    this.selectedCharacter = data.character || "Raider_2";

    this.isAttacking = false;
    this.isGameOver = false; 
    this.isGamePaused = false; 
    this.physics.resume(); 
    this.facing = "down";
    this.health = 100;
    this.level = 1;
    this.zombiesKilled = 0;
    this.zombiesSpawnedInLevel = 0;
    this.zombiesPerLevel = 10;
  }

  create() {
    this.cameras.main.setBackgroundColor("#100505");

    const mapWidth = 1500;
    const mapHeight = 1500;

    try {
      this.add.tileSprite(0, 0, mapWidth, mapHeight, "floor").setOrigin(0);
    } catch (e) {}

    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

    this.createWallsAndCrowd(mapWidth, mapHeight);

    this.createAnimations();

    try {
      this.player = this.physics.add.sprite(
        mapWidth / 2,
        mapHeight / 2,
        `${this.selectedCharacter}_Idle`
      );
      this.player.setCollideWorldBounds(true);
      this.player.setScale(1.7);

      this.player.setBodySize(
        this.player.width * 0.4,
        this.player.height * 0.6
      );

      this.player.play(`${this.selectedCharacter}_idle`);

      this.health = 100;
      this.healthBar = this.add.graphics();
      this.healthBar.setDepth(100);
    } catch (e) {}

    this.attackHitbox = this.add.zone(0, 0, 60, 60);
    this.physics.add.existing(this.attackHitbox);
    (this.attackHitbox.body as Phaser.Physics.Arcade.Body).setAllowGravity(
      false
    );
    this.attackHitbox.setVisible(false);
    this.attackHitbox.setActive(false);

    this.cameras.main.setBounds(-200, -200, mapWidth + 400, mapHeight + 400);
    if (this.player) {
      this.cameras.main.startFollow(this.player);
    }
    this.cameras.main.setZoom(1.0);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );
    }

    this.player.on(
      "animationcomplete",
      (animation: Phaser.Animations.Animation) => {
        if (animation.key.endsWith("_attack")) {
          this.isAttacking = false;
          this.player.play(`${this.selectedCharacter}_idle`, true);

          this.attackHitbox.setActive(false);
          this.attackHitbox.setPosition(-1000, -1000);
        }
      }
    );

    this.zombies = this.physics.add.group({
      classType: Zombie,
      runChildUpdate: true,
    });

    this.physics.add.collider(this.zombies, this.zombies);

    this.physics.add.collider(
      this.player,
      this.zombies,
      this.handlePlayerZombieCollision,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.attackHitbox,
      this.zombies,
      this.handleAttackHit,
      undefined,
      this
    );

    this.levelText = this.add
      .text(20, 20, "Level 1", {
        fontSize: "48px",
        fontFamily: "Impact",
        color: "#FFFFFF",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setScrollFactor(0)
      .setDepth(200);

    this.scoreText = this.add
      .text(20, 80, "Kills: 0", {
        fontSize: "32px",
        fontFamily: "Arial",
        color: "#FF0000",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setScrollFactor(0)
      .setDepth(200);

    this.gameText = this.add
      .text(this.cameras.main.width / 2, this.cameras.main.height / 2, "", {
        fontSize: "64px",
        color: "#ff0000",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setDepth(300)
      .setScrollFactor(0)
      .setAlpha(0);

    const instructions = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height - 100,
        "WASD to Move\nSPACE to Attack",
        {
          fontSize: "32px",
          color: "#ffffff",
          align: "center",
          stroke: "#000000",
          strokeThickness: 4,
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(300);

    this.tweens.add({
      targets: instructions,
      alpha: 0,
      duration: 2000,
      delay: 4000,
      onComplete: () => instructions.destroy(),
    });

    const pauseBtn = this.add
      .text(this.cameras.main.width - 20, 20, "PAUSE", {
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: { x: 10, y: 5 },
      })
      .setScrollFactor(0)
      .setOrigin(1, 0)
      .setDepth(300)
      .setInteractive()
      .on("pointerdown", () => {
        if (this.isGamePaused) {
          this.isGamePaused = false;
          this.physics.resume();
          this.anims.resumeAll();
          this.zombies.runChildUpdate = true;
          this.sound.resumeAll();

          const pauseDuration = this.time.now - this.pauseStartTime;
          this.lastHitTime += pauseDuration;

          pauseBtn.setText("PAUSE");
        } else {
          this.isGamePaused = true;
          this.physics.pause();
          this.anims.pauseAll();
          this.zombies.runChildUpdate = false;
          this.sound.pauseAll();
          this.pauseStartTime = this.time.now;

          pauseBtn.setText("RESUME");
        }
      });
  }

  createAnimations() {
    const char = this.selectedCharacter;
    if (!char) return;

    if (!this.anims.exists(`${char}_idle`)) {
      this.anims.create({
        key: `${char}_idle`,
        frames: this.anims.generateFrameNumbers(`${char}_Idle`, { start: 0 }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!this.anims.exists(`${char}_run`)) {
      this.anims.create({
        key: `${char}_run`,
        frames: this.anims.generateFrameNumbers(`${char}_Run`, { start: 0 }),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(`${char}_attack`)) {
      this.anims.create({
        key: `${char}_attack`,
        frames: this.anims.generateFrameNumbers(`${char}_Attack`, { start: 0 }),
        frameRate: 15,
        repeat: 0,
      });
    }

    this.player?.on(
      "animationcomplete",
      (anim: Phaser.Animations.Animation) => {
        if (anim.key.endsWith("_attack")) {
          this.isAttacking = false;
          this.player.play(`${this.selectedCharacter}_idle`, true);

          this.attackHitbox.setActive(false);
          this.attackHitbox.setPosition(-1000, -1000);
        }
      }
    );
  }

  update(time: number, delta: number) {
    if (this.isGamePaused) return;
    if (this.isGameOver) return;
    if (!this.cursors || !this.player) return;

    this.updateHealthBar();

    if (this.health < this.maxHealth && time - this.lastHitTime > 10000) {
      this.health += 0.005 * delta;

      this.health += 0.002 * delta;
      if (this.health > this.maxHealth) this.health = this.maxHealth;
    }

    this.spawnTimer += delta;

    let rate = 2000 - this.level * 50;
    if (rate < 500) rate = 500;

    const maxActive = 5 + this.level * 3;

    if (
      this.zombies &&
      this.zombies.countActive() < maxActive &&
      this.spawnTimer > rate
    ) {
      this.spawnZombie();
      this.spawnTimer = 0;
    }

    if (this.isAttacking) {
      if (
        !this.player.anims.isPlaying ||
        !this.player.anims.currentAnim?.key.endsWith("_attack")
      ) {
        this.isAttacking = false;
        this.player.play(`${this.selectedCharacter}_idle`, true);
        this.attackHitbox.setActive(false);
        this.player.setRotation(0);
      }
    }

    if (this.isAttacking) return;

    const speed = 300;
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    playerBody.setVelocity(0);

    const keyW = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const keyA = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const keyS = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const keyD = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    let dx = 0;
    let dy = 0;

    if (keyA?.isDown) dx = -1;
    else if (keyD?.isDown) dx = 1;

    if (keyW?.isDown) dy = -1;
    else if (keyS?.isDown) dy = 1;

    if (dx !== 0 || dy !== 0) {
      const vec = new Phaser.Math.Vector2(dx, dy).normalize().scale(speed);
      playerBody.setVelocity(vec.x, vec.y);
      this.player.play(`${this.selectedCharacter}_run`, true);

      if (dx < 0) this.facing = "left";
      else if (dx > 0) this.facing = "right";
      else if (dy < 0) this.facing = "up";
      else if (dy > 0) this.facing = "down";

      if (dx < 0) {
        this.player.setFlipX(true);
      } else if (dx > 0) {
        this.player.setFlipX(false);
      }

      this.player.setRotation(0);
    } else {
      this.player.play(`${this.selectedCharacter}_idle`, true);
      this.player.setRotation(0);
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.performAttack();
    }
  }

  updateHealthBar() {
    if (!this.player || !this.healthBar) return;

    this.healthBar.clear();
    const x = this.player.x - 40;
    const y = this.player.y - 80;

    this.healthBar.fillStyle(0x000000);
    this.healthBar.fillRect(x, y, 80, 10);

    this.healthBar.fillStyle(0x00ff00);
    const width = (80 * this.health) / this.maxHealth;
    this.healthBar.fillRect(x, y, width, 10);
  }

  performAttack() {
    if (this.isAttacking) return;

    this.isAttacking = true;
    this.player.setVelocity(0);
    this.player.play(`${this.selectedCharacter}_attack`);

    const offset = 50;
    let offsetX = 0;
    let offsetY = 0;

    switch (this.facing) {
      case "left":
        offsetX = -offset;
        offsetY = 20;
        break;
      case "right":
        offsetX = offset;
        offsetY = 20;
        break;
      case "up":
        offsetY = -offset;
        break;
      case "down":
        offsetY = offset;
        break;
    }

    this.attackHitbox.setPosition(
      this.player.x + offsetX,
      this.player.y + offsetY
    );
    this.attackHitbox.setVisible(false);
    this.attackHitbox.setActive(true);
  }

  createWallsAndCrowd(width: number, height: number) {
    const platformWidth = 200;
    const wallHeight = 120;

    this.add
      .tileSprite(width / 2, -wallHeight / 2, width + 800, wallHeight, "wall")
      .setTint(0x555555);

    this.add
      .tileSprite(
        width / 2,
        -(wallHeight + platformWidth / 2),
        width + 800,
        platformWidth,
        "wall"
      )
      .setTint(0x999999);

    this.add
      .tileSprite(
        width / 2,
        height + wallHeight / 2,
        width + 800,
        wallHeight,
        "wall"
      )
      .setTint(0x555555);

    this.add
      .tileSprite(
        width / 2,
        height + wallHeight + platformWidth / 2,
        width + 800,
        platformWidth,
        "wall"
      )
      .setTint(0x999999);

    this.add
      .tileSprite(-wallHeight / 2, height / 2, wallHeight, height, "wall")
      .setTint(0x555555);

    this.add
      .tileSprite(
        -(wallHeight + platformWidth / 2),
        height / 2,
        platformWidth,
        height,
        "wall"
      )
      .setTint(0x999999);

    this.add
      .tileSprite(
        width + wallHeight / 2,
        height / 2,
        wallHeight,
        height,
        "wall"
      )
      .setTint(0x555555);

    this.add
      .tileSprite(
        width + wallHeight + platformWidth / 2,
        height / 2,
        platformWidth,
        height,
        "wall"
      )
      .setTint(0x999999);

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
      if (!this.anims.exists(`${type}_idle`)) {
        this.anims.create({
          key: `${type}_idle`,
          frames: this.anims.generateFrameNumbers(`${type}_Idle`, { start: 0 }),
          frameRate: 8,
          repeat: -1,
        });
      }
    });

    const placeCrowdCluster = (
      rectX: number,
      rectY: number,
      rectW: number,
      rectH: number,
      count: number,
      rotation: number,
      flipX: boolean
    ) => {
      for (let i = 0; i < count; i++) {
        const type = Phaser.Utils.Array.GetRandom(crowdTypes);

        const lx = rectX + Math.random() * rectW - rectW / 2;
        const ly = rectY + Math.random() * rectH - rectH / 2;

        const sprite = this.add.sprite(lx, ly, `${type}_Idle`);

        const rate = 8 + Math.random() * 8;
        sprite.play({ key: `${type}_idle`, frameRate: rate, repeat: -1 });

        sprite.setFlipX(flipX);
        sprite.setRotation(rotation + (Math.random() - 0.5) * 0.5);

        sprite.anims.setProgress(Math.random());

        const tint = Phaser.Display.Color.GetColor(
          200 + Math.random() * 55,
          200 + Math.random() * 55,
          200 + Math.random() * 55
        );
        sprite.setTint(tint);
        sprite.setDepth(20);
      }
    };

    const countY = Math.floor(height / 40);

    
    
    
    
    
    
    
    
    
    

    
    
    
    
    
    
    
    
    
    

    placeCrowdCluster(
      -(wallHeight + PlatformWidthOffset(platformWidth)),
      height / 2,
      platformWidth - 20,
      height,
      countY * 5,
      0,
      false
    );

    placeCrowdCluster(
      width + wallHeight + PlatformWidthOffset(platformWidth),
      height / 2,
      platformWidth - 20,
      height,
      countY * 5,
      0,
      true
    );
  }
  handlePlayerZombieCollision(player: any, zombie: any) {
    const p = player as Phaser.Physics.Arcade.Sprite;
    const z = zombie as Zombie;

    if (z.body && p.body) {
      const dir = new Phaser.Math.Vector2(p.x - z.x, p.y - z.y)
        .normalize()
        .scale(200);
      p.setVelocity(dir.x, dir.y);

      this.health -= 0.5;
      if (this.health <= 0) {
        this.health = 0;
        this.gameOver();
      }
      this.lastHitTime = this.time.now;

      p.setTint(0xff0000);
      this.time.delayedCall(100, () => p.clearTint());
    }
  }

  handleAttackHit(hitbox: any, zombie: any) {
    if (this.isAttacking && hitbox.active) {
      const z = zombie as Zombie;
      if (!z.body || !z.body.enable) return;

      z.takeDamage(1);

      z.setTintFill(0xffffff);
      this.time.delayedCall(100, () => {
        if (z.active) z.clearTint();
      });

      const dir = new Phaser.Math.Vector2(
        z.x - this.player.x,
        z.y - this.player.y
      )
        .normalize()
        .scale(150);
      z.setVelocity(dir.x, dir.y);

      if (z.body.checkCollision.none) {
        this.onZombieKilled();
      }
    }
  }

  onZombieKilled() {
    this.zombiesKilled++;
    this.scoreText.setText(`Kills: ${this.zombiesKilled}`);

    if (this.zombiesKilled >= this.getKillsRequiredForNextLevel()) {
      this.levelUp();
    }
  }

  getKillsRequiredForNextLevel() {
    let needed = 0;
    for (let i = 1; i <= this.level; i++) {
      needed += 10 + i * 2;
    }
    return needed;
  }

  levelUp() {
    this.level++;
    this.levelText.setText(`Level ${this.level}`);

    try {
      this.sound.play("Cheer", { volume: 0.5 });
    } catch (e) {}

    this.zombiesSpawnedInLevel = 0;

    if (!this.gameText) {
      this.gameText = this.add
        .text(this.cameras.main.centerX, this.cameras.main.centerY - 200, "", {
          fontSize: "64px",
          color: "#ff00ff",
          stroke: "#ffffff",
          strokeThickness: 6,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(300);
    }
    this.gameText.setText(`LEVEL ${this.level}`);
    this.gameText.setAlpha(1);
    this.tweens.add({
      targets: this.gameText,
      alpha: 0,
      y: this.gameText.y - 50,
      duration: 2000,
      delay: 500,
      onComplete: () => {},
    });

    this.zombiesPerLevel = 10 + this.level * 2;

    this.health += 20;
    if (this.health > 100) this.health = 100;
  }

  spawnZombie() {
    if (!this.player) return;

    const edge = Phaser.Math.Between(0, 3);
    let x = 0;
    let y = 0;
    const padding = 50;
    const mapWidth = 1500;
    const mapHeight = 1500;

    switch (edge) {
      case 0:
        x = Phaser.Math.Between(0, mapWidth);
        y = padding;
        break;
      case 1:
        x = Phaser.Math.Between(0, mapWidth);
        y = mapHeight - padding;
        break;
      case 2:
        x = padding;
        y = Phaser.Math.Between(0, mapHeight);
        break;
      case 3:
        x = mapWidth - padding;
        y = Phaser.Math.Between(0, mapHeight);
        break;
    }

    const types = ["Zombie_1", "Zombie_2", "Zombie_3", "Zombie_4"];
    const type = Phaser.Utils.Array.GetRandom(types);

    const zombie = new Zombie(this, x, y, type, this.player);
    zombie.setStats(this.level);
    this.zombies.add(zombie);
  }
}

function PlatformWidthOffset(w: number) {
  return w / 2 - 32;
}
