class WinnerSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WinnerSelectionScene' });
    }

    create() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        const tournamentData = this.registry.get('tournamentData');

        // Get current match
        const currentMatch = this.getCurrentMatch();
        if (!currentMatch) {
            this.scene.start('TournamentBracketScene');
            return;
        }

        // Title
        this.add.text(centerX, 100, 'BATTLE OUTCOME', {
            fontSize: '36px',
            fill: '#ff6b6b',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Fighting info
        this.add.text(centerX, 160, `Round ${tournamentData.currentRound} - Match ${tournamentData.currentMatch + 1}`, {
            fontSize: '20px',
            fill: '#ffd93d'
        }).setOrigin(0.5);

        this.add.text(centerX, 200, `${currentMatch.player1.name} VS ${currentMatch.player2.name}`, {
            fontSize: '24px',
            fill: '#3498db'
        }).setOrigin(0.5);

        // Player stat display
        this.displayPlayerStats(currentMatch.player1, centerX - 200, 280);
        this.displayPlayerStats(currentMatch.player2, centerX + 200, 280);

        // Winner selection
        this.add.text(centerX, 450, 'DECLARE THE VICTOR!', {
            fontSize: '28px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Winner buttons with better positioning
        const buttonY = Math.min(550, this.cameras.main.height - 300);
        this.createWinnerButton(currentMatch.player1, centerX - 150, buttonY);
        this.createWinnerButton(currentMatch.player2, centerX + 150, buttonY);
    }

    displayPlayerStats(player, x, y) {
        // Player name
        this.add.text(x, y, player.name, {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Stat choice
        const statInfo = this.getStatInfo(player.statChoice);
        this.add.text(x, y + 30, statInfo.label, {
            fontSize: '16px',
            fill: statInfo.color
        }).setOrigin(0.5);

        this.add.text(x, y + 50, statInfo.desc, {
            fontSize: '14px',
            fill: '#95a5a6'
        }).setOrigin(0.5);
    }

    getStatInfo(choice) {
        const statMap = {
            damage: { label: 'PATH OF FURY', desc: 'Devastating power, risked frailty', color: '#e74c3c' },
            health: { label: 'PATH OF ENDURANCE', desc: 'Unbreakable form, tempered strike', color: '#27ae60' },
            balanced: { label: 'PATH OF BALANCE', desc: 'Ancient mastery achieved', color: '#3498db' }
        };
        return statMap[choice] || statMap.balanced;
    }

    createWinnerButton(player, x, y) {
        const button = this.add.rectangle(x, y, 200, 80, 0x8e44ad)
            .setInteractive()
            .setStrokeStyle(3, 0x9b59b6);

        this.add.text(x, y - 10, player.name, {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(x, y + 15, 'CLAIMS VICTORY!', {
            fontSize: '16px',
            fill: '#ecf0f1'
        }).setOrigin(0.5);

        button.on('pointerdown', () => {
            if (window.audioManager) {
                window.audioManager.playSound('buttonClick');
            }
            this.selectWinner(player);
        });
        button.on('pointerover', () => {
            if (window.audioManager) {
                window.audioManager.playSound('buttonHover');
            }
            button.setFillStyle(0x9b59b6);
        });
        button.on('pointerout', () => button.setFillStyle(0x8e44ad));
    }

    selectWinner(winner) {
        // Play winner announcement sound
        if (window.audioManager) {
            window.audioManager.playSound('winnerAnnounce');
        }

        const tournamentData = this.registry.get('tournamentData');
        const currentMatch = this.getCurrentMatch();

        // Set winner
        currentMatch.winner = winner;
        currentMatch.completed = true;

        // Mark loser as eliminated
        const loser = currentMatch.player1 === winner ? currentMatch.player2 : currentMatch.player1;
        loser.eliminated = true;

        this.registry.set('tournamentData', tournamentData);

        // Show winner announcement and proceed
        this.showWinnerAnnouncement(winner, loser);
    }

    showWinnerAnnouncement(winner, loser) {
        // Clear screen
        this.children.removeAll();

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Winner announcement
        this.add.text(centerX, centerY - 100, '🏆 WINNER! 🏆', {
            fontSize: '48px',
            fill: '#ffd93d',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY - 30, winner.name, {
            fontSize: '36px',
            fill: '#2ecc71',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 20, `defeats ${loser.name}`, {
            fontSize: '24px',
            fill: '#95a5a6'
        }).setOrigin(0.5);

        // Show different message based on if this is the final match
        const isFinalMatch = this.isFinalMatch();
        const message = isFinalMatch ?
            `The Throne of Valor belongs to ${winner.name}` :
            `${winner.name} proceeds to the next round`;

        this.add.text(centerX, centerY + 60, message, {
            fontSize: '20px',
            fill: '#fbbf24',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Continue buttons
        this.createContinueButtons(centerX, this.cameras.main.height - 120);
    }

    createContinueButtons(centerX, y) {
        const tournamentData = this.registry.get('tournamentData');

        // Check if this is the final match
        const isFinalMatch = this.isFinalMatch();

        if (isFinalMatch) {
            // Show only results button for final match
            const resultsShadow = this.add.rectangle(centerX + 3, y + 3, 250, 60, 0x000000, 0.3);
            const resultsButton = this.add.rectangle(centerX, y, 250, 60, 0xfbbf24)
                .setInteractive()
                .setStrokeStyle(3, 0xf59e0b);

            const resultsGlow = this.add.rectangle(centerX, y, 260, 70, 0xfbbf24, 0.2);

            this.add.text(centerX, y, 'VIEW FINAL RESULTS', {
                fontSize: '18px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            resultsButton.on('pointerdown', () => {
                if (window.audioManager) {
                    window.audioManager.playSound('buttonClick');
                }
                this.scene.start('TournamentResultsScene');
            });
            resultsButton.on('pointerover', () => {
                if (window.audioManager) {
                    window.audioManager.playSound('buttonHover');
                }
                resultsButton.setFillStyle(0xf59e0b);
                resultsGlow.setAlpha(0.4);
            });
            resultsButton.on('pointerout', () => {
                resultsButton.setFillStyle(0xfbbf24);
                resultsGlow.setAlpha(0.2);
            });
        } else {
            // Regular match buttons
            // Next round button with improved styling
            const nextShadow = this.add.rectangle(centerX - 117, y + 3, 200, 60, 0x000000, 0.3);
            const nextRoundButton = this.add.rectangle(centerX - 120, y, 200, 60, 0x10b981)
                .setInteractive()
                .setStrokeStyle(3, 0x059669);

            const nextGlow = this.add.rectangle(centerX - 120, y, 210, 70, 0x10b981, 0.2);

            this.add.text(centerX - 120, y, 'NEXT ROUND', {
                fontSize: '18px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Back to tournament button with improved styling
            const bracketShadow = this.add.rectangle(centerX + 123, y + 3, 200, 60, 0x000000, 0.3);
            const bracketButton = this.add.rectangle(centerX + 120, y, 200, 60, 0x8b5cf6)
                .setInteractive()
                .setStrokeStyle(3, 0xa855f7);

            const bracketGlow = this.add.rectangle(centerX + 120, y, 210, 70, 0x8b5cf6, 0.2);

            this.add.text(centerX + 120, y, 'VIEW BRACKET', {
                fontSize: '18px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Button interactions
            nextRoundButton.on('pointerdown', () => {
                if (window.audioManager) {
                    window.audioManager.playSound('buttonClick');
                }
                this.proceedToNextRound();
            });
            nextRoundButton.on('pointerover', () => {
                if (window.audioManager) {
                    window.audioManager.playSound('buttonHover');
                }
                nextRoundButton.setFillStyle(0x059669);
                nextGlow.setAlpha(0.4);
            });
            nextRoundButton.on('pointerout', () => {
                nextRoundButton.setFillStyle(0x10b981);
                nextGlow.setAlpha(0.2);
            });

            bracketButton.on('pointerdown', () => {
                if (window.audioManager) {
                    window.audioManager.playSound('buttonClick');
                }
                this.viewBracket();
            });
            bracketButton.on('pointerover', () => {
                if (window.audioManager) {
                    window.audioManager.playSound('buttonHover');
                }
                bracketButton.setFillStyle(0xa855f7);
                bracketGlow.setAlpha(0.4);
            });
            bracketButton.on('pointerout', () => {
                bracketButton.setFillStyle(0x8b5cf6);
                bracketGlow.setAlpha(0.2);
            });
        }
    }

    isFinalMatch() {
        const tournamentData = this.registry.get('tournamentData');
        const currentRound = tournamentData.bracket[tournamentData.currentRound - 1];

        // Check if this is the last round and it only has one match
        return tournamentData.currentRound === tournamentData.bracket.length &&
               currentRound && currentRound.matches.length === 1;
    }

    getCurrentMatch() {
        const tournamentData = this.registry.get('tournamentData');
        const currentRound = tournamentData.bracket[tournamentData.currentRound - 1];
        return currentRound ? currentRound.matches[tournamentData.currentMatch] : null;
    }

    proceedToNextRound() {
        const tournamentData = this.registry.get('tournamentData');

        // Move to next match
        tournamentData.currentMatch++;

        // Check if current round is complete
        const currentRound = tournamentData.bracket[tournamentData.currentRound - 1];
        if (tournamentData.currentMatch >= currentRound.matches.length) {
            // Round complete, advance to next round
            this.advanceToNextRound();
        } else {
            // More matches in current round
            this.registry.set('tournamentData', tournamentData);
            this.scene.start('CharacterSelectionScene');
        }
    }

    advanceToNextRound() {
        const tournamentData = this.registry.get('tournamentData');

        // Check if tournament is complete
        const currentRound = tournamentData.bracket[tournamentData.currentRound - 1];
        const winners = currentRound.matches.map(match => match.winner);

        if (winners.length === 1) {
            // Tournament complete!
            this.showTournamentWinner(winners[0]);
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

    showTournamentWinner(champion) {
        this.children.removeAll();

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Tournament winner announcement
        this.add.text(centerX, centerY - 150, '🏆 GAUNTLET OF VALOR CHAMPION! 🏆', {
            fontSize: '42px',
            fill: '#fbbf24',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY - 80, champion.name, {
            fontSize: '48px',
            fill: '#10b981',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY - 20, 'has conquered the tournament!', {
            fontSize: '24px',
            fill: '#e2e8f0'
        }).setOrigin(0.5);

        // Show tournament results button
        const resultsButton = this.add.rectangle(centerX, centerY + 100, 300, 60, 0x8b5cf6)
            .setInteractive()
            .setStrokeStyle(3, 0xa855f7);

        const resultsGlow = this.add.rectangle(centerX, centerY + 100, 320, 80, 0x8b5cf6, 0.2);

        this.add.text(centerX, centerY + 100, 'VIEW RESULTS', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        resultsButton.on('pointerdown', () => {
            if (window.audioManager) {
                window.audioManager.playSound('buttonClick');
            }
            this.scene.start('TournamentResultsScene');
        });
        resultsButton.on('pointerover', () => {
            if (window.audioManager) {
                window.audioManager.playSound('buttonHover');
            }
            resultsButton.setFillStyle(0xa855f7);
            resultsGlow.setAlpha(0.4);
        });
        resultsButton.on('pointerout', () => {
            resultsButton.setFillStyle(0x8b5cf6);
            resultsGlow.setAlpha(0.2);
        });
    }

    viewBracket() {
        // Don't reset tournament when viewing bracket
        this.scene.start('TournamentBracketScene');
    }
}