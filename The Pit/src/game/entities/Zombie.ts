import Phaser from "phaser";

export class Zombie extends Phaser.Physics.Arcade.Sprite {
  private speed: number = 80 + Math.random() * 40;
  private target: Phaser.Physics.Arcade.Sprite | null = null;
  private attackRange: number = 10;
  private attackCooldown: number = 0;
  private isDead: boolean = false;
  private isHurt: boolean = false;
  private isAttacking: boolean = false;
  private health: number = 3;
  private zombieType: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: string = "Zombie_1",
    target: Phaser.Physics.Arcade.Sprite
  ) {
    super(scene, x, y, `${type}_Idle`);
    this.zombieType = type;
    this.target = target;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setBodySize(50, 90);
    this.setPushable(true);

    this.initAnimations(scene, type);
    this.play(`${this.zombieType}_Idle`);

    if (Math.random() > 0.6) {
      scene.time.addEvent({
        delay: Phaser.Math.Between(3000, 15000),
        callback: () => {
          if ((scene as any).isGamePaused) return;

          if (this.active && !this.isDead) {
            try {
              const sounds = ["Zombie", "Zombie2", "FemaleZombie"];
              const snd = Phaser.Utils.Array.GetRandom(sounds);
              scene.sound.play(snd, {
                volume: 0.3,
                rate: 0.9 + Math.random() * 0.2,
              });
            } catch (e) {}
          }
        },
        loop: true,
      });
    }
  }

  private initAnimations(scene: Phaser.Scene, type: string) {
    const types = ["Idle", "Walk", "Attack", "Hurt", "Dead"];
    types.forEach((action) => {
      const key = `${type}_${action}`;
      if (!scene.anims.exists(key)) {
        const rate = action === "Attack" ? 12 : 8;

        const repeat = action === "Dead" ? 0 : -1;

        scene.anims.create({
          key: key,
          frames: scene.anims.generateFrameNumbers(`${type}_${action}`, {
            start: 0,
          }),
          frameRate: rate,
          repeat:
            action === "Dead" || action === "Hurt" || action === "Attack"
              ? 0
              : -1,
        });
      }
    });

    this.on("animationcomplete", this.handleAnimationComplete, this);
  }

  private handleAnimationComplete(animation: Phaser.Animations.Animation) {
    if (animation.key.includes("Attack")) {
      this.isAttacking = false;

      this.play(`${this.zombieType}_Idle`, true);
    } else if (animation.key.includes("Hurt")) {
      this.isHurt = false;
      this.play(`${this.zombieType}_Idle`, true);
    }
  }

  setStats(level: number) {
    const baseSpeed = 50;
    this.speed = baseSpeed + level * 5;
    if (this.speed > 450) this.speed = 450;

    const baseHealth = 2;
    this.health = baseHealth + Math.floor(level / 3);
  }

  takeDamage(amount: number) {
    if (this.isDead) return;
    if (this.isHurt) return;

    this.health -= amount;

    if (this.health <= 0) {
      this.die();
    } else {
      this.isHurt = true;
      this.play(`${this.zombieType}_Hurt`, true);
      this.setVelocity(0, 0);
    }
  }

  die() {
    this.isDead = true;
    this.setVelocity(0, 0);
    if (this.body) {
      this.body.enable = false;
      this.body.checkCollision.none = true;
    }
    this.play(`${this.zombieType}_Dead`, true);

    try {
      this.scene.sound.play("ZombieDying", { volume: 0.5 });
    } catch (e) {}

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 2000,
      delay: 1000,
      onComplete: () => this.destroy(),
    });
  }

  update(time: number, delta: number) {
    if (this.isDead) return;
    if (this.isHurt) return;

    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }

    if (this.isAttacking) {
      this.setVelocity(0, 0);
      return;
    }

    if (this.target && this.target.active) {
      const dist = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        this.target.x,
        this.target.y
      );

      if (dist <= this.attackRange) {
        this.setVelocity(0, 0);
        if (this.attackCooldown <= 0) {
          this.attack();
        } else {
          this.play(`${this.zombieType}_Idle`, true);
        }
      } else {
        this.scene.physics.moveToObject(this, this.target, this.speed);
        this.play(`${this.zombieType}_Walk`, true);

        if (this.body) {
          if (this.body.velocity.x < 0) {
            this.setFlipX(true);
          } else {
            this.setFlipX(false);
          }
        }
      }
    }
  }

  private attack() {
    this.isAttacking = true;
    this.attackCooldown = 1500;
    this.play(`${this.zombieType}_Attack`);

    try {
      this.scene.sound.play("ZombieScreech", {
        volume: 0.4,
        rate: 0.9 + Math.random() * 0.2,
      });
    } catch (e) {}
  }
}
