class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Start menu music (will only work after user interaction)
        if (window.audioManager) {
            window.audioManager.stopMusic();
            window.audioManager.playMusic('menuMusic');

            // If user hasn't interacted yet, start music on first interaction
            if (!window.audioManager.userHasInteracted) {
                const startMusicOnInteraction = () => {
                    if (window.audioManager && window.audioManager.userHasInteracted) {
                        window.audioManager.playMusic('menuMusic');
                        document.removeEventListener('click', startMusicOnInteraction);
                        document.removeEventListener('keydown', startMusicOnInteraction);
                        document.removeEventListener('touchstart', startMusicOnInteraction);
                    }
                };

                document.addEventListener('click', startMusicOnInteraction);
                document.addEventListener('keydown', startMusicOnInteraction);
                document.addEventListener('touchstart', startMusicOnInteraction);
            }
        }

        // Animated background particles
        this.createBackgroundParticles();

        // Main title with enhanced styling
        const titleContainer = this.add.container(centerX, 120);

        // Title background glow
        const titleBg = this.add.rectangle(0, 0, 900, 120, 0x8b5cf6, 0.1)
            .setStrokeStyle(2, 0x8b5cf6, 0.3);
        titleContainer.add(titleBg);

        // Title shadow
        const titleShadow = this.add.text(3, 3, 'THRONE OF VALOR', {
            fontSize: '56px',
            fill: '#000000',
            fontStyle: 'bold',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5).setAlpha(0.4);
        titleContainer.add(titleShadow);

        // Main title
        const mainTitle = this.add.text(0, 0, 'THRONE OF VALOR', {
            fontSize: '56px',
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial Black',
            stroke: '#8b5cf6',
            strokeThickness: 3
        }).setOrigin(0.5);
        titleContainer.add(mainTitle);

        // Title animations
        this.tweens.add({
            targets: titleContainer,
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Selection section header
        this.add.text(centerX, 280, 'SELECT TOURNAMENT SIZE', {
            fontSize: '28px',
            fill: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Player count buttons with card-like design
        const playerCounts = [2, 4, 8, 16];
        const buttonY = 410;
        const buttonSpacing = 200;
        const startX = centerX - ((playerCounts.length - 1) * buttonSpacing) / 2;

        playerCounts.forEach((count, index) => {
            const buttonX = startX + (index * buttonSpacing);

            // Card container
            const cardContainer = this.add.container(buttonX, buttonY);

            // Card shadow
            const cardShadow = this.add.rectangle(4, 4, 160, 120, 0x000000, 0.3);
            cardContainer.add(cardShadow);

            // Card background
            const cardBg = this.add.rectangle(0, 0, 160, 120, 0x1e293b)
                .setStrokeStyle(3, 0x8b5cf6);
            cardContainer.add(cardBg);

            // Player count circle
            const circle = this.add.circle(0, -20, 25, 0x8b5cf6);
            cardContainer.add(circle);

            // Player count number
            const countText = this.add.text(0, -20, count.toString(), {
                fontSize: '28px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            cardContainer.add(countText);

            // Players label
            const labelText = this.add.text(0, 15, 'PLAYERS', {
                fontSize: '14px',
                fill: '#94a3b8',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            cardContainer.add(labelText);

            // Difficulty indicator
            const difficulty = count <= 4 ? 'QUICK' : count <= 8 ? 'STANDARD' : 'EPIC';
            const diffColor = count <= 4 ? '#10b981' : count <= 8 ? '#f59e0b' : '#ef4444';
            const diffText = this.add.text(0, 35, difficulty, {
                fontSize: '10px',
                fill: diffColor,
                fontStyle: 'bold'
            }).setOrigin(0.5);
            cardContainer.add(diffText);

            // Make card interactive
            cardBg.setInteractive();

            // Hover animations
            cardBg.on('pointerover', () => {
                // Play hover sound
                if (window.audioManager) {
                    window.audioManager.playSound('buttonHover');
                }

                cardBg.setFillStyle(0x374151);
                cardBg.setStrokeStyle(3, 0xa855f7);
                this.tweens.add({
                    targets: cardContainer,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 200,
                    ease: 'Back.easeOut'
                });
            });

            cardBg.on('pointerout', () => {
                cardBg.setFillStyle(0x1e293b);
                cardBg.setStrokeStyle(3, 0x8b5cf6);
                this.tweens.add({
                    targets: cardContainer,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'Back.easeOut'
                });
            });

            cardBg.on('pointerdown', () => {
                // Play click sound
                if (window.audioManager) {
                    window.audioManager.playSound('buttonClick');
                }

                this.tweens.add({
                    targets: cardContainer,
                    scaleX: 0.95,
                    scaleY: 0.95,
                    duration: 100,
                    yoyo: true,
                    onComplete: () => this.selectPlayerCount(count)
                });
            });
        });

        // Instructions
        this.add.text(centerX, 560, 'Choose your tournament size — and let the battle for valor begin!', {
            fontSize: '18px',
            fill: '#94a3b8',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

    }

    createBackgroundParticles() {
        // Create floating particles for ambiance
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            const size = Phaser.Math.Between(2, 6);

            const particle = this.add.circle(x, y, size, 0x8b5cf6, 0.3);

            this.tweens.add({
                targets: particle,
                y: y - 100,
                alpha: 0,
                duration: Phaser.Math.Between(3000, 6000),
                ease: 'Linear',
                repeat: -1,
                onRepeat: () => {
                    particle.x = Phaser.Math.Between(0, this.cameras.main.width);
                    particle.y = this.cameras.main.height + 10;
                    particle.alpha = 0.3;
                }
            });
        }
    }

    selectPlayerCount(count) {
        const tournamentData = this.registry.get('tournamentData');

        // Reset all tournament data when selecting new player count
        tournamentData.playerCount = count;
        tournamentData.players = [];
        tournamentData.bracket = [];
        tournamentData.currentRound = 1;
        tournamentData.currentMatch = 0;

        // Initialize players
        for (let i = 1; i <= count; i++) {
            tournamentData.players.push({
                id: i,
                name: `Player ${i}`,
                statChoice: 'damage',
                eliminated: false
            });
        }

        this.registry.set('tournamentData', tournamentData);
        this.scene.start('TournamentBracketScene');
    }
}