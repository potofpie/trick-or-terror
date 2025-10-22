import { PICO8 } from './constraints/PICO8Constraints';
import { applyCRTEffect, applyFisheyeEffect } from './effects/CRTEffect';
import { GameState } from './types/enums';
import { LoadedAssets, AssetLoader } from './assets/AssetLoader';
import { InputManager } from './core/InputManager';
import { AudioManager } from './core/AudioManager';
import { GameStateManager } from './game/GameStateManager';
import { ScoreManager } from './game/ScoreManager';
import { CollisionManager } from './game/CollisionManager';
import { SpawnManager } from './game/SpawnManager';
import { Player } from './entities/Player';
import { BaseEnemy } from './entities/enemies/BaseEnemy';
import { Bone } from './entities/Bone';
import { Pumpkin } from './objects/Pumpkin';
import { Bush } from './objects/Bush';
import { Candy } from './objects/Candy';
import { Heart } from './objects/Heart';
import { Jawbreaker } from './objects/Jawbreaker';
import { BackgroundRenderer } from './rendering/BackgroundRenderer';
import { BloodRenderer } from './rendering/BloodRenderer';
import { UIRenderer } from './rendering/UIRenderer';
import { GameOverScreen } from './screens/GameOverScreen';
import { IntroSequence } from './intro/IntroSequence';
import { ParticleSystem } from './utils/ParticleSystem';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private lastTime: number = 0;
    private isRunning: boolean = false;

    // Managers and Systems
    private inputManager: InputManager;
    private audioManager: AudioManager;
    private stateManager: GameStateManager;
    private scoreManager: ScoreManager;
    private collisionManager: CollisionManager;
    private spawnManager: SpawnManager;

    // Entities and Objects
    private player: Player | null = null;
    private enemies: BaseEnemy[] = [];
    private bones: Bone[] = [];
    private pumpkins: Pumpkin[] = [];
    private bushes: Bush[] = [];
    private candy: Candy | null = null;
    private heart: Heart | null = null;
    private jawbreaker: Jawbreaker | null = null;
    private orbitalJawbreaker: { jawbreaker: Jawbreaker } | null = null;

    // Renderers and Screens
    private backgroundRenderer: BackgroundRenderer | null = null;
    private bloodRenderer: BloodRenderer | null = null;
    private uiRenderer: UIRenderer | null = null;
    private gameOverScreen: GameOverScreen;
    private introSequence: IntroSequence;
    private particleSystem: ParticleSystem;

    // Assets
    private assets: LoadedAssets | null = null;
    private assetsLoaded: boolean = false;
    private assetsToLoad: number = 0;
    private assetsLoadedCount: number = 0;

    // Game State
    private isGameOver: boolean = false;
    private zombieNoiseTimer: number = 0;

    // Canvas positioning
    private canvasHorizontalOffset: number = -33;
    private canvasVerticalOffset: number = -100;
    private canvasSizeMultiplier: number = 2.0;
    private canvasHorizontalStretch: number = 1.13;
    private canvasVerticalStretch: number = 1.04;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.ctx.imageSmoothingEnabled = false;
        this.canvas.width = PICO8.DISPLAY_WIDTH;
        this.canvas.height = PICO8.DISPLAY_HEIGHT;
        
        // Initialize managers
        this.inputManager = new InputManager();
        this.stateManager = new GameStateManager();
        this.scoreManager = new ScoreManager();
        this.collisionManager = new CollisionManager();
        this.spawnManager = new SpawnManager();
        this.gameOverScreen = new GameOverScreen();
        this.introSequence = new IntroSequence([], []); // Will be updated when assets load
        this.particleSystem = new ParticleSystem();

        // Audio manager needs callback for intro sounds
        this.audioManager = new AudioManager(() => {
            this.assetLoaded();
        });

        this.setupCanvas();
        this.setupControls();
        this.setupKeyboardControls();
        this.loadAssets();
    }

    private setupCanvas(): void {
        const tvImg = document.getElementById('tvBackground') as HTMLImageElement;
        window.addEventListener('resize', () => this.updateCanvasPosition());
        
        const settings = this.stateManager.getSettings();
        tvImg.style.opacity = settings.tvOpacity.toString();
        
        // Position canvas once TV loads
        if (tvImg.complete && tvImg.naturalWidth) {
            this.updateCanvasPosition();
        }
    }

    private updateCanvasPosition(): void {
        const tvImg = document.getElementById('tvBackground') as HTMLImageElement;
        if (!tvImg || !tvImg.naturalWidth || !tvImg.naturalHeight) {
            console.warn('TV image not ready, waiting...');
            // Wait a bit and try again
            setTimeout(() => this.updateCanvasPosition(), 100);
            return;
        }
        
        console.log('TV image ready! Natural size:', tvImg.naturalWidth, 'x', tvImg.naturalHeight);

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const imgWidth = tvImg.naturalWidth;
        const imgHeight = tvImg.naturalHeight;
        const imgAspect = imgWidth / imgHeight;
        const viewportAspect = viewportWidth / viewportHeight;

        let renderedWidth: number, renderedHeight: number, offsetX: number, offsetY: number;

        if (viewportAspect > imgAspect) {
            renderedHeight = viewportHeight;
            renderedWidth = renderedHeight * imgAspect;
            offsetX = (viewportWidth - renderedWidth) / 2;
            offsetY = 0;
        } else {
            renderedWidth = viewportWidth;
            renderedHeight = renderedWidth / imgAspect;
            offsetX = 0;
            offsetY = (viewportHeight - renderedHeight) / 2;
        }

        const baseCanvasSize = Math.min(renderedWidth, renderedHeight) * 0.4;
        const baseCanvasLeft = offsetX + (renderedWidth - baseCanvasSize) / 2 - (renderedWidth * 0.2);
        const baseCanvasTop = offsetY + (renderedHeight - baseCanvasSize) / 2;

        const canvasSize = baseCanvasSize * this.canvasSizeMultiplier;
        const canvasWidth = canvasSize * this.canvasHorizontalStretch;
        const canvasHeight = canvasSize * this.canvasVerticalStretch;

        const scaleFactor = Math.min(renderedWidth, renderedHeight) / 400;
        const canvasLeft = baseCanvasLeft + (this.canvasHorizontalOffset * scaleFactor);
        const canvasTop = baseCanvasTop + (this.canvasVerticalOffset * scaleFactor);

        console.log('Canvas positioned at:', canvasLeft, canvasTop, 'size:', canvasWidth, 'x', canvasHeight);

        this.canvas.style.width = `${canvasWidth}px`;
        this.canvas.style.height = `${canvasHeight}px`;
        this.canvas.style.left = `${canvasLeft}px`;
        this.canvas.style.top = `${canvasTop}px`;
        this.canvas.style.transform = ''; // Clear any fallback transform
    }

    private setupControls(): void {
        // Setup sliders and toggles for CRT effects, TV opacity, etc.
        // This is similar to the original setupControls but uses the state manager
        const settings = this.stateManager.getSettings();

        const scanlinesToggle = document.getElementById('scanlinesToggle') as HTMLInputElement;
        if (scanlinesToggle) {
            scanlinesToggle.checked = settings.enableScanlines;
            scanlinesToggle.addEventListener('change', (e) => {
                this.stateManager.updateSetting('enableScanlines', (e.target as HTMLInputElement).checked);
            });
        }

        const rgbSeparationToggle = document.getElementById('rgbSeparationToggle') as HTMLInputElement;
        if (rgbSeparationToggle) {
            rgbSeparationToggle.checked = settings.enableRGBSeparation;
            rgbSeparationToggle.addEventListener('change', (e) => {
                this.stateManager.updateSetting('enableRGBSeparation', (e.target as HTMLInputElement).checked);
            });
        }

        const setupSlider = (id: string, valueId: string, setting: keyof typeof settings, scale: number = 100) => {
            const slider = document.getElementById(id) as HTMLInputElement;
            const valueDisplay = document.getElementById(valueId);
            if (slider) {
                const value = settings[setting] as number;
                slider.value = (value * scale).toString();
                if (valueDisplay) {
                    valueDisplay.textContent = value.toFixed(2);
                }
                slider.addEventListener('input', (e) => {
                    const newValue = parseInt((e.target as HTMLInputElement).value) / scale;
                    this.stateManager.updateSetting(setting, newValue);
                    if (valueDisplay) {
                        valueDisplay.textContent = newValue.toFixed(2);
                    }
                    if (setting === 'tvOpacity') {
                        const tvImg = document.getElementById('tvBackground') as HTMLImageElement;
                        if (tvImg) tvImg.style.opacity = newValue.toString();
                    }
                });
            }
        };

        setupSlider('glowSlider', 'glowValue', 'glowIntensity');
        setupSlider('vignetteSlider', 'vignetteValue', 'vignetteIntensity');
        setupSlider('fisheyeSlider', 'fisheyeValue', 'fisheyeIntensity');
        setupSlider('tvOpacitySlider', 'tvOpacityValue', 'tvOpacity');

        // Dev panel toggle
        let lastSuperKeyPress = 0;
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Meta' || e.key === 'OS') {
                const now = Date.now();
                if (now - lastSuperKeyPress < 300) {
                    const controls = document.getElementById('controls');
                    if (controls) {
                        controls.style.display = controls.style.display === 'none' ? 'block' : 'none';
                    }
                    lastSuperKeyPress = 0;
                } else {
                    lastSuperKeyPress = now;
                }
            }
        });
    }

    private setupKeyboardControls(): void {
        document.addEventListener('keydown', (e) => {
            // Controls screen dismiss
            if (this.stateManager.getState() === GameState.SHOWING_CONTROLS) {
                this.stateManager.setState(GameState.PLAYING);
                this.uiRenderer?.startTitleFade();
                this.audioManager.startIntroSounds();
                this.audioManager.fadeOutIntroSounds(2000); // Fade out ambient sounds over 2 seconds
                
                if (!this.introSequence.isComplete) {
                    this.introSequence.start();
                }
                return;
            }

            // Pause toggle (only works when not game over)
            if (e.key === 'Escape' && !this.isGameOver) {
                const wasPaused = this.stateManager.getState() === GameState.PAUSED;
                this.stateManager.setState(wasPaused ? GameState.PLAYING : GameState.PAUSED);
                
                const audio = document.getElementById('backgroundMusic') as HTMLAudioElement;
                if (audio) {
                    wasPaused ? audio.play() : audio.pause();
                }
                
                // Pause/resume all sounds
                if (wasPaused) {
                    // Resuming - sounds will start naturally as gameplay continues
                } else {
                    // Pausing - stop all sounds immediately
                    this.audioManager.pauseAllSounds();
                }
            }

            // Restart
            if ((e.key === 'r' || e.key === 'R') && this.isGameOver) {
                this.restart();
            }
        });

        // Restart button
        const restartButton = document.getElementById('restartButton');
        if (restartButton) {
            restartButton.addEventListener('click', () => {
                if (this.isGameOver) {
                    this.restart();
                }
            });
        }
    }

    private restart(): void {
        this.stateManager.setState(GameState.SHOWING_CONTROLS);
        this.isGameOver = false;
        this.introSequence.reset();
        this.gameOverScreen.reset();

        this.player?.reset();
        this.scoreManager.reset();
        this.spawnManager.reset();
        this.bloodRenderer?.clear();
        this.particleSystem.clear();
        this.backgroundRenderer?.reset();
        this.uiRenderer?.resetTitleFade();

        this.enemies = [];
        this.bones = [];
        this.candy = null;
        this.heart = null;
        this.jawbreaker = null;
        this.orbitalJawbreaker = null;
        this.zombieNoiseTimer = 0;

        if (this.assets) {
            this.enemies = this.spawnManager.initializeZombieHorde(this.assets.zombiePixels);
            this.pumpkins = [];
            this.bushes = this.spawnManager.initializeBushes(this.assets.bushPixels);
        }

        this.audioManager.stopBreathing();
        this.audioManager.stopStaticAudio();
        this.audioManager.playAllIntroSounds();
        this.audioManager.setIntroMusicPlaying(true);

        const audio = document.getElementById('backgroundMusic') as HTMLAudioElement;
        if (audio) audio.pause();
    }

    private loadAssets(): void {
        const loader = new AssetLoader(
            (loaded, total) => {
                this.assetsLoadedCount = loaded;
                this.assetsToLoad = total;
            },
            (assets) => {
                console.log('AssetLoader onComplete callback called!');
                this.assets = assets;
                this.assetsLoaded = true;
                console.log('this.assetsLoaded set to true');
                this.onAssetsLoaded();
            },
            () => {
                // TV loaded callback - update canvas position
                console.log('TV background loaded, updating canvas position');
                this.updateCanvasPosition();
            }
        );
        
        loader.load();
    }

    private assetLoaded(): void {
        // Called by audio manager for intro sounds - this is the 18th asset
        this.assetsLoadedCount++;
        console.log('Intro sounds finished loading, total assets now:', this.assetsLoadedCount);
        
        // Manually trigger completion check since this happens outside AssetLoader
        if (this.assetsLoadedCount >= 18 && this.assets && !this.assetsLoaded) {
            console.log('All assets (including audio) loaded! Triggering completion...');
            this.assetsLoaded = true;
            this.onAssetsLoaded();
        }
    }

    private onAssetsLoaded(): void {
        console.log('onAssetsLoaded called! Assets:', this.assets);
        if (!this.assets) return;

        this.player = new Player(this.assets.playerPixels);
        this.backgroundRenderer = new BackgroundRenderer(this.assets.streetPixels);
        this.bloodRenderer = new BloodRenderer(
            this.assets.bloodTopLeftImage,
            this.assets.bloodTopRightImage,
            this.assets.bloodBottomLeftImage,
            this.assets.bloodBottomRightImage
        );
        this.uiRenderer = new UIRenderer(this.assets.controlsImg, this.assets.titleImg);
        
        this.enemies = this.spawnManager.initializeZombieHorde(this.assets.zombiePixels);
        this.bushes = this.spawnManager.initializeBushes(this.assets.bushPixels);
        
        // Recreate intro sequence with loaded assets
        this.introSequence = new IntroSequence(this.assets.princessPixels, this.assets.piratePixels);

        this.audioManager.playAllIntroSounds();
        this.audioManager.setIntroMusicPlaying(true);
        
        this.updateCanvasPosition();
        console.log('Assets fully loaded and initialized!');
    }

    start(): void {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    private gameLoop = (currentTime: number = 0): void => {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.gameLoop);
    };

    private update(deltaTime: number): void {
        if (!this.assetsLoaded || !this.player || !this.assets) return;

        const targetFrameTime = 1000 / 60;
        const deltaMultiplier = deltaTime / targetFrameTime;

        this.uiRenderer?.updateTitleFade(deltaMultiplier);

        const state = this.stateManager.getState();
        
        if (state === GameState.SHOWING_CONTROLS || state === GameState.PAUSED) {
            this.introSequence.update(
                deltaMultiplier,
                this.player,
                this.enemies,
                this.audioManager,
                false
            );
            return;
        }

        if (this.isGameOver) {
            this.gameOverScreen.update(deltaMultiplier);
            return;
        }

        this.introSequence.update(
            deltaMultiplier,
            this.player,
            this.enemies,
            this.audioManager,
            state === GameState.PLAYING
        );

        const scrollSpeed = this.introSequence.roadScrollSpeed * deltaMultiplier;
        this.backgroundRenderer?.update(scrollSpeed);

        this.zombieNoiseTimer += deltaMultiplier;
        if (this.zombieNoiseTimer >= 30) {
            this.audioManager.playRandomZombieNoise();
            this.zombieNoiseTimer = 0;
        }

        // Player update
        const playerMovement = this.player.update(
            this.inputManager,
            deltaMultiplier,
            scrollSpeed,
            this.introSequence.isComplete,
            (x, y, w, h, jumping) => this.collisionManager.checkCollision(x, y, w, h, jumping, this.pumpkins, this.enemies)
        );

        this.audioManager.updateBreathingAudio(
            playerMovement.moving && playerMovement.direction === 'down',
            deltaMultiplier,
            this.isGameOver
        );

        // Spawn system
        this.spawnManager.update(deltaMultiplier, playerMovement.moving);

        if (this.spawnManager.shouldSpawnPumpkin()) {
            this.pumpkins.push(this.spawnManager.spawnPumpkin(this.assets.pumpkinPixels, this.assets.smashedPumpkinPixels));
        }

        if (this.spawnManager.shouldSpawnBush()) {
            const bush = this.spawnManager.spawnBush(this.assets.bushPixels, this.bushes);
            if (bush) this.bushes.push(bush);
        }

        if (this.spawnManager.shouldSpawnEnemy()) {
            const newEnemies = this.spawnManager.spawnEnemy(
                this.assets.zombiePixels,
                this.assets.skeletonPixels,
                this.player.x,
                this.scoreManager.getCandyCount(),
                (fromX, fromY, targetX, targetY) => this.shootBone(fromX, fromY, targetX, targetY)
            );
            this.enemies.push(...newEnemies);
        }

        if (this.spawnManager.shouldSpawnCandy() && !this.candy) {
            this.candy = this.spawnManager.spawnCandy(this.assets.candyPixels);
        }

        if (this.spawnManager.shouldSpawnHeart(this.scoreManager.getCandyCount()) && !this.heart && this.scoreManager.getLives() < 3) {
            this.heart = this.spawnManager.spawnHeart(this.assets.heartPixels);
        }

        if (this.spawnManager.shouldSpawnJawbreaker(this.scoreManager.getCandyCount()) && !this.jawbreaker && !this.orbitalJawbreaker) {
            this.jawbreaker = this.spawnManager.spawnJawbreaker(this.assets.jawbreakerPixels);
        }

        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaMultiplier, this.player.x, this.player.y);

            if (enemy.isOffScreen()) {
                this.enemies.splice(i, 1);
            }
        }

        // Update bones
        for (let i = this.bones.length - 1; i >= 0; i--) {
            const bone = this.bones[i];
            bone.update(deltaMultiplier, scrollSpeed); // Add scrollSpeed parameter

            if (bone.isOffScreen()) {
                this.bones.splice(i, 1);
            } else if (!this.player.getIsJumping() && bone.checkCollision(this.player.x, this.player.y, this.player.spriteWidth, this.player.spriteHeight)) {
                this.takeDamage();
                this.bones.splice(i, 1);
            }
        }

        // Update pumpkins
        for (let i = this.pumpkins.length - 1; i >= 0; i--) {
            this.pumpkins[i].update(deltaMultiplier, scrollSpeed);
            if (this.pumpkins[i].isOffScreen()) {
                this.pumpkins.splice(i, 1);
            }
        }

        // Update bushes
        for (let i = this.bushes.length - 1; i >= 0; i--) {
            this.bushes[i].update(deltaMultiplier, scrollSpeed);
            if (this.bushes[i].isOffScreen()) {
                this.bushes.splice(i, 1);
            }
        }

        // Update candy
        if (this.candy) {
            this.candy.update(deltaMultiplier, scrollSpeed, this.player.x, this.player.y);
            if (this.candy.isOffScreen()) {
                this.candy = null;
            } else if (this.candy.checkCollision(this.player.x, this.player.y, this.player.spriteWidth, this.player.spriteHeight)) {
                this.collectCandy();
            }
        }

        // Update heart
        if (this.heart) {
            this.heart.update(deltaMultiplier, scrollSpeed, this.player.x, this.player.y);
            if (this.heart.isOffScreen()) {
                this.heart = null;
            } else if (this.heart.checkCollision(this.player.x, this.player.y, this.player.spriteWidth, this.player.spriteHeight)) {
                this.collectHeart();
            }
        }

        // Update jawbreaker
        if (this.jawbreaker) {
            this.jawbreaker.update(deltaMultiplier, scrollSpeed, this.player.x, this.player.y);
            if (this.jawbreaker.isOffScreen()) {
                this.jawbreaker = null;
            } else if (this.jawbreaker.checkCollision(this.player.x, this.player.y, this.player.spriteWidth, this.player.spriteHeight)) {
                this.collectJawbreaker();
            }
        }

        // Update orbital jawbreaker
        if (this.orbitalJawbreaker) {
            this.orbitalJawbreaker.jawbreaker.updateOrbital(this.player.x, this.player.y, deltaMultiplier);
            
            // Check collision with enemies
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                if (this.orbitalJawbreaker.jawbreaker.checkOrbitalCollision(
                    enemy.x, enemy.y, 8, 8
                )) {
                    // Enemy hit! Create explosion and remove both
                    this.particleSystem.emit(enemy.x + 4, enemy.y + 4, ['#FF0000', '#FF4444', '#FF6666', '#FFFFFF'], 15);
                    this.audioManager.playJawbreakerExplosion();
                    this.enemies.splice(i, 1);
                    this.orbitalJawbreaker = null;
                    break; // Only hit one enemy per frame
                }
            }
        }

        this.bloodRenderer?.update(deltaMultiplier);
        this.particleSystem.update(deltaMultiplier);

        // Check damage conditions
        this.checkDamageConditions();
    }

    private checkDamageConditions(): void {
        if (!this.player) return;

        let shouldTakeDamage = false;

        if (!this.player.getIsJumping() || this.player.y < 20) {
            const hitEnemy = this.collisionManager.checkEnemyCollisionWithType(
                this.player.x,
                this.player.y,
                this.player.spriteWidth,
                this.player.spriteHeight,
                this.enemies
            );

            if (hitEnemy) {
                if (hitEnemy.isAttacking) {
                    this.player.applySlowdown(0.35, 'down', 1);
                } else {
                    this.player.bounceBack(this.player.spriteHeight);
                }
                shouldTakeDamage = true;
            }
        }

        if (this.player.y <= 10) {
            shouldTakeDamage = true;
            this.player.y = 10;
        }

        if (this.player.y >= PICO8.SCREEN_HEIGHT - this.player.spriteHeight) {
            shouldTakeDamage = true;
        }

        if (shouldTakeDamage && !this.player.isInvincible()) {
            this.takeDamage();
        }
        
        // Handle pumpkin collisions (only when not jumping)
        if (!this.player.getIsJumping()) {
            const hitPumpkin = this.collisionManager.checkPumpkinCollision(
                this.player.x,
                this.player.y,
                this.player.spriteWidth,
                this.player.spriteHeight,
                this.pumpkins
            );
            if (hitPumpkin && !hitPumpkin.data.isSmashed) {
                hitPumpkin.smash();
                this.particleSystem.emit(hitPumpkin.data.x + 3, hitPumpkin.data.y + 3, ['#FF8C00', '#FFA500', '#FFB347', '#FFD700'], 12);
                this.audioManager.playPumpkinHit();
            }
        }
    }

    private shootBone(fromX: number, fromY: number, targetX: number, targetY: number): void {
        const dx = targetX - fromX;
        const dy = targetY - fromY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) {
            return; // Don't shoot if skeleton is exactly on player
        }

        const speed = 1.2; // Increased from 0.75 for faster bones
        const vx = (dx / distance) * speed;
        const vy = (dy / distance) * speed;

        this.bones.push(new Bone(fromX, fromY, vx, vy));
    }

    private takeDamage(): void {
        this.scoreManager.takeDamage();
        this.audioManager.playHitSounds();
        
        if (this.scoreManager.isGameOver()) {
            this.gameOver();
            return;
        }

        this.bloodRenderer?.addSplatter();
        this.player?.setInvincibility(120);
    }

    private gameOver(): void {
        if (this.isGameOver) return;
        
        this.isGameOver = true;
        this.bloodRenderer?.clear();

        const audio = document.getElementById('backgroundMusic') as HTMLAudioElement;
        if (audio) audio.pause();

        this.audioManager.stopBreathing();
        this.audioManager.playStaticAudio();
    }

    private collectCandy(): void {
        if (!this.candy) return;
        
        this.particleSystem.emit(this.candy.data.x + 2, this.candy.data.y + 2, ['#FFA500', '#FFFF00', '#FFFFFF']);
        this.candy = null;
        this.scoreManager.collectCandy();
        this.audioManager.playCandyCoin();
    }

    private collectHeart(): void {
        if (!this.heart) return;
        
        this.particleSystem.emit(this.heart.data.x + 2, this.heart.data.y + 2, ['#FF0000', '#FF4444', '#FF6666']);
        this.heart = null;
        
        const oldLives = this.scoreManager.getLives();
        this.scoreManager.addLife();
        this.audioManager.playHeartPowerUp();
        
        if (this.scoreManager.getLives() > oldLives) {
            this.bloodRenderer?.fadeOldestBlood();
        }
    }

    private collectJawbreaker(): void {
        if (!this.jawbreaker) return;
        
        this.particleSystem.emit(this.jawbreaker.data.x + 2, this.jawbreaker.data.y + 2, ['#FFA500', '#FFFF00', '#FFFFFF']);
        this.jawbreaker.setOrbiting();
        this.orbitalJawbreaker = {
            jawbreaker: this.jawbreaker
        };
        this.jawbreaker = null;
        this.audioManager.playJawbreakerCollect();
    }

    private render(): void {
        // Clear with black
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, PICO8.DISPLAY_WIDTH, PICO8.DISPLAY_HEIGHT);

        if (!this.assetsLoaded) {
            // Draw simple loading screen since UIRenderer doesn't exist yet
            this.ctx.save();
            this.ctx.scale(PICO8.DISPLAY_SCALE, PICO8.DISPLAY_SCALE);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '4px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('LOADING...', PICO8.SCREEN_WIDTH / 2, PICO8.SCREEN_HEIGHT / 2 - 10);
            
            // Progress bar
            const barWidth = 80;
            const barHeight = 8;
            const barX = (PICO8.SCREEN_WIDTH - barWidth) / 2;
            const barY = PICO8.SCREEN_HEIGHT / 2;
            
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.strokeRect(barX, barY, barWidth, barHeight);
            
            const progress = this.assetsToLoad > 0 ? this.assetsLoadedCount / this.assetsToLoad : 0;
            const fillWidth = (barWidth - 2) * progress;
            this.ctx.fillStyle = '#00FF00';
            this.ctx.fillRect(barX + 1, barY + 1, fillWidth, barHeight - 2);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillText(`${Math.floor(progress * 100)}%`, PICO8.SCREEN_WIDTH / 2, barY + barHeight + 8);
            
            this.ctx.restore();
            
            return;
        }

        this.ctx.save();
        this.ctx.scale(PICO8.DISPLAY_SCALE, PICO8.DISPLAY_SCALE);

        this.backgroundRenderer?.render(this.ctx);

        for (const pumpkin of this.pumpkins) {
            pumpkin.render(this.ctx);
        }

        for (const bush of this.bushes) {
            bush.render(this.ctx);
        }

        for (const enemy of this.enemies) {
            enemy.render(this.ctx);
        }

        for (const bone of this.bones) {
            bone.render(this.ctx, this.assets!.bonePixels);
        }

        if (this.candy) this.candy.render(this.ctx);
        if (this.heart && this.introSequence.isComplete) this.heart.render(this.ctx);
        if (this.jawbreaker) this.jawbreaker.render(this.ctx);

        this.player?.render(this.ctx);

        // Render orbital jawbreaker after player so it appears in front
        if (this.orbitalJawbreaker) {
            this.orbitalJawbreaker.jawbreaker.render(this.ctx);
        }

        // Render intro characters during intro phases
        if (this.introSequence.shouldRenderIntroCharacters()) {
            this.introSequence.getPrincess().render(this.ctx);
            this.introSequence.getPirate().render(this.ctx);
        }

        this.bloodRenderer?.render(this.ctx);
        this.particleSystem.render(this.ctx);

        const state = this.stateManager.getState();
        this.uiRenderer?.renderTitle(this.ctx, state);

        if (state === GameState.SHOWING_CONTROLS) {
            this.uiRenderer?.renderControlsScreen(this.ctx, this.scoreManager.getHighScore());
        }

        if (state === GameState.PAUSED) {
            this.uiRenderer?.renderPauseScreen(this.ctx);
        }

        if (this.isGameOver) {
            this.gameOverScreen.render(this.ctx, this.scoreManager.getCandyCount(), this.assets?.candyPixels || []);
        } else {
            // Render candy counter at bottom of screen (only when not game over)
            this.uiRenderer?.renderCandyCounter(this.ctx, this.scoreManager.getCandyCount(), this.assets?.candyPixels || []);
        }

        this.ctx.restore();

        // Apply CRT effects
        const settings = this.stateManager.getSettings();
        applyCRTEffect(this.ctx, this.canvas, {
            enableScanlines: settings.enableScanlines,
            enableRGBSeparation: settings.enableRGBSeparation,
            glowIntensity: settings.glowIntensity,
            vignetteIntensity: settings.vignetteIntensity
        });
        applyFisheyeEffect(this.ctx, this.canvas, settings.fisheyeIntensity);
    }
}

