# Throne of Valor - Complete Game Documentation

## 📝 Game Descriptions

### Short Description
**2-player medieval fighter where sacrifices unlock devastating powers - risk your life to claim the throne!**

### Long Description
**Throne of Valor** is an intense 2-player local multiplayer medieval-fantasy fighting game where the theme of sacrifice runs deep. Compete in elimination tournaments (2-16 players) across deadly arenas with hazards that kill instantly. Choose between the Path of Fury (high damage, low health) or Path of Endurance (high health, low damage) before each battle, each with unique passive abilities that activate when you're near death.

The sacrifice mechanic is central to gameplay: use the Sacrifice Attack to deal double damage but lose 30 HP if you miss, activate Blood Gambit to spend 30% of your max HP for a random powerful buff, and survive the Overtime Sacrifice where both fighters drain 5 HP per second until one falls. If both die simultaneously, enter Sudden Death mode where both warriors have 1 HP and the first strike wins. Every decision carries weight - will you risk everything for victory?

## 🏰 Game Overview

**Throne of Valor** is a medieval-fantasy tournament-style fighting game built with Phaser.js. Players compete in elimination tournaments of varying sizes (2-16 players) to claim the ultimate prize: the Throne of Valor. The game features real-time combat, multiple arena types with instant-kill hazards, character customization paths with passive abilities, sacrifice-based mechanics, and a comprehensive audio system.

**Technical Specifications:**
- **Engine:** Phaser.js 3.70.0
- **Resolution:** Fixed 1280x720 (16:9 aspect ratio)
- **Platform:** Web browser (HTML5)
- **Audio:** Web Audio API with comprehensive sound system
- **Input:** Keyboard controls for 2-player local gameplay

---

## 🎮 Core Game Flow

### Main Menu Scene (`MainMenuScene.js`)
- **Tournament Size Selection**: Choose from 2, 4, 8, or 16 players
- **Visual Design**: Animated background particles, glowing title effects
- **Difficulty Indicators**:
  - 2-4 players: "QUICK" (green)
  - 8 players: "STANDARD" (yellow)
  - 16 players: "EPIC" (red)
- **Audio**: Menu background music with interactive sound effects

### Tournament Bracket Scene (`TournamentBracketScene.js`)
- **Dynamic Bracket Display**: Automatically scales layout based on player count
- **Visual Features**:
  - Color-coded round headers
  - Match containers with completion status
  - Winner indicators with crown emoji (👑)
  - Dynamic font sizing for optimal readability
- **Navigation**: Start tournament, continue tournament, or return to main menu
- **Auto-advancement**: Automatically handles round progression

### Instructions Scene (`InstructionsScene.js`)
- **Game Lore**: Medieval tournament theme with Latin motto "MORITURI TE SALUTANT"
- **Character Path Explanation**: Details on Fury vs Endurance paths
- **Visual Design**: Modal popup with glow effects and emoji icons

---

## ⚔️ Character System

### Character Paths (`CharacterSelectionScene.js`)
Players must choose their warrior's destiny before each battle:

#### Path of Fury (Red)
- **Health**: 80 HP
- **Damage**: 25 per attack
- **Speed**: 200 units/second
- **Philosophy**: "High damage, low health"
- **Passive Ability**: **Rage Mode** - When HP drops below 30%, gain +50% damage boost for the rest of the match
- **Visual**: Red color scheme, aggressive styling, red particle effects when Rage Mode activates

#### Path of Endurance (Green)
- **Health**: 120 HP
- **Damage**: 15 per attack
- **Speed**: 200 units/second
- **Philosophy**: "High health, low damage"
- **Passive Ability**: **Second Wind** - When HP drops below 30%, instantly heal 20 HP (one-time activation)
- **Visual**: Green color scheme, defensive styling, green healing particles when Second Wind activates

### Visual Character Design
- **Warrior Components**: Head, helmet, body, arms, legs with team colors
- **Team Colors**: Red team (Player 1) and Blue team (Player 2)
- **Animation States**: Idle, walking, attacking, dashing
- **Scaling**: Player 2 horizontally flipped to face left

---

## 🏟️ Battle System

### Arena Types (`BattleScene.js`)
The game features 4 distinct randomly-selected arena types:

