class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.currentMusic = null;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.6;
        this.initialized = false;
        this.userHasInteracted = false;

        // Don't initialize audio context immediately - wait for user interaction
        this.setupUserInteractionListener();
    }

    setupUserInteractionListener() {
        const handleUserInteraction = async () => {
            if (!this.userHasInteracted) {
                this.userHasInteracted = true;
                await this.initAudioContext();

                // Remove listeners after first interaction
                document.removeEventListener('click', handleUserInteraction);
                document.removeEventListener('keydown', handleUserInteraction);
                document.removeEventListener('touchstart', handleUserInteraction);
                document.removeEventListener('pointerdown', handleUserInteraction);
            }
        };

        // Listen for any user interaction
        document.addEventListener('click', handleUserInteraction);
        document.addEventListener('keydown', handleUserInteraction);
        document.addEventListener('touchstart', handleUserInteraction);
        document.addEventListener('pointerdown', handleUserInteraction);
    }

    async initAudioContext() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            this.createSounds();
            this.initialized = true;

            console.log('Audio system initialized successfully after user interaction');
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }

    // Resume audio context (required for Chrome's autoplay policy)
    async resumeAudio() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    // Create sound effects using Web Audio API
    createSounds() {
        if (!this.audioContext) return;

        // Button hover sound - short beep
        this.sounds.buttonHover = this.createTone(800, 0.1, 'sine');

        // Button click sound - satisfying click
        this.sounds.buttonClick = this.createTone(600, 0.15, 'square');

        // Victory fanfare - triumphant sound
        this.sounds.victory = this.createVictoryFanfare();

        // Battle start - dramatic horn
        this.sounds.battleStart = this.createBattleHorn();

        // Tournament start - grand opening
        this.sounds.tournamentStart = this.createTournamentFanfare();

        // Path selection - mystical chime
        this.sounds.pathSelect = this.createPathSelectSound();

        // Winner announcement - celebration
        this.sounds.winnerAnnounce = this.createWinnerSound();

        // Combat sounds
        this.sounds.swordSwing = this.createSwordSwingSound();
        this.sounds.swordHit = this.createSwordHitSound();

        // New sounds - wrap in try/catch to prevent breaking existing audio
        try {
            this.sounds.gunShot = this.createGunShotSound();
            this.sounds.dashWhoosh = this.createDashSound();
            this.sounds.healthPickup = this.createHealthPickupSound();
            this.sounds.weaponPickup = this.createWeaponPickupSound();
            this.sounds.heavyHit = this.createHeavyHitSound();
            this.sounds.criticalHit = this.createCriticalHitSound();
            this.sounds.lavaAmbient = this.createLavaAmbientSound();
            this.sounds.spikeDanger = this.createSpikeDangerSound();
        } catch (error) {
            console.warn('Error creating new audio sounds:', error);
            // Fallback to existing sounds
            this.sounds.gunShot = this.createTone(600, 0.15, 'square');
            this.sounds.dashWhoosh = this.createTone(400, 0.3, 'sine');
            this.sounds.healthPickup = this.createTone(800, 0.4, 'sine');
            this.sounds.weaponPickup = this.createTone(600, 0.3, 'square');
            this.sounds.heavyHit = this.createTone(200, 0.4, 'sawtooth');
            this.sounds.criticalHit = this.createTone(400, 0.6, 'sawtooth');
            // Fallback for ambient sounds
            this.sounds.lavaAmbient = { start: () => {}, stop: () => {} };
            this.sounds.spikeDanger = this.createTone(300, 0.5, 'square');
        }

        // Background music themes
        this.sounds.menuMusic = this.createMenuMusic();
        this.sounds.battleMusic = this.createBattleMusic();
        this.sounds.victoryMusic = this.createVictoryMusic();
    }

    createTone(frequency, duration, waveform = 'sine') {
        return () => {
            if (!this.audioContext) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = waveform;

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }

    createVictoryFanfare() {
        return () => {
            if (!this.audioContext) return;

            // Multi-note victory sequence
            const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();

                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);

                    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    osc.type = 'triangle';

                    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.4, this.audioContext.currentTime + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.5);
                }, index * 150);
            });
        };
    }

    createBattleHorn() {
        return () => {
            if (!this.audioContext) return;

            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.frequency.setValueAtTime(220, this.audioContext.currentTime);
            osc.frequency.linearRampToValueAtTime(330, this.audioContext.currentTime + 0.3);
            osc.type = 'sawtooth';

            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.5, this.audioContext.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);

            osc.start();
            osc.stop(this.audioContext.currentTime + 0.8);
        };
    }

    createTournamentFanfare() {
        return () => {
            if (!this.audioContext) return;

            // Grand opening with multiple harmonies
            const baseFreqs = [174, 220, 261, 329]; // F3, A3, C4, E4

            baseFreqs.forEach((freq, index) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.connect(gain);
                gain.connect(this.audioContext.destination);

                osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                osc.type = 'triangle';

                const volume = this.sfxVolume * (0.3 - index * 0.05);
                gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                gain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.2);
                gain.gain.linearRampToValueAtTime(volume * 0.7, this.audioContext.currentTime + 0.8);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.5);

                osc.start();
                osc.stop(this.audioContext.currentTime + 1.5);
            });
        };
    }

    createPathSelectSound() {
        return () => {
            if (!this.audioContext) return;

            // Mystical chime with reverb-like effect
            [1, 1.2, 1.5].forEach((multiplier, index) => {
                setTimeout(() => {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();

                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);

                    osc.frequency.setValueAtTime(880 * multiplier, this.audioContext.currentTime);
                    osc.type = 'sine';

                    const volume = this.sfxVolume * (0.3 - index * 0.1);
                    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);

                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.6);
                }, index * 50);
            });
        };
    }

    createWinnerSound() {
        return () => {
            if (!this.audioContext) return;

            // Celebration bells
            const frequencies = [1047, 1319, 1568, 2093]; // C6, E6, G6, C7
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();

                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);

                    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    osc.type = 'sine';

                    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.4, this.audioContext.currentTime + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.0);

                    osc.start();
                    osc.stop(this.audioContext.currentTime + 1.0);
                }, index * 100);
            });
        };
    }

    // Background music creation
    createMenuMusic() {
        const frequencies = [261, 329, 392, 523]; // C4, E4, G4, C5
        let oscillators = [];
        let isPlaying = false;
        let loopTimeout = null;

        return {
            start: () => {
                if (!this.audioContext || isPlaying) return;
                isPlaying = true;

                const playLoop = () => {
                    if (!isPlaying) return;

                    frequencies.forEach((freq, index) => {
                        setTimeout(() => {
                            if (!isPlaying) return;

                            const osc = this.audioContext.createOscillator();
                            const gain = this.audioContext.createGain();

                            osc.connect(gain);
                            gain.connect(this.audioContext.destination);

                            osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                            osc.type = 'triangle';

                            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                            gain.gain.linearRampToValueAtTime(this.musicVolume * 0.1, this.audioContext.currentTime + 0.1);
                            gain.gain.linearRampToValueAtTime(this.musicVolume * 0.05, this.audioContext.currentTime + 0.8);
                            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.0);

                            osc.start();
                            osc.stop(this.audioContext.currentTime + 1.0);

                            oscillators.push(osc);
                        }, index * 250);
                    });

                    loopTimeout = setTimeout(playLoop, 2000);
                };

                playLoop();
            },
            stop: () => {
                isPlaying = false;
                if (loopTimeout) {
                    clearTimeout(loopTimeout);
                    loopTimeout = null;
                }
                oscillators.forEach(osc => {
                    try { osc.stop(); } catch(e) {}
                });
                oscillators = [];
            }
        };
    }

    createBattleMusic() {
        let isPlaying = false;
        let oscillators = [];
        let loopTimeout = null;

        return {
            start: () => {
                if (!this.audioContext || isPlaying) return;
                isPlaying = true;

                const playDramaticLoop = () => {
                    if (!isPlaying) return;

                    // Dramatic battle rhythm
                    const battleFreqs = [220, 246, 293, 330]; // A3, B3, D4, E4

                    battleFreqs.forEach((freq, index) => {
                        setTimeout(() => {
                            if (!isPlaying) return;

                            const osc = this.audioContext.createOscillator();
                            const gain = this.audioContext.createGain();

                            osc.connect(gain);
                            gain.connect(this.audioContext.destination);

                            osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                            osc.type = 'sawtooth';

                            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                            gain.gain.linearRampToValueAtTime(this.musicVolume * 0.15, this.audioContext.currentTime + 0.05);
                            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);

                            osc.start();
                            osc.stop(this.audioContext.currentTime + 0.4);

                            oscillators.push(osc);
                        }, index * 200);
                    });

                    loopTimeout = setTimeout(playDramaticLoop, 1200);
                };

                playDramaticLoop();
            },
            stop: () => {
                isPlaying = false;
                if (loopTimeout) {
                    clearTimeout(loopTimeout);
                    loopTimeout = null;
                }
                oscillators.forEach(osc => {
                    try { osc.stop(); } catch(e) {}
                });
                oscillators = [];
            }
        };
    }

    createVictoryMusic() {
        let isPlaying = false;
        let oscillators = [];
        let loopTimeout = null;

        return {
            start: () => {
                if (!this.audioContext || isPlaying) return;
                isPlaying = true;

                const playVictoryLoop = () => {
                    if (!isPlaying) return;

                    // Triumphant victory melody
                    const victoryMelody = [523, 659, 784, 1047, 784, 659, 523]; // C5-E5-G5-C6-G5-E5-C5

                    victoryMelody.forEach((freq, index) => {
                        setTimeout(() => {
                            if (!isPlaying) return;

                            const osc = this.audioContext.createOscillator();
                            const gain = this.audioContext.createGain();

                            osc.connect(gain);
                            gain.connect(this.audioContext.destination);

                            osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                            osc.type = 'triangle';

                            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                            gain.gain.linearRampToValueAtTime(this.musicVolume * 0.2, this.audioContext.currentTime + 0.05);
                            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);

                            osc.start();
                            osc.stop(this.audioContext.currentTime + 0.6);

                            oscillators.push(osc);
                        }, index * 300);
                    });

                    loopTimeout = setTimeout(playVictoryLoop, 3000);
                };

                playVictoryLoop();
            },
            stop: () => {
                isPlaying = false;
                if (loopTimeout) {
                    clearTimeout(loopTimeout);
                    loopTimeout = null;
                }
                oscillators.forEach(osc => {
                    try { osc.stop(); } catch(e) {}
                });
                oscillators = [];
            }
        };
    }

    createSwordSwingSound() {
        return () => {
            if (!this.audioContext) return;

            // Create swoosh effect - high frequency noise that drops quickly
            const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.2, this.audioContext.sampleRate);
            const output = noiseBuffer.getChannelData(0);

            // Generate white noise that fades to simulate sword cutting through air
            for (let i = 0; i < noiseBuffer.length; i++) {
                const fadeOut = 1 - (i / noiseBuffer.length);
                output[i] = (Math.random() * 2 - 1) * fadeOut * fadeOut;
            }

            const noiseSource = this.audioContext.createBufferSource();
            const filter = this.audioContext.createBiquadFilter();
            const gainNode = this.audioContext.createGain();

            noiseSource.buffer = noiseBuffer;
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(2000, this.audioContext.currentTime); // High frequency swoosh
            filter.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);

            noiseSource.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

            noiseSource.start();
            noiseSource.stop(this.audioContext.currentTime + 0.2);
        };
    }

    createSwordHitSound() {
        return () => {
            if (!this.audioContext) return;

            // Create metallic clang - multiple frequencies for metallic sound
            const frequencies = [800, 1200, 1600, 2400]; // Metallic harmonics

            frequencies.forEach((freq, index) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.connect(gain);
                gain.connect(this.audioContext.destination);

                osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                osc.type = 'square'; // Harsh metallic sound

                const volume = this.sfxVolume * (0.4 - index * 0.08); // Decreasing volume for each harmonic
                gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                gain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.005);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

                osc.start();
                osc.stop(this.audioContext.currentTime + 0.3);
            });

            // Add sharp impact noise
            setTimeout(() => {
                const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
                const output = noiseBuffer.getChannelData(0);

                for (let i = 0; i < noiseBuffer.length; i++) {
                    const decay = 1 - (i / noiseBuffer.length);
                    output[i] = (Math.random() * 2 - 1) * decay * decay * decay;
                }

                const noiseSource = this.audioContext.createBufferSource();
                const noiseGain = this.audioContext.createGain();

                noiseSource.buffer = noiseBuffer;
                noiseSource.connect(noiseGain);
                noiseGain.connect(this.audioContext.destination);

                noiseGain.gain.setValueAtTime(this.sfxVolume * 0.2, this.audioContext.currentTime);

                noiseSource.start();
                noiseSource.stop(this.audioContext.currentTime + 0.1);
            }, 5);
        };
    }

    createGunShotSound() {
        return () => {
            if (!this.audioContext) return;

            // Sharp crack sound with noise burst
            const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.15, this.audioContext.sampleRate);
            const output = noiseBuffer.getChannelData(0);

            // Generate sharp crack with quick decay
            for (let i = 0; i < noiseBuffer.length; i++) {
                const decay = Math.pow(1 - (i / noiseBuffer.length), 3);
                output[i] = (Math.random() * 2 - 1) * decay;
            }

            const noiseSource = this.audioContext.createBufferSource();
            const filter = this.audioContext.createBiquadFilter();
            const gainNode = this.audioContext.createGain();

            noiseSource.buffer = noiseBuffer;
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1500, this.audioContext.currentTime);
            filter.Q.setValueAtTime(2, this.audioContext.currentTime);

            noiseSource.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.6, this.audioContext.currentTime + 0.005);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.12);

            noiseSource.start();
            noiseSource.stop(this.audioContext.currentTime + 0.15);
        };
    }

    createDashSound() {
        return () => {
            if (!this.audioContext) return;

            // Wind whoosh effect
            const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.3, this.audioContext.sampleRate);
            const output = noiseBuffer.getChannelData(0);

            for (let i = 0; i < noiseBuffer.length; i++) {
                const envelope = Math.sin((i / noiseBuffer.length) * Math.PI);
                output[i] = (Math.random() * 2 - 1) * envelope * 0.5;
            }

            const noiseSource = this.audioContext.createBufferSource();
            const filter = this.audioContext.createBiquadFilter();
            const gainNode = this.audioContext.createGain();

            noiseSource.buffer = noiseBuffer;
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, this.audioContext.currentTime);

            noiseSource.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.4, this.audioContext.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);

            noiseSource.start();
            noiseSource.stop(this.audioContext.currentTime + 0.3);
        };
    }

    createHealthPickupSound() {
        return () => {
            if (!this.audioContext) return;

            // Healing chime - warm, uplifting
            const frequencies = [523, 659, 784]; // C5, E5, G5 - major chord
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();

                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);

                    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    osc.type = 'sine';

                    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);

                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.4);
                }, index * 80);
            });
        };
    }

    createWeaponPickupSound() {
        return () => {
            if (!this.audioContext) return;

            // Metallic pickup sound
            const frequencies = [400, 600, 800];
            frequencies.forEach((freq, index) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.connect(gain);
                gain.connect(this.audioContext.destination);

                osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                osc.type = 'square';

                gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.2, this.audioContext.currentTime + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

                osc.start();
                osc.stop(this.audioContext.currentTime + 0.3);
            });
        };
    }

    createHeavyHitSound() {
        return () => {
            if (!this.audioContext) return;

            // Deep impact with bass
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.frequency.setValueAtTime(60, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 0.3);
            osc.type = 'sawtooth';

            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.7, this.audioContext.currentTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);

            osc.start();
            osc.stop(this.audioContext.currentTime + 0.4);
        };
    }

    createCriticalHitSound() {
        return () => {
            if (!this.audioContext) return;

            // Dramatic critical hit with multiple layers
            const frequencies = [220, 330, 440, 660];
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();

                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);

                    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    osc.type = 'sawtooth';

                    const volume = this.sfxVolume * (0.5 - index * 0.1);
                    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);

                    osc.start();
                    osc.stop(this.audioContext.currentTime + 0.6);
                }, index * 30);
            });
        };
    }

    createLavaAmbientSound() {
        let isPlaying = false;
        let oscillators = [];
        let loopTimeout = null;

        return {
            start: () => {
                if (!this.audioContext || isPlaying) return;
                isPlaying = true;

                const playAmbientLoop = () => {
                    if (!isPlaying) return;

                    // Low rumbling lava sound
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();

                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);

                    osc.frequency.setValueAtTime(80, this.audioContext.currentTime);
                    osc.frequency.linearRampToValueAtTime(120, this.audioContext.currentTime + 2);
                    osc.frequency.linearRampToValueAtTime(80, this.audioContext.currentTime + 4);
                    osc.type = 'sawtooth';

                    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gain.gain.linearRampToValueAtTime(this.musicVolume * 0.1, this.audioContext.currentTime + 0.5);
                    gain.gain.linearRampToValueAtTime(this.musicVolume * 0.1, this.audioContext.currentTime + 3.5);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 4);

                    osc.start();
                    osc.stop(this.audioContext.currentTime + 4);

                    oscillators.push(osc);
                    loopTimeout = setTimeout(playAmbientLoop, 3000);
                };

                playAmbientLoop();
            },
            stop: () => {
                isPlaying = false;
                if (loopTimeout) {
                    clearTimeout(loopTimeout);
                    loopTimeout = null;
                }
                oscillators.forEach(osc => {
                    try { osc.stop(); } catch(e) {}
                });
                oscillators = [];
            }
        };
    }

    createSpikeDangerSound() {
        return () => {
            if (!this.audioContext) return;

            // Menacing metallic scrape
            const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
            const output = noiseBuffer.getChannelData(0);

            for (let i = 0; i < noiseBuffer.length; i++) {
                const scrape = Math.sin((i / noiseBuffer.length) * Math.PI * 10);
                output[i] = (Math.random() * 2 - 1) * scrape * 0.3;
            }

            const noiseSource = this.audioContext.createBufferSource();
            const filter = this.audioContext.createBiquadFilter();
            const gainNode = this.audioContext.createGain();

            noiseSource.buffer = noiseBuffer;
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);

            noiseSource.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.2, this.audioContext.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);

            noiseSource.start();
            noiseSource.stop(this.audioContext.currentTime + 0.5);
        };
    }

    // Public methods to play sounds
    async playSound(soundName) {
        if (!this.userHasInteracted || !this.initialized) return;

        await this.resumeAudio();

        if (this.sounds[soundName]) {
            if (typeof this.sounds[soundName] === 'function') {
                this.sounds[soundName]();
            }
        }
    }

    async playMusic(musicName) {
        if (!this.userHasInteracted) {
            // User hasn't interacted yet, music will start after first interaction
            return;
        }

        if (!this.initialized) {
            console.warn('Audio not initialized yet');
            return;
        }

        await this.resumeAudio();

        // Stop current music
        if (this.currentMusic && this.currentMusic.stop) {
            this.currentMusic.stop();
        }

        // Start new music immediately
        if (this.sounds[musicName] && this.sounds[musicName].start) {
            this.currentMusic = this.sounds[musicName];
            this.currentMusic.start();
        }
    }

    stopMusic() {
        if (this.currentMusic && this.currentMusic.stop) {
            try {
                this.currentMusic.stop();
            } catch (e) {
                console.warn('Error stopping music:', e);
            }
            this.currentMusic = null;
        }
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }

    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
}

// Global audio manager instance
window.audioManager = new AudioManager();