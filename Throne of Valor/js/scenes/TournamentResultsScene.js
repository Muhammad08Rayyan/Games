class TournamentResultsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TournamentResultsScene' });
    }

    create() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        const tournamentData = this.registry.get('tournamentData');

        // Play victory music and fanfare (stop any previous music first)
        if (window.audioManager) {
            window.audioManager.stopMusic();
            window.audioManager.playMusic('victoryMusic');
            window.audioManager.playSound('victory');
        }

        // Animated background
        this.createCelebrationBackground();

        // Get tournament champion
        const champion = this.getTournamentChampion();

        if (champion) {
            // Champion section with better spacing
            const championY = 120;

            // Championship crown
            const crown = this.add.text(centerX, championY - 40, '👑', {
                fontSize: '48px'
            }).setOrigin(0.5);

            // Champion name with royal styling
            const championNameBg = this.add.rectangle(centerX, championY + 20, 500, 60, 0x1e293b, 0.9)
                .setStrokeStyle(3, 0xfbbf24);

            const championName = this.add.text(centerX, championY + 20, champion.name, {
                fontSize: '36px',
                fill: '#fbbf24',
                fontStyle: 'bold',
                fontFamily: 'Arial Black'
            }).setOrigin(0.5);

            // Title
            const title = this.add.text(centerX, championY + 60, 'CHAMPION OF THE THRONE', {
                fontSize: '18px',
                fill: '#e2e8f0',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Subtle animations
            this.tweens.add({
                targets: crown,
                rotation: 0.05,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.tweens.add({
                targets: championName,
                scaleX: 1.02,
                scaleY: 1.02,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Display complete tournament bracket
        this.displayCompleteTournament();

        // Action buttons section
        this.createActionButtons();


    }

    getTournamentChampion() {
        const tournamentData = this.registry.get('tournamentData');
        const finalRound = tournamentData.bracket[tournamentData.bracket.length - 1];
        if (finalRound && finalRound.matches.length > 0) {
            const finalMatch = finalRound.matches[0];
            return finalMatch.winner;
        }
        return null;
    }

    displayCompleteTournament() {
        const tournamentData = this.registry.get('tournamentData');
        const bracket = tournamentData.bracket;
        const playerCount = tournamentData.playerCount;

        // Calculate layout for results display
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        const rounds = bracket.length;

        // Much better scaling for 8-16 player tournaments
        const availableWidth = gameWidth - 60;
        const minSpacing = playerCount <= 4 ? 260 : (playerCount <= 8 ? 140 : 90);
        const roundSpacing = Math.min(Math.max(minSpacing, availableWidth / rounds), availableWidth / rounds);
        const startX = Math.max(30, (gameWidth - (rounds - 1) * roundSpacing) / 2);

        // Enhanced bracket section header with proper spacing
        const bracketHeaderY = 220;
        const bracketHeaderBg = this.add.rectangle(this.cameras.main.centerX, bracketHeaderY, 500, 40, 0x1e293b, 0.9)
            .setStrokeStyle(2, 0x8b5cf6);

        this.add.text(this.cameras.main.centerX, bracketHeaderY, 'GAUNTLET RESULTS', {
            fontSize: '20px',
            fill: '#fbbf24',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        bracket.forEach((round, roundIndex) => {
            const roundX = startX + (roundIndex * roundSpacing);
            const matchCount = round.matches.length;

            // Calculate match positioning with proper spacing
            const availableHeight = gameHeight - 350; // Better height management
            const minMatchSpacing = playerCount <= 4 ? 80 : (playerCount <= 8 ? 50 : 30);
            const matchSpacing = Math.max(minMatchSpacing, availableHeight / Math.max(matchCount, 1));
            const startY = 250 + Math.max(0, (availableHeight - (matchCount - 1) * matchSpacing) / 2);

            // Round header with special styling for final
            const isFinal = roundIndex === rounds - 1;
            const headerColor = isFinal ? 0xfbbf24 : 0x8b5cf6;
            const headerText = isFinal ? 'FINAL' : `Round ${round.round}`;

            const headerBg = this.add.rectangle(roundX, 280, roundSpacing - 20, 35, headerColor, 0.8)
                .setStrokeStyle(2, headerColor);

            this.add.text(roundX, 280, headerText, {
                fontSize: isFinal ? '18px' : '16px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Display matches
            round.matches.forEach((match, matchIndex) => {
                const matchY = startY + (matchIndex * matchSpacing);
                this.displayMatchResult(roundX, matchY, match, isFinal);
            });
        });

        // Tournament stats at bottom left (same height as button)
        this.displayTournamentStats(tournamentData, gameHeight - 60);
    }

    createCelebrationBackground() {
        // Create confetti effect
        this.createConfetti();
    }

    createConfetti() {
        const colors = [0xfbbf24, 0x8b5cf6, 0x10b981, 0xef4444, 0xff6b6b, 0x4ecdc4];
        const shapes = ['rectangle', 'triangle', 'star'];

        // Initial burst from center
        for (let i = 0; i < 50; i++) {
            this.time.delayedCall(i * 60, () => {
                this.createConfettiPiece(colors, shapes, 'burst');
            });
        }

        // Continuous shower for 3 seconds
        for (let i = 0; i < 30; i++) {
            this.time.delayedCall(1000 + i * 100, () => {
                this.createConfettiPiece(colors, shapes, 'shower');
            });
        }
    }

    createConfettiPiece(colors, shapes, type) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];

        let confetti;
        const size = Phaser.Math.Between(4, 12);

        if (type === 'burst') {
            // Burst from center
            const startX = this.cameras.main.centerX;
            const startY = this.cameras.main.centerY - 100;

            if (shape === 'rectangle') {
                confetti = this.add.rectangle(startX, startY, size, size * 2, color);
            } else if (shape === 'triangle') {
                confetti = this.add.triangle(startX, startY, 0, size, size/2, -size, -size/2, -size, color);
            } else {
                confetti = this.add.star(startX, startY, 5, size/2, size, color);
            }

            const angle = Math.random() * Math.PI * 2;
            const velocity = Phaser.Math.Between(100, 300);
            const targetX = startX + Math.cos(angle) * velocity;
            const targetY = startY + Math.sin(angle) * velocity + Phaser.Math.Between(200, 400);

            this.tweens.add({
                targets: confetti,
                x: targetX,
                y: targetY,
                rotation: Math.random() * Math.PI * 4,
                alpha: 0,
                scaleX: 0.1,
                scaleY: 0.1,
                duration: 3000,
                ease: 'Cubic.easeOut'
            });
        } else {
            // Shower from top
            const startX = Phaser.Math.Between(0, this.cameras.main.width);
            const startY = -20;

            if (shape === 'rectangle') {
                confetti = this.add.rectangle(startX, startY, size, size * 2, color);
            } else if (shape === 'triangle') {
                confetti = this.add.triangle(startX, startY, 0, size, size/2, -size, -size/2, -size, color);
            } else {
                confetti = this.add.star(startX, startY, 5, size/2, size, color);
            }

            this.tweens.add({
                targets: confetti,
                y: this.cameras.main.height + 50,
                x: startX + Phaser.Math.Between(-100, 100),
                rotation: Math.random() * Math.PI * 6,
                duration: Phaser.Math.Between(2000, 3500),
                ease: 'Linear'
            });
        }
    }

    createActionButtons() {
        const buttonY = this.cameras.main.height - 60;
        const buttonX = this.cameras.main.width - 200; // Position to the right

        // New Tournament button positioned to the right
        const newTournamentShadow = this.add.rectangle(buttonX + 3, buttonY + 3, 300, 50, 0x000000, 0.3);
        const newTournamentButton = this.add.rectangle(buttonX, buttonY, 300, 50, 0x8b5cf6)
            .setInteractive()
            .setStrokeStyle(3, 0xa855f7);

        const newTournamentGlow = this.add.rectangle(buttonX, buttonY, 320, 70, 0x8b5cf6, 0.2);

        this.add.text(buttonX, buttonY, 'START NEW TOURNAMENT', {
            fontSize: '18px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Button interactions
        newTournamentButton.on('pointerdown', () => {
            // Play click sound
            if (window.audioManager) {
                window.audioManager.playSound('buttonClick');
            }
            this.newTournament();
        });
        newTournamentButton.on('pointerover', () => {
            // Play hover sound
            if (window.audioManager) {
                window.audioManager.playSound('buttonHover');
            }
            newTournamentButton.setFillStyle(0xa855f7);
            newTournamentGlow.setAlpha(0.4);
        });
        newTournamentButton.on('pointerout', () => {
            newTournamentButton.setFillStyle(0x8b5cf6);
            newTournamentGlow.setAlpha(0.2);
        });
    }

    displayMatchResult(x, y, match, isFinal = false) {
        const tournamentData = this.registry.get('tournamentData');
        const playerCount = tournamentData.playerCount;
        const isCompleted = match.completed;

        // Dynamic sizing based on player count
        const containerWidth = isFinal ?
            (playerCount <= 4 ? 280 : (playerCount <= 8 ? 240 : 180)) :
            (playerCount <= 4 ? 220 : (playerCount <= 8 ? 170 : 110));
        const containerSize = isFinal ?
            (playerCount <= 4 ? 140 : (playerCount <= 8 ? 120 : 90)) :
            (playerCount <= 4 ? 100 : (playerCount <= 8 ? 75 : 45));

        // Match container with special styling for final
        const containerColor = isFinal ? 0xfbbf24 : (isCompleted ? 0x10b981 : 0x1e293b);
        const borderColor = isFinal ? 0xf59e0b : (isCompleted ? 0x059669 : 0x475569);

        const matchContainer = this.add.rectangle(x, y, containerWidth, containerSize, containerColor, 0.8)
            .setStrokeStyle(3, borderColor);

        // Glow effect for completed matches
        if (isCompleted) {
            const glowColor = isFinal ? 0xfbbf24 : 0x10b981;
            const glow = this.add.rectangle(x, y, containerWidth + 10, containerSize + 10, glowColor, 0.2);
        }

        // Player display
        const player1Color = match.winner === match.player1 ? '#fbbf24' : '#94a3b8';
        const player2Color = match.winner === match.player2 ? '#fbbf24' : '#94a3b8';

        const player1Text = match.winner === match.player1 ? `👑 ${match.player1.name}` : match.player1.name;
        const player2Text = match.winner === match.player2 ? `👑 ${match.player2.name}` : match.player2.name;

        // Dynamic font sizes and spacing
        const fontSize = isFinal ?
            (playerCount <= 4 ? '18px' : (playerCount <= 8 ? '15px' : '12px')) :
            (playerCount <= 4 ? '14px' : (playerCount <= 8 ? '11px' : '9px'));
        const spacing = isFinal ?
            (playerCount <= 4 ? 35 : (playerCount <= 8 ? 28 : 20)) :
            (playerCount <= 4 ? 25 : (playerCount <= 8 ? 18 : 12));

        this.add.text(x, y - spacing/2, player1Text, {
            fontSize: fontSize,
            fill: player1Color,
            fontStyle: match.winner === match.player1 ? 'bold' : 'normal'
        }).setOrigin(0.5);

        // VS divider
        const divider = this.add.rectangle(x, y, containerWidth - 40, 2, 0x64748b);
        const vsSize = isFinal ?
            (playerCount <= 4 ? '14px' : (playerCount <= 8 ? '12px' : '10px')) :
            (playerCount <= 4 ? '10px' : (playerCount <= 8 ? '9px' : '8px'));
        this.add.text(x, y, 'VS', {
            fontSize: vsSize,
            fill: '#94a3b8',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(x, y + spacing/2, player2Text, {
            fontSize: fontSize,
            fill: player2Color,
            fontStyle: match.winner === match.player2 ? 'bold' : 'normal'
        }).setOrigin(0.5);
    }

    displayTournamentStats(tournamentData, yPosition = 750) {
        const statsY = yPosition;
        const statsX = 300; // Position to the left

        // Stats background - positioned to bottom left
        const statsBg = this.add.rectangle(statsX, statsY, 500, 80, 0x1e293b, 0.8)
            .setStrokeStyle(2, 0x475569);

        this.add.text(statsX, statsY - 35, 'TOURNAMENT STATS', {
            fontSize: '16px',
            fill: '#8b5cf6',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const totalMatches = tournamentData.bracket.reduce((total, round) => total + round.matches.length, 0);
        const totalRounds = tournamentData.bracket.length;

        // Arrange stats in two rows for better space usage
        const statSpacing = 120;
        const rowSpacing = 20;

        // First row
        this.add.text(statsX - statSpacing, statsY - 15, `${tournamentData.playerCount} Players`, {
            fontSize: '13px',
            fill: '#e2e8f0',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(statsX + statSpacing, statsY - 15, `${totalRounds} Rounds`, {
            fontSize: '13px',
            fill: '#e2e8f0',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Second row
        this.add.text(statsX - statSpacing, statsY + 5, `${totalMatches} Matches`, {
            fontSize: '13px',
            fill: '#e2e8f0',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(statsX + statSpacing, statsY + 5, `${tournamentData.playerCount - 1} Eliminations`, {
            fontSize: '13px',
            fill: '#e2e8f0',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(statsX, statsY + 30, 'Honor in the Gauntlet of Valor', {
            fontSize: '11px',
            fill: '#94a3b8',
            fontStyle: 'italic'
        }).setOrigin(0.5);
    }

    newTournament() {
        // Reset tournament data
        const tournamentData = this.registry.get('tournamentData');
        tournamentData.playerCount = 0;
        tournamentData.players = [];
        tournamentData.bracket = [];
        tournamentData.currentRound = 1;
        tournamentData.currentMatch = 0;
        this.registry.set('tournamentData', tournamentData);

        this.scene.start('MainMenuScene');
    }
}