#### 1. Default Arena
- **Theme**: Epic medieval colosseum
- **Features**: Multi-level platforms, decorative pillars
- **Title**: "ARENA OF VALOR" with "MORITURI TE SALUTANT"
- **Platforms**: Strategic positioning for tactical combat
- **Visual**: Stone construction with royal banners

#### 2. Ground-Only Arena
- **Theme**: Minimalist battlefield
- **Features**: Single ground platform, open sky
- **Focus**: Pure ground-based combat
- **Visual**: Simple brown platform against blue sky
- **Hazards**: None - pure skill-based combat

#### 3. Lava Arena
- **Theme**: Dangerous volcanic battleground
- **Features**: 4 floating platforms above lava field
- **Hazards**: **INSTANT DEATH** - Touching the lava floor kills immediately
- **Strategy**: Platform-jumping combat with environmental danger
- **Visual**: Dark red/orange color scheme with animated lava bubbles and flame particle effects
- **Risk**: Fall off platforms = instant elimination

#### 4. Spike Arena
- **Theme**: Deadly trap-filled arena
- **Features**: Spike-lined walls and ceiling, safe ground platform
- **Hazards**: **INSTANT DEATH** - Touching spikes on walls or ceiling kills immediately
- **Warning**: Skull symbol (☠️) indicating extreme danger
- **Strategy**: Avoid knockback into spikes while fighting
- **Visual**: Dark theme with menacing spike formations on three sides

### Combat Mechanics

#### Movement System
- **Ground Movement**: Left/right movement with physics
- **Jumping**: Vertical movement with gravity
- **Dashing**: Double-tap movement keys for quick dash
- **Arena Bounds**: Confined to arena boundaries
- **Platform Physics**: Collision detection with arena platforms

#### Attack System
- **Melee Combat**: Close-range sword attacks
- **Attack Cooldown**: Prevents spam attacking
- **Damage Calculation**: Based on character path selection
- **Hit Detection**: Rectangular hitbox collision system
- **Knockback Effects**: Visual feedback on successful hits

#### Weapon System
- **Weapon Spawning**: Random weapon drops every 5 seconds at random locations
- **Weapon Types**:
  - **Sword**: 2x damage multiplier, melee range
  - **Gun**: Ranged projectile attacks, fires bullets
  - **Shield**: 50% damage reduction when equipped
  - **Potion**: Instant heal of 20 HP on pickup
- **Pickup System**: Walk over weapons to collect and equip them
- **Enhanced Damage**: Weapons modify attack damage calculations
- **Visual Integration**: Weapons appear on character sprites
- **Sacrifice Integration**: Sacrifice Attack adapts to equipped weapon (melee vs gun mode)

#### Health & Status
- **Health Bars**: Visual health tracking for both players
- **Real-time Updates**: Health bars scale with current HP
- **Color Coding**: Red (Player 1) and Blue (Player 2)
- **Death Condition**: Battle ends when player reaches 0 HP

### Sacrifice Mechanics (Theme: "Sacrifices Must Be Made")

#### 1. Sacrifice Attack (E / ENTER) - Once Per Match
- **Risk/Reward System**: Press E (Player 1) or ENTER (Player 2) to perform a devastating sacrifice attack
- **Success**: Deals **2x damage** to the opponent if it connects
- **Failure**: You lose **30 HP** if the attack misses
- **Weapon Adaptation**:
  - **Melee Mode**: Extended-range melee strike with screen shake feedback
  - **Gun Mode**: Fires a special sacrifice bullet that adapts to equipped weapon
- **Strategic Timing**: Can only be used once per match, making timing critical
- **Visual Feedback**: Screen shake on hit, damage text indicators, distinct attack animations

#### 2. Blood Gambit (Q / CTRL) - Once Per Match
- **Activation Cost**: Spend **30% of your maximum HP** to activate
- **Restriction**: Cannot use if current HP is 30% or below (prevents suicide)
- **Random Buff System**: Receive one of five powerful buffs for 6-8 seconds:
  1. **🔴 Berserker**: +50% damage to all attacks
  2. **🔵 Swift Step**: +60% movement speed
  3. **⚪ Iron Skin**: -50% damage taken from opponent
  4. **🟣 Vampiric**: Heal 10 HP with every successful hit
  5. **🟡 Weapon Drop**: Instantly receive a random weapon (only if currently unarmed)
