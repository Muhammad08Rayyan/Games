class InstructionsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InstructionsScene' });
    }

    create() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Dark overlay
        this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.9);

        // Instructions popup
        const popupWidth = 1100;
        const popupHeight = 650;
        const popup = this.add.rectangle(centerX, centerY, popupWidth, popupHeight, 0x1e293b)
            .setStrokeStyle(4, 0x8b5cf6);

        // Popup glow
        const glow = this.add.rectangle(centerX, centerY, popupWidth + 20, popupHeight + 20, 0x8b5cf6, 0.15);

        // Title
        this.add.text(centerX, centerY - 290, '⚔️ THRONE OF VALOR - HOW TO PLAY ⚔️', {
            fontSize: '28px',
            fill: '#fbbf24',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Column layout
        const leftX = centerX - 350;
        const rightX = centerX + 120;
        let leftY = centerY - 240;
        let rightY = centerY - 240;

        // LEFT COLUMN - Basic Controls & Mechanics
        this.add.text(leftX, leftY, '🎮 PLAYER CONTROLS', {
            fontSize: '18px',
            fill: '#60a5fa',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        leftY += 30;

        const controls = [
            'P1: WASD = Move | SPACE = Attack',
            'P1: Double-tap A/D = Dash',
            'P1: E = Sacrifice | Q = Blood Gambit',
            '',
            'P2: ARROWS = Move | SHIFT = Attack',
            'P2: Double-tap ←/→ = Dash',
            'P2: ENTER = Sacrifice | CTRL = Blood Gambit'
        ];

        controls.forEach(line => {
            this.add.text(leftX, leftY, line, {
                fontSize: '13px',
                fill: '#cbd5e1'
            }).setOrigin(0, 0.5);
            leftY += line === '' ? 10 : 20;
        });

        leftY += 10;

        // Combat Mechanics
        this.add.text(leftX, leftY, '⚔️ COMBAT MECHANICS', {
            fontSize: '18px',
            fill: '#f87171',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        leftY += 30;

        const combat = [
            '• Weapons spawn every 5 seconds',
            '• Sword: 2x damage, melee',
            '• Gun: Ranged shots',
            '• Shield: 50% damage reduction',
            '• Potion: Heal 20 HP instantly',
            '',
            '• Arenas have instant-kill hazards',
            '• 30-second rounds → Overtime'
        ];

        combat.forEach(line => {
            this.add.text(leftX, leftY, line, {
                fontSize: '13px',
                fill: '#cbd5e1'
            }).setOrigin(0, 0.5);
            leftY += line === '' ? 10 : 20;
        });

        // RIGHT COLUMN - Sacrifice Mechanics
        this.add.text(rightX, rightY, '🩸 SACRIFICE MECHANICS (Once Per Match)', {
            fontSize: '18px',
            fill: '#c084fc',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        rightY += 35;

        const sacrifice = [
            '1️⃣ SACRIFICE ATTACK (E / ENTER):',
            '   • Deals 2x damage if it hits',
            '   • You lose 30 HP if you miss',
            '   • Adapts to equipped weapon (melee/gun)',
            '',
            '2️⃣ BLOOD GAMBIT (Q / CTRL):',
            '   • Costs 30% of max HP to activate',
            '   • Can\'t use if HP ≤ 30%',
            '   • Random buff for 6-8 seconds:',
            '',
            '   🔴 BERSERKER: +50% damage',
            '   🔵 SWIFT STEP: +60% movement speed',
            '   ⚪ IRON SKIN: -50% damage taken',
            '   🟣 VAMPIRIC: Heal 10 HP per hit',
            '   🟡 WEAPON: Random weapon (if unarmed)',
            '',
            '3️⃣ OVERTIME SACRIFICE:',
            '   • If time runs out, both lose 5 HP/sec',
            '   • Last warrior standing wins!'
        ];

        sacrifice.forEach(line => {
            const isHeader = line.includes('1️⃣') || line.includes('2️⃣') || line.includes('3️⃣');
            this.add.text(rightX, rightY, line, {
                fontSize: isHeader ? '14px' : '12px',
                fill: isHeader ? '#a78bfa' : '#cbd5e1',
                fontStyle: isHeader ? 'bold' : 'normal'
            }).setOrigin(0, 0.5);
            rightY += line === '' ? 8 : (isHeader ? 22 : 18);
        });

        // Character Paths Section (Bottom)
        let bottomY = centerY + 180;
        this.add.text(centerX, bottomY, '🛡️ CHARACTER PATHS (Choose Before Each Battle)', {
            fontSize: '18px',
            fill: '#34d399',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        bottomY += 30;

        const paths = [
            'PATH OF FURY: 80 HP • 25 DMG | Rage Mode: +50% DMG when HP < 30%',
            'PATH OF ENDURANCE: 120 HP • 15 DMG | Second Wind: Heal 20 HP when HP < 30%'
        ];

        paths.forEach(line => {
            this.add.text(centerX, bottomY, line, {
                fontSize: '13px',
                fill: '#cbd5e1'
            }).setOrigin(0.5);
            bottomY += 22;
        });

        // OK button
        const buttonY = centerY + 280;
        const okButton = this.add.rectangle(centerX, buttonY, 200, 50, 0x8b5cf6)
            .setInteractive()
            .setStrokeStyle(3, 0x7c3aed);

        this.add.text(centerX, buttonY, 'LET\'S FIGHT!', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        okButton.on('pointerdown', () => {
            if (window.audioManager) {
                window.audioManager.playSound('buttonClick');
            }
            this.closeInstructions();
        });
        okButton.on('pointerover', () => {
            if (window.audioManager) {
                window.audioManager.playSound('buttonHover');
            }
            okButton.setFillStyle(0x7c3aed);
        });
        okButton.on('pointerout', () => {
            okButton.setFillStyle(0x8b5cf6);
        });
    }

    closeInstructions() {
        this.scene.start('CharacterSelectionScene');
    }
}
