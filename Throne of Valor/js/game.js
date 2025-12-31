// Game configuration fixed to 1280x720 resolution
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#0f172a',
    scene: [
        MainMenuScene,
        TournamentBracketScene,
        InstructionsScene,
        CharacterSelectionScene,
        BattleScene,
        TournamentResultsScene
    ],
    scale: {
        mode: Phaser.Scale.NONE,
        width: 1280,
        height: 720
    }
};

// Tournament data
const tournamentData = {
    playerCount: 0,
    players: [],
    bracket: [],
    currentRound: 1,
    currentMatch: 0
};

// Hide loading overlay
function hideLoadingOverlay() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

// Start game when page loads
window.onload = () => {
    try {
        // Check if all scene classes are loaded
        if (typeof MainMenuScene === 'undefined') {
            console.error('Scene classes not loaded yet');
            setTimeout(() => window.onload(), 100);
            return;
        }

        const game = new Phaser.Game(config);
        game.registry.set('tournamentData', tournamentData);

        // Hide loading overlay when game is ready
        game.events.once('ready', () => {
            hideLoadingOverlay();
            // Audio initialization is now handled automatically by AudioManager
        });

    } catch (error) {
        console.error('Game failed to start:', error);
        hideLoadingOverlay();
    }
};