- **Visual Feedback**: Color-coded buff indicators, particle effects, buff timer display
- **Strategic Depth**: High-risk maneuver that can turn the tide of battle

#### 3. Overtime Sacrifice
- **Trigger**: When the 45-second battle timer expires and both players are alive
- **Mechanism**: Both players lose **5 HP per second** continuously
- **Visual Warning**: Red flashing "OVERTIME SACRIFICE" text with dramatic effects
- **Victory**: Last warrior standing wins the match
- **Tension**: Creates intense final moments where every second counts

#### 4. Sudden Death Mode
- **Trigger**: If both players reach 0 HP simultaneously during Overtime Sacrifice
- **Reset**: Both players are restored to exactly **1 HP**
- **Rule**: First hit wins - any damage will instantly end the match
- **Visual**: Flashing "SUDDEN DEATH!" text with "First hit wins!" message
- **Intensity**: Maximum tension where positioning and timing are everything

### Battle Timer & Victory Conditions

#### Time Management
- **Battle Duration**: 45-second rounds
- **Countdown**: 3-second battle start countdown ("3... 2... 1... FIGHT!")
- **Timer Display**: Large center-screen timer with color changes as time runs low
- **Overtime**: Overtime Sacrifice mode activates when timer hits 0

#### Victory Conditions
1. **Elimination**: Reduce opponent's health to 0
2. **Time Victory**: Higher health when time expires (if both alive)
3. **Overtime Victory**: Survive the HP drain longer than opponent
4. **Sudden Death Victory**: Land the first hit when both players are at 1 HP

### Controls
**Player 1 (Red):**
- Movement: WASD keys
- Attack: SPACEBAR
- Dash: Double-tap A or D
- **Sacrifice Attack**: E key (once per match)
- **Blood Gambit**: Q key (once per match)

**Player 2 (Blue):**
- Movement: Arrow keys
- Attack: SHIFT key
- Dash: Double-tap LEFT or RIGHT arrows
- **Sacrifice Attack**: ENTER key (once per match)
- **Blood Gambit**: CTRL key (once per match)

---

## 🎵 Audio System

### AudioManager (`AudioManager.js`)
Comprehensive Web Audio API implementation with browser compatibility.

#### Music System
- **Menu Music**: Ambient background for main menu
- **Battle Music**: Dynamic combat soundtrack
- **Victory Music**: Triumphant celebration themes
- **Volume Control**: Separate music (30%) and SFX (60%) levels
- **Seamless Transitions**: Automatic music switching between scenes

#### Sound Effects Library
**Interface Sounds:**
- Button hover effects
- Button click confirmations
- Path selection chimes
- Tournament start fanfare

**Combat Audio:**
- Sword swing sounds
- Impact/hit effects
- Weapon pickup audio
- Dash movement whoosh
- Heavy hit impacts
- Critical hit effects
- Sacrifice attack sound effects
- Blood Gambit activation sounds
- Buff activation audio cues

**Event Audio:**
- Battle start horn
- Victory fanfare
- Winner announcements
- Health pickup sounds
- Path selection confirmation
- Passive ability activation sounds

#### Technical Features
- **User Interaction Compliance**: Respects browser autoplay policies
- **Context Management**: Automatic AudioContext initialization
- **Error Handling**: Graceful fallback for unsupported browsers
- **Performance**: Efficient sound generation and playback

---

## 🏆 Tournament System

### Tournament Structure
- **Bracket Generation**: Automatic single-elimination brackets
- **Player Shuffling**: Random seeding for fair competition
- **Round Progression**: Automatic advancement through rounds
- **Winner Tracking**: Complete tournament history maintenance

### Tournament Results (`TournamentResultsScene.js`)
#### Champion Celebration
- **Visual Effects**: Confetti animation system with multiple particle types
- **Champion Display**: Crown imagery and royal styling
- **Tournament Statistics**: Complete breakdown of tournament metrics

#### Results Display
- **Complete Bracket**: Final tournament bracket with all results
- **Match Results**: Detailed winner/loser information for each match
- **Statistics Panel**:
  - Total players participated
  - Number of rounds completed
  - Total matches played
  - Elimination count
- **Navigation**: Options to start new tournament or return to menu

