class SurvivalModeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SurvivalModeScene' });

        // Player object
        this.player = null;
        this.enemies = [];

        // Game state
        this.gameEnded = false;
        this.stageComplete = false;
        this.countdownActive = false;

        // Input handlers
        this.keys = null;

        // Arena bounds
        this.arenaLeft = 100;
        this.arenaRight = null;
        this.groundY = null;

        // Attack cooldowns
        this.attackCooldown = 0;
        this.dashCooldown = 0;

        // Weapon system
        this.weapons = [];

        // Bullet system
        this.bullets = [];

        // Double-tap tracking for dash
        this.lastKeyPress = { key: null, time: 0 };
        this.doubleTapWindow = 300;
    }

    init(data) {
        // First time initialization
        if (!data.stage) {
            this.currentStage = 1;
            this.playerStats = {
                maxHealth: 100,
                health: 100,
                damage: 10,
                speed: 200
            };
        } else {
            // Continuing from previous stage
            this.currentStage = data.stage;
            this.playerStats = data.playerStats;
        }
    }

    create() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Reset combat state
        this.gameEnded = false;
        this.stageComplete = false;
        this.countdownActive = false;
        this.attackCooldown = 0;
        this.dashCooldown = 0;

        // Clean up weapons
        this.weapons.forEach(weapon => {
            if (weapon.sprite) weapon.sprite.destroy();
        });
        this.weapons = [];

        // Clean up bullets
        this.bullets.forEach(bullet => {
            if (bullet.sprite) bullet.sprite.destroy();
        });
        this.bullets = [];

        // Play battle music
        if (window.audioManager) {
            window.audioManager.stopMusic();
            window.audioManager.playMusic('battleMusic');
        }

        // Create default arena
        this.createDefaultArena();

        // Create player
        this.createPlayer();

        // Create enemies based on stage
        this.createEnemies();

        // Spawn weapons strategically based on stage
        this.spawnStageWeapons();

        // Create UI
        this.createUI();

        // Setup input
        this.setupInput();

        // Start countdown
        this.startCountdown();
    }

    createDefaultArena() {
        // Set arena bounds (from BattleScene)
        this.arenaLeft = this.cameras.main.width * 0.1;
        this.arenaRight = this.cameras.main.width * 0.9;
        this.groundY = this.cameras.main.height * 0.75;

        const centerX = this.cameras.main.centerX;

        // Create epic medieval background (simplified version)
        const bgGradient = this.add.graphics();
        bgGradient.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f3460, 0x0f3460);
        bgGradient.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

        // Ground platform
        const groundGraphics = this.add.graphics();
        groundGraphics.fillStyle(0x654321, 1);
        groundGraphics.fillRect(
            this.arenaLeft,
            this.groundY,
            this.arenaRight - this.arenaLeft,
            this.cameras.main.height - this.groundY
        );
        groundGraphics.lineStyle(4, 0x4a3218);
        groundGraphics.strokeRect(
            this.arenaLeft,
            this.groundY,
            this.arenaRight - this.arenaLeft,
            this.cameras.main.height - this.groundY
        );

        // Create platforms array for collision
        this.platforms = [
            // Left platform
            { x: 200, y: 450, width: 200, height: 20 },
            // Right platform
            { x: 880, y: 450, width: 200, height: 20 },
            // Center platform
            { x: 540, y: 320, width: 200, height: 20 }
        ];

        // Draw platforms
        this.platforms.forEach(platform => {
            const platformGraphics = this.add.graphics();
            platformGraphics.fillStyle(0x8b4513, 1);
            platformGraphics.fillRect(
                platform.x,
                platform.y,
                platform.width,
                platform.height
            );
            platformGraphics.lineStyle(2, 0x654321);
            platformGraphics.strokeRect(
                platform.x,
                platform.y,
                platform.width,
                platform.height
            );
        });

        // Arena title banner
        const bannerGraphics = this.add.graphics();
        const titleY = 25;

        bannerGraphics.fillStyle(0x8B0000, 0.9);
        bannerGraphics.fillRoundedRect(centerX - 200, titleY - 15, 400, 50, 10);
        bannerGraphics.lineStyle(4, 0xFFD700);
        bannerGraphics.strokeRoundedRect(centerX - 200, titleY - 15, 400, 50, 10);

        const title = this.add.text(centerX, titleY + 10, '⚔️ SURVIVAL MODE ⚔️', {
            fontSize: '28px',
            fill: '#FFD700',
            fontFamily: 'serif',
            fontStyle: 'bold',
            stroke: '#8B0000',
            strokeThickness: 4
        }).setOrigin(0.5);
    }

    createPlayer() {
        const spawnX = 300;
        const spawnY = this.groundY - 25;

        // Create warrior container
        this.player = this.add.container(spawnX, spawnY);

        // Create warrior parts (blue color for player)
        this.player.parts = this.createWarriorParts('blue');
        Object.values(this.player.parts).forEach(part => this.player.add(part));

        // Add physics properties
        this.player.body = {
            x: this.player.x - 15,
            y: this.player.y - 25,
            width: 30,
            height: 50,
            velocityX: 0,
            velocityY: 0,
            grounded: true,
            facingRight: true
        };

        // Player stats
        this.player.stats = {
            health: this.playerStats.maxHealth,
            maxHealth: this.playerStats.maxHealth,
            damage: this.playerStats.damage,
            speed: this.playerStats.speed
        };
        this.player.health = this.playerStats.health; // Current HP from previous stage
        this.player.isAttacking = false;
        this.player.isDashing = false;
        this.player.isWalking = false;
        this.player.walkFrame = 0;
        this.player.weapon = null;
        this.player.knockbackTime = 0;

        // Attack hitbox (invisible)
        this.player.attackHitbox = this.add.rectangle(0, 0, 60, 40, 0xff0000, 0);
    }

    createWarriorParts(color) {
        const parts = {};

        // Color schemes
        const colors = {
            blue: { main: 0x3498db, dark: 0x2980b9, accent: 0x2c3e50 },
            red: { main: 0xe74c3c, dark: 0xc0392b, accent: 0x8b4513 }
        };

        const scheme = colors[color];

        // Head
        parts.head = this.add.circle(0, -20, 8, 0xf4d1ae);

        // Helmet
        parts.helmet = this.add.graphics();
        parts.helmet.fillStyle(scheme.accent);
        parts.helmet.fillEllipse(0, -20, 18, 16);
        parts.helmet.lineStyle(2, scheme.dark);
        parts.helmet.strokeEllipse(0, -20, 18, 16);

        // Body
        parts.body = this.add.graphics();
        parts.body.fillStyle(scheme.main);
        parts.body.fillRect(-8, -10, 16, 20);
        parts.body.lineStyle(2, scheme.dark);
        parts.body.strokeRect(-8, -10, 16, 20);

        // Arms
        parts.leftArm = this.add.graphics();
        parts.leftArm.fillStyle(scheme.main);
        parts.leftArm.fillEllipse(-12, -5, 6, 15);
        parts.leftArm.lineStyle(1, scheme.dark);
        parts.leftArm.strokeEllipse(-12, -5, 6, 15);

        parts.rightArm = this.add.graphics();
        parts.rightArm.fillStyle(scheme.main);
        parts.rightArm.fillEllipse(12, -5, 6, 15);
        parts.rightArm.lineStyle(1, scheme.dark);
        parts.rightArm.strokeEllipse(12, -5, 6, 15);

        // Legs
        parts.leftLeg = this.add.graphics();
        parts.leftLeg.fillStyle(scheme.accent);
        parts.leftLeg.fillEllipse(-5, 15, 6, 15);
        parts.leftLeg.lineStyle(1, scheme.dark);
        parts.leftLeg.strokeEllipse(-5, 15, 6, 15);

        parts.rightLeg = this.add.graphics();
        parts.rightLeg.fillStyle(scheme.accent);
        parts.rightLeg.fillEllipse(5, 15, 6, 15);
        parts.rightLeg.lineStyle(1, scheme.dark);
        parts.rightLeg.strokeEllipse(5, 15, 6, 15);

        return parts;
    }

    createEnemies() {
        this.enemies = [];
        const stageConfig = this.getStageConfig(this.currentStage);

        const spawnPositions = [
            { x: 980, y: this.groundY - 25 },
            { x: 200, y: 420 },
            { x: 980, y: 420 },
            { x: 640, y: 290 },
            { x: 850, y: this.groundY - 25 },
            { x: 750, y: this.groundY - 25 }
        ];

        for (let i = 0; i < stageConfig.enemyCount; i++) {
            const pos = spawnPositions[i];
            this.createEnemy(pos.x, pos.y, stageConfig);
        }
    }

    createEnemy(spawnX, spawnY, stageConfig) {
        const enemy = this.add.container(spawnX, spawnY);

        // Create warrior parts (red color for enemies)
        enemy.parts = this.createWarriorParts('red');
        Object.values(enemy.parts).forEach(part => enemy.add(part));

        // Flip some enemies randomly for variety
        if (Math.random() > 0.5) {
            enemy.setScale(-1, 1);
        }

        // Add physics properties
        enemy.body = {
            x: enemy.x - 15,
            y: enemy.y - 25,
            width: 30,
            height: 50,
            velocityX: 0,
            velocityY: 0,
            grounded: true,
            facingRight: enemy.scaleX > 0
        };

        // Enemy stats
        enemy.stats = {
            health: stageConfig.enemyHealth,
            damage: stageConfig.enemyDamage,
            speed: stageConfig.enemySpeed
        };
        enemy.health = stageConfig.enemyHealth;
        enemy.isAttacking = false;
        enemy.isDashing = false;
        enemy.isWalking = false;
        enemy.walkFrame = 0;
        enemy.weapon = null;
        enemy.knockbackTime = 0;

        // AI properties
        enemy.aiTimer = 0;
        enemy.aiState = 'chase';
        enemy.attackCooldown = 0;

        // Attack hitbox
        enemy.attackHitbox = this.add.rectangle(0, 0, 60, 40, 0xff0000, 0);

        // Health bar
        enemy.healthBarBg = this.add.rectangle(enemy.x, enemy.y - 50, 50, 6, 0x000000);
        enemy.healthBar = this.add.rectangle(enemy.x - 25, enemy.y - 50, 50, 6, 0xe74c3c).setOrigin(0, 0.5);

        this.enemies.push(enemy);
    }

    getStageConfig(stage) {
        // Stage 50: BOSS
        if (stage === 50) {
            return {
                enemyCount: 1,
                enemyHealth: 1000,
                enemyDamage: 999,
                enemySpeed: 250
            };
        }

        // Determine enemy count and base stats
        let enemyCount, baseHealth, baseDamage, baseSpeed, stageInTier, tierSize;

        if (stage < 10) {
            enemyCount = 1;
            stageInTier = stage - 1;
            tierSize = 9;
            baseHealth = 50;
            baseDamage = 5;
            baseSpeed = 120;
        } else if (stage < 20) {
            enemyCount = 2;
            stageInTier = stage - 10;
            tierSize = 10;
            baseHealth = 80;
            baseDamage = 8;
            baseSpeed = 140;
        } else if (stage < 30) {
            enemyCount = 3;
            stageInTier = stage - 20;
            tierSize = 10;
            baseHealth = 100;
            baseDamage = 10;
            baseSpeed = 160;
        } else if (stage < 40) {
            enemyCount = 4;
            stageInTier = stage - 30;
            tierSize = 10;
            baseHealth = 120;
            baseDamage = 12;
            baseSpeed = 180;
        } else if (stage < 45) {
            enemyCount = 5;
            stageInTier = stage - 40;
            tierSize = 5;
            baseHealth = 150;
            baseDamage = 15;
            baseSpeed = 200;
        } else {
            enemyCount = 6;
            stageInTier = stage - 45;
            tierSize = 5;
            baseHealth = 180;
            baseDamage = 18;
            baseSpeed = 220;
        }

        // Scale stats within tier
        const progress = stageInTier / tierSize;
        const enemyHealth = Math.floor(baseHealth + progress * 100);
        const enemyDamage = Math.floor(baseDamage + progress * 10);
        const enemySpeed = Math.floor(baseSpeed + progress * 40);

        return { enemyCount, enemyHealth, enemyDamage, enemySpeed };
    }

    spawnStageWeapons() {
        // Strategic weapon spawning based on stage
        // Weapons spawn every 5 stages, or on boss stages
        const shouldSpawnWeapon = (this.currentStage % 5 === 0) || this.currentStage === 50;

        if (!shouldSpawnWeapon) return;

        // Spawn 1-2 weapons depending on difficulty
        const weaponCount = this.currentStage < 25 ? 1 : 2;
        const weaponTypes = ['sword', 'gun', 'potion', 'shield'];

        for (let i = 0; i < weaponCount; i++) {
            const randomType = Phaser.Utils.Array.GetRandom(weaponTypes);
            const locations = this.getValidSpawnLocations();
            const randomLocation = Phaser.Utils.Array.GetRandom(locations);

            // Delay spawning slightly so they don't all drop at once
            this.time.delayedCall(1000 + i * 500, () => {
                if (!this.gameEnded) {
                    this.createWeapon(randomType, randomLocation.x, randomLocation.y);
                }
            });
        }
    }

    getValidSpawnLocations() {
        const locations = [];

        // Ground level spawn points
        for (let x = this.arenaLeft + 150; x < this.arenaRight - 150; x += 150) {
            locations.push({ x: x, y: this.groundY });
        }

        // Platform spawn points
        this.platforms.forEach(platform => {
            locations.push({ x: platform.x + platform.width / 2, y: platform.y });
        });

        return locations;
    }

    createWeapon(type, x, y) {
        const weapon = {
            type: type,
            x: x,
            y: y,
            lifespan: 8000, // 8 seconds lifespan
            sprite: null
        };

        // Create weapon sprites (from BattleScene)
        switch (type) {
            case 'sword':
                weapon.sprite = this.add.graphics();
                weapon.sprite.lineStyle(4, 0xc0c0c0);
                weapon.sprite.lineBetween(0, -15, 0, -35);
                weapon.sprite.lineStyle(6, 0x8b4513);
                weapon.sprite.lineBetween(0, -12, 0, -8);
                weapon.sprite.fillStyle(0xffd700);
                weapon.sprite.fillCircle(0, -8, 3);
                weapon.sprite.lineStyle(5, 0x8b4513);
                weapon.sprite.lineBetween(-8, -12, 8, -12);
                break;
            case 'gun':
                weapon.sprite = this.add.graphics();
                weapon.sprite.fillStyle(0x4a4a4a);
                weapon.sprite.fillRect(-12, -4, 20, 8);
                weapon.sprite.lineStyle(2, 0x2a2a2a);
                weapon.sprite.strokeRect(-12, -4, 20, 8);
                weapon.sprite.fillStyle(0x2a2a2a);
                weapon.sprite.fillRect(8, -2, 8, 4);
                weapon.sprite.fillStyle(0x654321);
                weapon.sprite.fillRect(-12, 0, 6, 10);
                weapon.sprite.lineStyle(2, 0x2a2a2a);
                weapon.sprite.strokeEllipse(-6, 6, 6, 6);
                weapon.sprite.fillStyle(0x1a1a1a);
                weapon.sprite.fillRect(12, -6, 2, 4);
                break;
            case 'potion':
                weapon.sprite = this.add.text(x, y, '❤️', {
                    fontSize: '32px'
                }).setOrigin(0.5);
                break;
            case 'shield':
                weapon.sprite = this.add.graphics();
                weapon.sprite.fillStyle(0x4169E1);
                weapon.sprite.fillEllipse(0, -5, 24, 32);
                weapon.sprite.lineStyle(3, 0x1E90FF);
                weapon.sprite.strokeEllipse(0, -5, 24, 32);
                weapon.sprite.fillStyle(0xC0C0C0);
                weapon.sprite.fillCircle(0, -8, 6);
                weapon.sprite.lineStyle(2, 0x808080);
                weapon.sprite.strokeCircle(0, -8, 6);
                weapon.sprite.lineStyle(2, 0xFFD700);
                weapon.sprite.strokeEllipse(0, -5, 20, 28);
                break;
        }

        // Position weapon above target for drop
        weapon.sprite.setPosition(x, y - 100);

        // Drop animation
        this.tweens.add({
            targets: weapon.sprite,
            y: y - 10,
            rotation: type !== 'potion' ? Math.PI * 2 : 0,
            scaleX: { from: 0.3, to: 1.3 },
            scaleY: { from: 0.3, to: 1.3 },
            duration: 600,
            ease: 'Bounce.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: weapon.sprite,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'Back.easeOut'
                });
            }
        });

        // Play sound
        if (window.audioManager) {
            window.audioManager.playSound('weaponPickup');
        }

        this.weapons.push(weapon);
    }

    createUI() {
        const centerX = this.cameras.main.centerX;

        // Stage number
        this.stageText = this.add.text(centerX, 100, `STAGE ${this.currentStage}/50`, {
            fontSize: '32px',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Boss indicator
        if (this.currentStage === 50) {
            this.add.text(centerX, 140, '💀 FINAL BOSS 💀', {
                fontSize: '24px',
                fontStyle: 'bold',
                fill: '#ff0000',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);
        }

        // Player health bar
        this.add.text(150, 165, 'YOUR HEALTH', {
            fontSize: '16px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.playerHealthBarBg = this.add.rectangle(150, 190, 250, 24, 0x2c3e50).setStrokeStyle(2, 0x34495e);
        this.playerHealthBar = this.add.rectangle(150, 190, 250, 24, 0x3498db);

        this.playerHealthText = this.add.text(150, 190, '', {
            fontSize: '16px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Player stats
        this.statsText = this.add.text(150, 215, '', {
            fontSize: '12px',
            fill: '#94a3b8'
        }).setOrigin(0.5);

        // Enemy counter
        this.enemyCountText = this.add.text(this.cameras.main.width - 150, 175, '', {
            fontSize: '20px',
            fill: '#e74c3c',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Controls reminder
        const controlsBg = this.add.rectangle(
            centerX,
            this.cameras.main.height - 22,
            800,
            40,
            0x000000,
            0.75
        );

        this.add.text(centerX, this.cameras.main.height - 22,
            'WASD = Move | SPACE = Attack | Double-tap A/D = Dash',
            { fontSize: '14px', fill: '#ffffff', fontStyle: 'bold' }
        ).setOrigin(0.5);

        this.updateUI();
    }

    updateUI() {
        if (!this.player || !this.playerHealthBar) return;

        // Player health
        const healthPercent = this.player.health / this.player.stats.maxHealth;
        this.playerHealthBar.scaleX = Math.max(0, healthPercent);
        this.playerHealthText.setText(`${Math.max(0, Math.floor(this.player.health))}/${this.player.stats.maxHealth}`);

        // Stats
        this.statsText.setText(
            `DMG: ${this.player.stats.damage} | SPD: ${Math.floor(this.player.stats.speed)} | MAX HP: ${this.player.stats.maxHealth}`
        );

        // Enemy count
        this.enemyCountText.setText(`ENEMIES: ${this.enemies.length}`);
    }

    setupInput() {
        this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D,
            SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
    }

    startCountdown() {
        this.countdownActive = true;
        let count = 3;

        const countdownText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            count.toString(),
            {
                fontSize: '120px',
                fontStyle: 'bold',
                fill: '#fbbf24',
                stroke: '#000000',
                strokeThickness: 8
            }
        ).setOrigin(0.5);

        // Play countdown sound
        if (window.audioManager) {
            window.audioManager.playSound('buttonClick');
        }

        const timer = this.time.addEvent({
            delay: 1000,
            repeat: 3,
            callback: () => {
                count--;
                if (count > 0) {
                    countdownText.setText(count.toString());
                    if (window.audioManager) {
                        window.audioManager.playSound('buttonClick');
                    }
                } else if (count === 0) {
                    countdownText.setText('FIGHT!');
                    if (window.audioManager) {
                        window.audioManager.playSound('battleStart');
                    }
                } else {
                    countdownText.destroy();
                    this.countdownActive = false;
                }
            }
        });
    }

    update(time, delta) {
        if (this.countdownActive || this.gameEnded || this.stageComplete) return;

        // Update player
        this.updatePlayerMovement(time, delta);
        this.updatePlayerPhysics(this.player);
        this.animateWarrior(this.player);

        // Update enemies
        this.enemies.forEach(enemy => {
            this.updateEnemyAI(enemy, delta);
            this.updatePlayerPhysics(enemy);
            this.animateWarrior(enemy);
            this.updateEnemyHealthBar(enemy);
        });

        // Update weapons
        this.updateWeapons(delta);
        this.checkWeaponPickups();

        // Update bullets
        this.updateBullets(delta);

        // Check combat
        this.checkCombat();

        // Update UI
        this.updateUI();

        // Check win/loss
        this.checkConditions();
    }

    updatePlayerMovement(time, delta) {
        // Attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= delta;
        }

        // Dash cooldown
        if (this.dashCooldown > 0) {
            this.dashCooldown -= delta;
        }

        // Knockback immunity
        if (this.player.knockbackTime > 0) {
            this.player.knockbackTime -= delta;
        }

        // Movement
        let moveX = 0;
        if (this.keys.A.isDown) moveX = -1;
        if (this.keys.D.isDown) moveX = 1;

        // Check for double-tap dash
        const currentTime = time;
        if (this.keys.A.isDown && !this.lastKeyPress.APressed) {
            if (currentTime - this.lastKeyPress.time < this.doubleTapWindow && this.lastKeyPress.key === 'A') {
                this.performDash(this.player, -1);
            }
            this.lastKeyPress = { key: 'A', time: currentTime, APressed: true };
        } else if (!this.keys.A.isDown) {
            this.lastKeyPress.APressed = false;
        }

        if (this.keys.D.isDown && !this.lastKeyPress.DPressed) {
            if (currentTime - this.lastKeyPress.time < this.doubleTapWindow && this.lastKeyPress.key === 'D') {
                this.performDash(this.player, 1);
            }
            this.lastKeyPress = { key: 'D', time: currentTime, DPressed: true };
        } else if (!this.keys.D.isDown) {
            this.lastKeyPress.DPressed = false;
        }

        // Apply movement (unless knocked back)
        if (this.player.knockbackTime <= 0 && !this.player.isDashing) {
            this.player.body.velocityX = moveX * this.player.stats.speed;
        }

        // Update walking state
        this.player.isWalking = Math.abs(this.player.body.velocityX) > 50;

        // Update facing direction
        if (moveX !== 0 && this.player.knockbackTime <= 0) {
            this.player.body.facingRight = moveX > 0;
            this.player.setScale(moveX > 0 ? 1 : -1, 1);
        }

        // Jump
        if (this.keys.W.isDown && this.player.body.grounded) {
            this.player.body.velocityY = -500;
            this.player.body.grounded = false;
            if (window.audioManager) {
                window.audioManager.playSound('dash');
            }
        }

        // Fast fall
        if (this.keys.S.isDown && !this.player.body.grounded) {
            this.player.body.velocityY += 30;
        }

        // Attack
        if (this.keys.SPACE.isDown && this.attackCooldown <= 0 && !this.player.isAttacking) {
            this.performAttack(this.player);
        }
    }

    performDash(player, direction) {
        if (this.dashCooldown > 0 || player.isDashing) return;

        player.isDashing = true;
        player.body.velocityX = direction * 800;
        this.dashCooldown = 1000;

        if (window.audioManager) {
            window.audioManager.playSound('dash');
        }

        this.time.delayedCall(200, () => {
            player.isDashing = false;
        });
    }

    performAttack(entity) {
        entity.isAttacking = true;

        if (entity === this.player) {
            this.attackCooldown = 500;
        } else {
            entity.attackCooldown = 800;
        }

        // Play attack sound
        if (window.audioManager) {
            if (entity.weapon && entity.weapon.type === 'gun') {
                window.audioManager.playSound('gunShot');
            } else {
                window.audioManager.playSound('swordSwing');
            }
        }

        // Handle gun shooting
        if (entity.weapon && entity.weapon.type === 'gun') {
            this.fireGunBullet(entity);
        }

        this.time.delayedCall(200, () => {
            entity.isAttacking = false;
        });
    }

    fireGunBullet(shooter) {
        const bulletSpeed = 600;
        const direction = shooter.body.facingRight ? 1 : -1;

        const bullet = {
            sprite: this.add.circle(shooter.x, shooter.y - 10, 4, 0xffff00),
            velocityX: direction * bulletSpeed,
            velocityY: 0,
            owner: shooter,
            damage: this.calculateDamage(shooter)
        };

        this.bullets.push(bullet);
    }

    updateBullets(delta) {
        this.bullets = this.bullets.filter(bullet => {
            // Move bullet
            bullet.sprite.x += bullet.velocityX * delta / 1000;
            bullet.sprite.y += bullet.velocityY * delta / 1000;

            // Check collision with walls
            if (bullet.sprite.x < this.arenaLeft || bullet.sprite.x > this.arenaRight) {
                bullet.sprite.destroy();
                return false;
            }

            // Check collision with targets
            const targets = bullet.owner === this.player ? this.enemies : [this.player];

            for (let target of targets) {
                const dist = Phaser.Math.Distance.Between(
                    bullet.sprite.x, bullet.sprite.y,
                    target.x, target.y
                );

                if (dist < 20) {
                    this.applyDamage(bullet.owner, target, bullet.damage);
                    bullet.sprite.destroy();
                    return false;
                }
            }

            return true;
        });
    }

    updateEnemyAI(enemy, delta) {
        if (enemy.attackCooldown > 0) {
            enemy.attackCooldown -= delta;
        }

        if (enemy.knockbackTime > 0) {
            enemy.knockbackTime -= delta;
        }

        enemy.aiTimer += delta;

        if (enemy.aiTimer > 150) {
            enemy.aiTimer = 0;

            const distX = this.player.x - enemy.x;
            const distY = this.player.y - enemy.y;
            const distance = Math.sqrt(distX * distX + distY * distY);

            // Move towards player
            if (distance > 60 && enemy.knockbackTime <= 0) {
                enemy.body.velocityX = Math.sign(distX) * enemy.stats.speed;
                enemy.body.facingRight = distX > 0;
                enemy.setScale(distX > 0 ? 1 : -1, 1);

                // Jump if player is above
                if (distY < -50 && enemy.body.grounded && Math.random() > 0.6) {
                    enemy.body.velocityY = -500;
                    enemy.body.grounded = false;
                }
            } else if (enemy.knockbackTime <= 0) {
                enemy.body.velocityX = 0;

                // Attack if in range
                if (enemy.attackCooldown <= 0 && !enemy.isAttacking) {
                    this.performAttack(enemy);
                }
            }

            enemy.isWalking = Math.abs(enemy.body.velocityX) > 50;
        }
    }

    updateEnemyHealthBar(enemy) {
        if (!enemy.healthBar || !enemy.healthBarBg) return;

        enemy.healthBarBg.setPosition(enemy.x, enemy.y - 50);
        enemy.healthBar.setPosition(enemy.x - 25, enemy.y - 50);

        const healthPercent = enemy.health / enemy.stats.health;
        enemy.healthBar.scaleX = Math.max(0, healthPercent);
    }

    updatePlayerPhysics(entity) {
        // Gravity
        if (!entity.body.grounded) {
            entity.body.velocityY += 30;
        }

        // Cap fall speed
        entity.body.velocityY = Math.min(entity.body.velocityY, 1500);

        // Apply velocity
        entity.body.x += entity.body.velocityX * 0.016;
        entity.body.y += entity.body.velocityY * 0.016;

        // Apply friction
        if (entity.body.grounded && entity.knockbackTime <= 0 && !entity.isDashing) {
            entity.body.velocityX *= 0.85;
        }

        // Platform collision
        entity.body.grounded = false;

        this.platforms.forEach(platform => {
            if (this.checkPlatformCollision(entity.body, platform)) {
                entity.body.y = platform.y - entity.body.height / 2;
                entity.body.velocityY = 0;
                entity.body.grounded = true;
            }
        });

        // Ground collision
        if (entity.body.y + entity.body.height / 2 > this.groundY) {
            entity.body.y = this.groundY - entity.body.height / 2;
            entity.body.velocityY = 0;
            entity.body.grounded = true;
        }

        // Arena bounds
        entity.body.x = Math.max(this.arenaLeft + 15, Math.min(this.arenaRight - 15, entity.body.x));

        // Update container position
        entity.x = entity.body.x + 15;
        entity.y = entity.body.y + 25;
    }

    checkPlatformCollision(body, platform) {
        const wasAbove = body.y + body.velocityY * 0.016 <= platform.y;
        const isOverlapping =
            body.x + body.width / 2 > platform.x &&
            body.x - body.width / 2 < platform.x + platform.width &&
            body.y + body.height / 2 >= platform.y &&
            body.y - body.height / 2 <= platform.y + platform.height;

        return wasAbove && isOverlapping && body.velocityY >= 0;
    }

    animateWarrior(entity) {
        if (!entity.parts) return;

        // Walking animation
        if (entity.isWalking && entity.body.grounded) {
            entity.walkFrame += 0.2;
            const legOffset = Math.sin(entity.walkFrame) * 3;

            entity.parts.leftLeg.y = 15 + legOffset;
            entity.parts.rightLeg.y = 15 - legOffset;

            entity.parts.leftArm.y = -5 - legOffset;
            entity.parts.rightArm.y = -5 + legOffset;
        } else {
            entity.parts.leftLeg.y = 15;
            entity.parts.rightLeg.y = 15;
            entity.parts.leftArm.y = -5;
            entity.parts.rightArm.y = -5;
        }

        // Attack animation
        if (entity.isAttacking) {
            const armExtend = entity.body.facingRight ? 5 : -5;
            entity.parts.rightArm.x = 12 + armExtend;
        } else {
            entity.parts.rightArm.x = 12;
        }

        // Update weapon position
        this.updateWeaponPosition(entity);
    }

    updateWeaponPosition(player) {
        if (!player.weapon || !player.weapon.sprite) return;

        const weaponOffsetX = player.body.facingRight ? 20 : -20;
        const weaponOffsetY = -10;

        player.weapon.sprite.setPosition(
            player.x + weaponOffsetX * (player.scaleX || 1),
            player.y + weaponOffsetY
        );

        // Flip weapon with player
        if (player.weapon.type !== 'potion') {
            player.weapon.sprite.setScale(player.scaleX || 1, 1);
        }
    }

    updateWeapons(delta) {
        this.weapons = this.weapons.filter(weapon => {
            weapon.lifespan -= delta;

            // Fade out when expiring
            if (weapon.lifespan < 1000) {
                weapon.sprite.setAlpha(weapon.lifespan / 1000);
            }

            if (weapon.lifespan <= 0) {
                weapon.sprite.destroy();
                return false;
            }
            return true;
        });
    }

    checkWeaponPickups() {
        this.weapons.forEach((weapon, index) => {
            // Check player collision
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                weapon.sprite.x, weapon.sprite.y
            );

            if (dist < 30) {
                this.pickupWeapon(this.player, weapon, index);
                return;
            }

            // Check enemy collision
            this.enemies.forEach(enemy => {
                const distE = Phaser.Math.Distance.Between(
                    enemy.x, enemy.y,
                    weapon.sprite.x, weapon.sprite.y
                );

                if (distE < 30) {
                    this.pickupWeapon(enemy, weapon, index);
                }
            });
        });
    }

    pickupWeapon(entity, weapon, weaponIndex) {
        // Remove old weapon if exists
        if (entity.weapon && entity.weapon.sprite) {
            entity.weapon.sprite.destroy();
        }

        // Potion healing
        if (weapon.type === 'potion') {
            entity.health = Math.min(entity.stats.health, entity.health + 20);
            weapon.sprite.destroy();
            this.weapons.splice(weaponIndex, 1);

            if (window.audioManager) {
                window.audioManager.playSound('healthPickup');
            }

            // Show heal text
            const healText = this.add.text(entity.x, entity.y - 50, '+20 HP', {
                fontSize: '20px',
                fill: '#00ff00',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            this.tweens.add({
                targets: healText,
                y: healText.y - 30,
                alpha: 0,
                duration: 1000,
                onComplete: () => healText.destroy()
            });

            return;
        }

        // Equip weapon
        entity.weapon = {
            type: weapon.type,
            sprite: weapon.sprite
        };

        // Remove from weapons array
        this.weapons.splice(weaponIndex, 1);

        // Play sound
        if (window.audioManager) {
            window.audioManager.playSound('weaponPickup');
        }
    }

    checkCombat() {
        // Player attacks enemies
        if (this.player.isAttacking && this.player.weapon?.type !== 'gun') {
            this.enemies.forEach(enemy => {
                if (this.checkAttackHit(this.player, enemy)) {
                    const damage = this.calculateDamage(this.player);
                    this.applyDamage(this.player, enemy, damage);
                }
            });
        }

        // Enemies attack player
        this.enemies.forEach(enemy => {
            if (enemy.isAttacking && enemy.weapon?.type !== 'gun') {
                if (this.checkAttackHit(enemy, this.player)) {
                    const damage = this.calculateDamage(enemy);
                    this.applyDamage(enemy, this.player, damage);
                }
            }
        });
    }

    checkAttackHit(attacker, target) {
        const hitboxRange = 60;
        const distX = target.x - attacker.x;
        const distY = target.y - attacker.y;
        const distance = Math.sqrt(distX * distX + distY * distY);

        const inFront = Math.sign(distX) === (attacker.body.facingRight ? 1 : -1);

        return distance < hitboxRange && inFront && Math.abs(distY) < 30;
    }

    calculateDamage(attacker) {
        let damage = attacker.stats.damage;

        // Weapon modifiers
        if (attacker.weapon) {
            switch (attacker.weapon.type) {
                case 'sword':
                    damage *= 2;
                    break;
                case 'gun':
                    damage *= 1.5;
                    break;
            }
        }

        return Math.floor(damage);
    }

    applyDamage(attacker, target, damage) {
        // Shield reduction
        let finalDamage = damage;
        if (target.weapon && target.weapon.type === 'shield') {
            finalDamage = Math.floor(damage * 0.5);
        }

        target.health -= finalDamage;

        // Damage text
        const damageColor = target.weapon?.type === 'shield' ? '#66ccff' : '#ff4444';
        const damageText = this.add.text(target.x, target.y - 50, `-${finalDamage}`, {
            fontSize: '24px',
            fontStyle: 'bold',
            fill: damageColor,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.tweens.add({
            targets: damageText,
            y: damageText.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => damageText.destroy()
        });

        // Knockback
        const knockbackDirection = target.x > attacker.x ? 1 : -1;
        const knockbackForce = attacker.weapon?.type === 'sword' ? 400 : 200;
        target.body.velocityX = knockbackDirection * knockbackForce;
        target.knockbackTime = 300;

        // Screen shake
        this.cameras.main.shake(150, 0.01);

        // Play hit sound
        if (window.audioManager) {
            window.audioManager.playSound('heavyHit');
        }

        // Check if enemy died
        if (target.health <= 0) {
            if (target !== this.player) {
                this.removeEnemy(target);
            }
        }
    }

    removeEnemy(enemy) {
        enemy.destroy();
        if (enemy.healthBar) enemy.healthBar.destroy();
        if (enemy.healthBarBg) enemy.healthBarBg.destroy();
        if (enemy.attackHitbox) enemy.attackHitbox.destroy();
        if (enemy.weapon && enemy.weapon.sprite) enemy.weapon.sprite.destroy();

        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
    }

    checkConditions() {
        // Player death
        if (this.player.health <= 0 && !this.gameEnded) {
            this.gameEnded = true;
            this.showGameOver();
        }

        // Stage complete
        if (this.enemies.length === 0 && !this.stageComplete && !this.gameEnded) {
            this.stageComplete = true;
            this.showStageComplete();
        }
    }

    showGameOver() {
        const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.85);

        this.add.text(640, 200, 'SURVIVAL ENDED', {
            fontSize: '64px',
            fontStyle: 'bold',
            fill: '#e74c3c',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(640, 280, `You survived ${this.currentStage - 1} ${this.currentStage === 2 ? 'stage' : 'stages'}!`, {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Final stats
        this.add.text(640, 340, 'Final Stats:', {
            fontSize: '24px',
            fill: '#fbbf24',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(640, 380, `Damage: ${this.player.stats.damage}  |  Speed: ${Math.floor(this.player.stats.speed)}  |  Max HP: ${this.player.stats.maxHealth}`, {
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Return button
        const returnButton = this.add.rectangle(640, 480, 300, 60, 0x8b5cf6).setInteractive();
        this.add.text(640, 480, 'RETURN TO MENU', {
            fontSize: '24px',
            fontStyle: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);

        returnButton.on('pointerdown', () => {
            if (window.audioManager) {
                window.audioManager.playSound('buttonClick');
            }
            this.scene.start('MainMenuScene');
        });

        returnButton.on('pointerover', () => {
            returnButton.setFillStyle(0xa78bfa);
        });

        returnButton.on('pointerout', () => {
            returnButton.setFillStyle(0x8b5cf6);
        });

        // Play game over sound
        if (window.audioManager) {
            window.audioManager.stopMusic();
        }
    }

    showStageComplete() {
        const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.9);

        this.add.text(640, 120, 'STAGE COMPLETE!', {
            fontSize: '56px',
            fontStyle: 'bold',
            fill: '#27ae60',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Stage 50 victory
        if (this.currentStage === 50) {
            this.add.text(640, 220, '👑 YOU CONQUERED THE THRONE! 👑', {
                fontSize: '36px',
                fontStyle: 'bold',
                fill: '#fbbf24'
            }).setOrigin(0.5);

            this.add.text(640, 280, 'All 50 stages completed!', {
                fontSize: '24px',
                fill: '#ffffff'
            }).setOrigin(0.5);

            const returnButton = this.add.rectangle(640, 400, 300, 60, 0x8b5cf6).setInteractive();
            this.add.text(640, 400, 'RETURN TO MENU', {
                fontSize: '24px',
                fontStyle: 'bold',
                fill: '#ffffff'
            }).setOrigin(0.5);

            returnButton.on('pointerdown', () => {
                if (window.audioManager) {
                    window.audioManager.playSound('buttonClick');
                }
                this.scene.start('MainMenuScene');
            });

            // Play victory music
            if (window.audioManager) {
                window.audioManager.stopMusic();
                window.audioManager.playMusic('victoryMusic');
            }

            return;
        }

        // Regular stage complete - choose reward
        this.add.text(640, 200, 'Choose your reward:', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const rewards = [
            { label: 'HEAL +30 HP', type: 'heal', color: 0x27ae60 },
            { label: '+5 MAX HEALTH', type: 'maxhealth', color: 0x3498db },
            { label: '+1 DAMAGE', type: 'damage', color: 0xe74c3c },
            { label: '+3% SPEED', type: 'speed', color: 0xf39c12 }
        ];

        rewards.forEach((reward, index) => {
            const yPos = 280 + index * 70;
            const button = this.add.rectangle(640, yPos, 400, 50, reward.color).setInteractive();
            const text = this.add.text(640, yPos, reward.label, {
                fontSize: '20px',
                fontStyle: 'bold',
                fill: '#ffffff'
            }).setOrigin(0.5);

            button.on('pointerdown', () => {
                if (window.audioManager) {
                    window.audioManager.playSound('buttonClick');
                }
                this.applyReward(reward.type);
            });

            button.on('pointerover', () => {
                button.setFillStyle(Phaser.Display.Color.GetColor(
                    Math.min(255, Phaser.Display.Color.IntegerToRGB(reward.color).r + 40),
                    Math.min(255, Phaser.Display.Color.IntegerToRGB(reward.color).g + 40),
                    Math.min(255, Phaser.Display.Color.IntegerToRGB(reward.color).b + 40)
                ));
                if (window.audioManager) {
                    window.audioManager.playSound('buttonHover');
                }
            });

            button.on('pointerout', () => {
                button.setFillStyle(reward.color);
            });
        });

        // Play sound
        if (window.audioManager) {
            window.audioManager.playSound('battleStart');
        }
    }

    applyReward(type) {
        const updatedStats = { ...this.playerStats };

        switch (type) {
            case 'heal':
                updatedStats.health = Math.min(updatedStats.maxHealth, updatedStats.health + 30);
                break;
            case 'maxhealth':
                updatedStats.maxHealth += 5;
                updatedStats.health += 5;
                break;
            case 'damage':
                updatedStats.damage += 1;
                break;
            case 'speed':
                updatedStats.speed = Math.floor(updatedStats.speed * 1.03);
                break;
        }

        // Go to next stage
        this.scene.start('SurvivalModeScene', {
            stage: this.currentStage + 1,
            playerStats: updatedStats
        });
    }
}
