class TournamentBracketScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TournamentBracketScene' });
    }

    create() {
        const tournamentData = this.registry.get('tournamentData');

        // Only generate bracket if it doesn't exist or is empty
        if (!tournamentData.bracket || tournamentData.bracket.length === 0) {
            this.generateBracket();
        }

        // Check if we need to advance to next round before displaying
        this.checkAndAdvanceRounds();
        this.displayBracket();
    }

    generateBracket() {
        const tournamentData = this.registry.get('tournamentData');
        const players = [...tournamentData.players];

        // Shuffle players for random bracket
        for (let i = players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [players[i], players[j]] = [players[j], players[i]];
        }

        // Create bracket structure properly
        tournamentData.bracket = [];
        let currentRoundPlayers = [...players];
        let roundNumber = 1;

        // Generate all rounds until we have a winner
        while (currentRoundPlayers.length > 1) {
            const roundMatches = [];

            // Create matches for current round
            for (let i = 0; i < currentRoundPlayers.length; i += 2) {
                if (i + 1 < currentRoundPlayers.length) {
                    roundMatches.push({
                        player1: currentRoundPlayers[i],
                        player2: currentRoundPlayers[i + 1],
                        winner: null,
                        completed: false
                    });
                }
            }

            // Add round to bracket
            tournamentData.bracket.push({
                round: roundNumber,
                matches: roundMatches
            });

            // Prepare placeholder players for next round
            const nextRoundPlayerCount = Math.ceil(currentRoundPlayers.length / 2);
            currentRoundPlayers = [];
            for (let i = 0; i < nextRoundPlayerCount; i++) {
                currentRoundPlayers.push({ id: `placeholder_${i}`, name: 'TBD' });
            }
            roundNumber++;
        }

        // Only reset tournament state if this is a new tournament
        if (tournamentData.currentRound === 0 || !tournamentData.currentRound) {
            tournamentData.currentRound = 1;
            tournamentData.currentMatch = 0;
        }
        this.registry.set('tournamentData', tournamentData);
    }

    displayBracket() {
        // Clear any existing bracket display first
        this.children.removeAll();

        // Recreate title
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        this.add.text(centerX, 50, 'GAUNTLET OF VALOR', {
            fontSize: '36px',
            fill: '#ff6b6b',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const tournamentData = this.registry.get('tournamentData');
        this.add.text(centerX, 90, `${tournamentData.playerCount} Player Tournament`, {
            fontSize: '20px',
            fill: '#ffd93d'
        }).setOrigin(0.5);

        // Recreate back button
        const buttonY = this.cameras.main.height - 80;
        const backButton = this.add.rectangle(150, buttonY, 200, 50, 0x6b7280)
            .setInteractive()
            .setStrokeStyle(2, 0x9ca3af);

        this.add.text(150, buttonY, '← BACK TO MENU', {
            fontSize: '16px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        backButton.on('pointerdown', () => {
            if (window.audioManager) {
                window.audioManager.playSound('buttonClick');
            }
            this.backToMenu();
        });
        backButton.on('pointerover', () => {
            if (window.audioManager) {
                window.audioManager.playSound('buttonHover');
            }
            backButton.setFillStyle(0x9ca3af);
        });
        backButton.on('pointerout', () => backButton.setFillStyle(0x6b7280));

        // Show continue button if tournament has started
        const hasStarted = tournamentData.bracket.some(round =>
            round.matches.some(match => match.completed)
        );

        if (hasStarted) {
            const continueButton = this.add.rectangle(centerX, buttonY, 220, 60, 0x8b5cf6)
                .setInteractive()
                .setStrokeStyle(3, 0xa855f7);

            this.add.text(centerX, buttonY, 'CONTINUE TOURNAMENT', {
                fontSize: '16px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            continueButton.on('pointerdown', () => {
                if (window.audioManager) {
                    window.audioManager.playSound('buttonClick');
                }
                this.continueTournament();
            });
            continueButton.on('pointerover', () => {
                if (window.audioManager) {
                    window.audioManager.playSound('buttonHover');
                }
                continueButton.setFillStyle(0xa855f7);
            });
            continueButton.on('pointerout', () => continueButton.setFillStyle(0x8b5cf6));
        } else {
            // Start Tournament button if tournament hasn't started
            const startButton = this.add.rectangle(centerX, buttonY, 200, 60, 0x10b981)
                .setInteractive()
                .setStrokeStyle(3, 0x059669);

            this.add.text(centerX, buttonY, 'START TOURNAMENT', {
                fontSize: '18px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            startButton.on('pointerdown', () => {
                if (window.audioManager) {
                    window.audioManager.playSound('buttonClick');
                }
                this.startTournament();
            });
            startButton.on('pointerover', () => {
                if (window.audioManager) {
                    window.audioManager.playSound('buttonHover');
                }
                startButton.setFillStyle(0x059669);
            });
            startButton.on('pointerout', () => startButton.setFillStyle(0x10b981));
        }

        const bracket = tournamentData.bracket;
        const playerCount = tournamentData.playerCount;

        // Calculate dynamic layout based on player count
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        const rounds = bracket.length;

        // Much better spacing calculation for larger tournaments
        const availableWidth = gameWidth - 60; // Even smaller margins
        const minRoundSpacing = playerCount <= 4 ? 280 : (playerCount <= 8 ? 180 : 120);
        const roundSpacing = Math.min(Math.max(minRoundSpacing, availableWidth / rounds), availableWidth / rounds);
        const startX = Math.max(30, (gameWidth - (rounds - 1) * roundSpacing) / 2);

        bracket.forEach((round, roundIndex) => {
            const roundX = startX + (roundIndex * roundSpacing);
            const matchCount = round.matches.length;

            // Calculate match spacing and start position - optimized for 16 players
            const availableHeight = gameHeight - 320; // More space for matches
            const minMatchSpacing = playerCount <= 4 ? 120 : (playerCount <= 8 ? 80 : 45);
            const matchSpacing = Math.max(minMatchSpacing, availableHeight / Math.max(matchCount, 1));
            const startY = 200 + Math.max(0, (availableHeight - (matchCount - 1) * matchSpacing) / 2);

            // Round header with gradient background
            const headerBg = this.add.rectangle(roundX, 160, roundSpacing - 20, 40, 0x8b5cf6)
                .setStrokeStyle(2, 0xa855f7);

            this.add.text(roundX, 160, `Round ${round.round}`, {
                fontSize: '20px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Matches with improved styling and connecting lines
            round.matches.forEach((match, matchIndex) => {
                const matchY = startY + (matchIndex * matchSpacing);
                const isCompleted = match.completed;

                // Match container with better sizing for large tournaments
                const containerColor = isCompleted ? 0x10b981 : 0x1e293b;
                const borderColor = isCompleted ? 0x059669 : 0x475569;

                const containerWidth = playerCount <= 4 ? 240 : (playerCount <= 8 ? 170 : 110);
                const containerHeight = playerCount <= 4 ? 110 : (playerCount <= 8 ? 75 : 40);

                const matchContainer = this.add.rectangle(roundX, matchY, containerWidth, containerHeight, containerColor)
                    .setStrokeStyle(2, borderColor);

                // Add subtle glow effect for completed matches
                if (isCompleted) {
                    const glow = this.add.rectangle(roundX, matchY, containerWidth + 10, containerHeight + 10, 0x10b981, 0.2);
                }


                // Player names with better styling
                const player1Color = match.winner === match.player1 ? '#fbbf24' : '#e2e8f0';
                const player2Color = match.winner === match.player2 ? '#fbbf24' : '#e2e8f0';

                const player1Text = match.winner === match.player1 ? `👑 ${match.player1.name}` : match.player1.name;
                const player2Text = match.winner === match.player2 ? `👑 ${match.player2.name}` : match.player2.name;

                // Dynamic font sizes based on player count
                const fontSize = playerCount <= 4 ? '16px' : (playerCount <= 8 ? '12px' : '9px');
                const vsSize = playerCount <= 4 ? '12px' : (playerCount <= 8 ? '9px' : '8px');
                const spacing = playerCount <= 4 ? 25 : (playerCount <= 8 ? 18 : 10);

                this.add.text(roundX, matchY - spacing/2, player1Text, {
                    fontSize: fontSize,
                    fill: player1Color,
                    fontStyle: match.winner === match.player1 ? 'bold' : 'normal'
                }).setOrigin(0.5);

                // VS divider with styling
                const dividerWidth = containerWidth - 40;
                const vsDivider = this.add.rectangle(roundX, matchY, dividerWidth, 1, 0x64748b);
                this.add.text(roundX, matchY, 'VS', {
                    fontSize: vsSize,
                    fill: '#94a3b8',
                    fontStyle: 'bold'
                }).setOrigin(0.5);

                this.add.text(roundX, matchY + spacing/2, player2Text, {
                    fontSize: fontSize,
                    fill: player2Color,
                    fontStyle: match.winner === match.player2 ? 'bold' : 'normal'
                }).setOrigin(0.5);
            });
        });
    }

    startTournament() {
        // Play tournament start fanfare
        if (window.audioManager) {
            window.audioManager.playSound('tournamentStart');
        }

        this.scene.start('InstructionsScene');
    }

    backToMenu() {
        // Reset tournament data when going back to main menu
        const tournamentData = this.registry.get('tournamentData');
        tournamentData.playerCount = 0;
        tournamentData.players = [];
        tournamentData.bracket = [];
        tournamentData.currentRound = 1;
        tournamentData.currentMatch = 0;
        this.registry.set('tournamentData', tournamentData);
        this.scene.start('MainMenuScene');
    }

    continueTournament() {
        // Find next match to play
        const tournamentData = this.registry.get('tournamentData');

        // Find the next uncompleted match in the current round
        const currentRound = tournamentData.bracket[tournamentData.currentRound - 1];
        if (currentRound) {
            let nextMatchIndex = -1;
            for (let i = 0; i < currentRound.matches.length; i++) {
                if (!currentRound.matches[i].completed) {
                    nextMatchIndex = i;
                    break;
                }
            }

            if (nextMatchIndex !== -1) {
                // Found an uncompleted match in current round
                tournamentData.currentMatch = nextMatchIndex;
                this.registry.set('tournamentData', tournamentData);
                this.scene.start('CharacterSelectionScene');
                return;
            } else {
                // All matches in current round are complete, advance to next round
                this.advanceToNextRoundAutomatically();
                return;
            }
        }

        // Check if tournament is complete
        const lastRound = tournamentData.bracket[tournamentData.bracket.length - 1];
        if (lastRound && lastRound.matches[0] && lastRound.matches[0].completed) {
            this.scene.start('TournamentResultsScene');
        }
    }

    advanceToNextRoundAutomatically() {
        const tournamentData = this.registry.get('tournamentData');

        // Check if tournament is complete
        const currentRound = tournamentData.bracket[tournamentData.currentRound - 1];
        const winners = currentRound.matches.map(match => match.winner);

        if (winners.length === 1) {
            // Tournament complete!
            this.scene.start('TournamentResultsScene');
            return;
        }

        // Create next round
        tournamentData.currentRound++;
        tournamentData.currentMatch = 0;

        // Update the next round's matches with winners
        if (tournamentData.bracket[tournamentData.currentRound - 1]) {
            const nextRound = tournamentData.bracket[tournamentData.currentRound - 1];

            // Update existing matches in next round with winners
            let winnerIndex = 0;
            for (let matchIndex = 0; matchIndex < nextRound.matches.length; matchIndex++) {
                const match = nextRound.matches[matchIndex];

                // Replace TBD players with actual winners
                if (winnerIndex < winners.length) {
                    match.player1 = winners[winnerIndex];
                    winnerIndex++;
                }
                if (winnerIndex < winners.length) {
                    match.player2 = winners[winnerIndex];
                    winnerIndex++;
                }

                // Reset match state
                match.winner = null;
                match.completed = false;
            }
        }

        this.registry.set('tournamentData', tournamentData);
        this.scene.start('CharacterSelectionScene');
    }

    checkAndAdvanceRounds() {
        const tournamentData = this.registry.get('tournamentData');
        let hasAdvanced = false;

        // Keep advancing rounds until we find an incomplete round or tournament ends
        while (true) {
            const currentRound = tournamentData.bracket[tournamentData.currentRound - 1];
            if (!currentRound) break;

            // Check if current round is complete
            const allMatchesComplete = currentRound.matches.every(match => match.completed);
            if (!allMatchesComplete) break;

            // Current round is complete, check if tournament is done
            const winners = currentRound.matches.map(match => match.winner);
            if (winners.length === 1) {
                // Tournament complete
                break;
            }

            // Advance to next round
            tournamentData.currentRound++;
            tournamentData.currentMatch = 0;

            // Update the next round's matches with winners
            if (tournamentData.bracket[tournamentData.currentRound - 1]) {
                const nextRound = tournamentData.bracket[tournamentData.currentRound - 1];

                let winnerIndex = 0;
                for (let matchIndex = 0; matchIndex < nextRound.matches.length; matchIndex++) {
                    const match = nextRound.matches[matchIndex];

                    // Replace TBD players with actual winners
                    if (winnerIndex < winners.length) {
                        match.player1 = winners[winnerIndex];
                        winnerIndex++;
                    }
                    if (winnerIndex < winners.length) {
                        match.player2 = winners[winnerIndex];
                        winnerIndex++;
                    }

                    // Reset match state
                    match.winner = null;
                    match.completed = false;
                }
                hasAdvanced = true;
            }
        }

        if (hasAdvanced) {
            this.registry.set('tournamentData', tournamentData);
        }
    }
}