### Winner Selection (`WinnerSelectionScene.js`)
Manual winner selection system for tournament progression:
- **Battle Outcome Display**: Shows current match details
- **Player Statistics**: Character path information and stats
- **Winner Buttons**: Interactive selection for match victor
- **Result Announcement**: Dramatic winner reveal with animations
- **Tournament Flow**: Automatic progression to next round or finals

---

## 🎨 Visual Design & User Interface

### Design Philosophy
- **Medieval Fantasy Theme**: Royal colors, medieval typography
- **Color Palette**: Purple (#8b5cf6), gold (#fbbf24), dark grays
- **Visual Hierarchy**: Clear information organization
- **Responsive Elements**: Dynamic scaling for different tournament sizes

### UI Components
#### Buttons & Interactions
- **Hover Effects**: Color transitions and scaling animations
- **Click Feedback**: Visual depression and sound confirmation
- **Glow Effects**: Subtle ambient lighting on interactive elements
- **State Management**: Visual feedback for active/inactive states

#### Health Bars & HUD
- **Real-time Health**: Smooth health bar animations
- **Player Identification**: Clear name display and color coding
- **Timer Display**: Prominent countdown timer
- **Control Instructions**: On-screen control reminders

#### Animations & Effects
- **Particle Systems**: Background ambiance and celebration effects
- **Tween Animations**: Smooth transitions and micro-interactions
- **Visual Feedback**: Attack effects, damage indicators
- **Scene Transitions**: Smooth navigation between game states

---

## 🏗️ Technical Architecture

### File Structure
```
Game/
├── index.html              # Main HTML entry point
├── js/
│   ├── game.js            # Phaser configuration and initialization
│   ├── audio/
│   │   └── AudioManager.js # Complete audio system
│   └── scenes/
│       ├── MainMenuScene.js          # Tournament size selection
│       ├── TournamentBracketScene.js # Bracket display and navigation
│       ├── InstructionsScene.js     # Game tutorial and lore
│       ├── CharacterSelectionScene.js # Character path selection
│       ├── BattleScene.js           # Core combat gameplay
│       ├── WinnerSelectionScene.js  # Manual winner selection
│       └── TournamentResultsScene.js # Final results and celebration
├── Screenshots/           # Visual documentation
│   ├── One.png           # Default arena screenshot
│   ├── Two.png           # Lava arena screenshot
│   ├── Three.png         # Ground-only arena screenshot
│   └── Four.png          # Spike arena screenshot
└── Thumbnail.png         # Game promotional image
```

### Core Systems
#### Game State Management
- **Tournament Data**: Centralized player and match tracking
- **Scene Registry**: Phaser's built-in state management
- **Data Persistence**: Tournament progress maintained across scenes
- **Error Handling**: Graceful fallbacks for missing data

#### Physics & Collision
- **Custom Physics**: Lightweight physics implementation
- **Collision Detection**: Rectangle-based collision system
- **Platform Integration**: Multi-level arena support
- **Boundary Management**: Arena containment system

#### Performance Optimization
- **Fixed Resolution**: Consistent 1280x720 rendering
- **Efficient Animations**: Tween-based animation system
- **Resource Management**: Proper cleanup and memory management
- **Responsive Scaling**: Dynamic UI scaling for various tournament sizes

---

## 🎯 Game Features Summary

### Core Features
✅ **Tournament System**: 2-16 player single-elimination tournaments
✅ **Character Customization**: Fury vs Endurance path selection with unique passive abilities
✅ **Real-time Combat**: Physics-based fighting with weapons and sacrifice mechanics
✅ **Multiple Arenas**: 4 distinct arena types - 2 with instant-kill hazards (lava and spikes)
✅ **Audio System**: Complete music and sound effects
✅ **Visual Polish**: Animations, particles, screen shake, and professional UI

### Sacrifice Mechanics (Game Jam Theme)
✅ **Passive Abilities**: Rage Mode (+50% damage) and Second Wind (heal 20 HP) trigger at <30% HP
✅ **Sacrifice Attack**: Once-per-match 2x damage attack that costs 30 HP if missed, adapts to weapons
✅ **Blood Gambit**: Spend 30% max HP for random powerful buff (5 types, 6-8 seconds duration)
✅ **Overtime Sacrifice**: 5 HP/sec drain when time expires, creating intense final moments
✅ **Sudden Death Mode**: Both players at 1 HP, first hit wins if simultaneous death occurs
✅ **Risk/Reward Balance**: Every sacrifice mechanic has meaningful strategic depth

### Advanced Features
✅ **Dynamic Scaling**: UI adapts to tournament size
✅ **Random Elements**: Arena selection, weapon spawning, Blood Gambit buff selection
✅ **Tournament Persistence**: Save progress between battles
✅ **Celebration System**: Confetti and victory animations
✅ **Browser Compliance**: Respects autoplay policies
✅ **Responsive Design**: Fixed 1280x720 resolution with proper scaling
✅ **Weapon Adaptation**: Sacrifice attacks change behavior based on equipped weapon
✅ **Comprehensive Tutorial**: Detailed instructions scene with all mechanics explained
✅ **Buff System**: 5 unique buffs (Berserker, Swift Step, Iron Skin, Vampiric, Weapon Drop)

### Technical Features
✅ **Modular Architecture**: Clean separation of concerns
✅ **Error Handling**: Graceful degradation for audio issues
✅ **Performance Optimization**: Efficient rendering and physics with capped velocities
✅ **Code Documentation**: Comprehensive inline documentation
✅ **Visual Documentation**: Complete screenshot library
✅ **Physics Fixes**: Ground collision safeguards prevent fall-through glitches
✅ **Edge Case Handling**: Simultaneous death resolution with sudden death mode

---

## 🚀 Getting Started

### System Requirements
- **Browser**: Modern web browser with HTML5 and Web Audio API support
- **Controls**: Keyboard for player input
- **Resolution**: Optimized for 1280x720 display
- **Audio**: Web Audio API for full audio experience

### Launch Instructions
1. Open `index.html` in a web browser
2. Wait for game assets to load (loading spinner will disappear)
3. Click or interact to initialize audio system
4. Select tournament size from main menu
5. Begin your quest for the Throne of Valor!

### Controls Reference
**Player 1:**
- WASD (move) + SPACE (attack) + Double-tap A/D (dash)
- E (Sacrifice Attack) + Q (Blood Gambit)

**Player 2:**
- Arrows (move) + SHIFT (attack) + Double-tap ←/→ (dash)
- ENTER (Sacrifice Attack) + CTRL (Blood Gambit)

---

*"MORITURI TE SALUTANT" - Those who are about to die salute you*

**Throne of Valor** represents a complete tournament fighting game with professional-grade features, polished presentation, and engaging gameplay mechanics centered around the theme of sacrifice. Every aspect from the audio system to the visual effects has been carefully crafted to deliver an immersive medieval combat experience where risk and reward go hand-in-hand. The sacrifice mechanics add strategic depth and dramatic tension to every match, ensuring that no two battles play out the same way.

---

## 🎮 Changelog - Sacrifice Update

### Major Features Added
- **Passive Ability System**: Both character paths now have unique abilities that trigger when HP drops below 30%
- **Sacrifice Attack Mechanic**: High-risk, high-reward once-per-match attack system with weapon adaptation
- **Blood Gambit System**: Strategic HP sacrifice for powerful random buffs (5 types)
- **Overtime Sacrifice Mode**: Continuous HP drain when timer expires
- **Sudden Death Resolution**: Both players at 1 HP if simultaneous death occurs

### Balance Changes
- Battle timer increased from 30 to 45 seconds for more strategic gameplay
- Rage Mode (Path of Fury) now provides +50% damage when HP < 30%
- Second Wind (Path of Endurance) heals 20 HP when HP < 30% (one-time)

### UI/UX Improvements
- Complete tutorial rewrite with comprehensive mechanics explanation
- Updated character selection descriptions to show stats and abilities clearly
- Added clean controls overlay at bottom of battle screen
- Fixed purple border positioning and game container scaling issues
- Added visual feedback for all sacrifice mechanics (screen shake, particles, text indicators)

### Bug Fixes
- Fixed fall-through ground glitch by capping max fall velocity and adding hard boundary checks
- Fixed window resize issue by changing scale mode from FIT to NONE
- Fixed sacrifice attack damage calculation and feedback
- Fixed overtime simultaneous death crash with sudden death mode implementation

### Technical Improvements
- Added buff system infrastructure with 5 unique buffs
- Implemented weapon-adaptive sacrifice attacks (melee vs ranged)
- Created comprehensive ability tracking system
- Enhanced damage calculation to support multiple buff stacking
- Added proper event cleanup for overtime mode