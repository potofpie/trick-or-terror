import { PICO8, PICO8Utils } from './constraints/PICO8Constraints';
import { applyCRTEffect, applyFisheyeEffect } from './effects/CRTEffect';
import tvImage from './assets/tv_croped.png';
import musicFile from './assets/SCP-x1x.mp3';
import glitterBlast from './assets/Glitter Blast.mp3';
import zombieSprite from './assets/zombie_man_8x8.png';
import spaceManSprite from './assets/space_man_8x8.png';
import skeletonSprite from './assets/skeloton.png';
import boneSprite from './assets/bone.png';
import pumpkinSprite from './assets/pumpkin.png';
import smashedPumpkinSprite from './assets/smashed-pumpkin.png';
import streetImage from './assets/street.png';
import candyCornSprite from './assets/candy_corn.png';
import bushSprite from './assets/bush.png';
import heartSprite from './assets/heart.png';
import staticSound from './assets/static_sound.ogg';
import breathingSound from './assets/breathing.wav';
import zombieNoise1 from './assets/zombienoises/zombienoise1.ogg';
import zombieNoise2 from './assets/zombienoises/zombienoise2.ogg';
import zombieNoise3 from './assets/zombienoises/zombienoise3.ogg';
import fastZombie1 from './assets/zombienoises/fastzombie1.ogg';
import bloodTopLeftImage from './assets/blood_top_left.png';
import bloodTopRightImage from './assets/blood_right_top.png';
import bloodBottomLeftImage from './assets/blood_bottom_left.png';
import bloodBottomRightImage from './assets/blood_bottom_right.png';
import controlsImage from './assets/controls.png';
import titleImage from './assets/title.png';
import hitSound from './assets/qubodupImpactMeat02.ogg';
import pumpkinHitSound from './assets/qubodupImpactMeat02.ogg';
import femaleScream1 from './assets/female_screams/1.ogg';
import femaleScream2 from './assets/female_screams/2.ogg';
import femaleScream3 from './assets/female_screams/3.ogg';
import femaleScream4 from './assets/female_screams/4.ogg';
import jumpCoinSound from './assets/retro_coin_02.ogg';
import candyCoinSound from './assets/retro_coin_01.ogg';
import heartPowerUpSound from './assets/power_up_04.ogg';
import parkAmbienceBirds from './assets/intro/park_ambience_birds.ogg';
import parkAmbienceWind from './assets/intro/park_ambience_wind.ogg';
import treeCreak from './assets/intro/tree_creak.ogg';

enum GameState {
    SHOWING_CONTROLS,
    PLAYING,
    PAUSED
}

interface Enemy {
    x: number;
    y: number;
    sprite: Array<{x: number, y: number, color: string}>;
    waddleTimer: number;
    waddleOffsetX: number;
    waddleOffsetY: number;
    rotation?: number;
    facingLeft: boolean; // Direction the sprite is facing
    isAttacking?: boolean; // Attacking zombies move toward player
    type: 'ghost' | 'skeleton'; // Enemy type
    boneShootTimer?: number; // Timer for bone shooting
    hasShot?: boolean; // Track if skeleton has already shot
}

interface Bone {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
}

class PICO8Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private lastTime: number = 0;
    private isRunning: boolean = false;
    
    // CRT Effects
    private enableScanlines: boolean = true;
    private enableRGBSeparation: boolean = true;
    private glowIntensity: number = 0.99;
    private vignetteIntensity: number = 0.72;
    private fisheyeIntensity: number = 0.60;
    private tvOpacity: number = 1.0;
    
    // Canvas positioning (not saved)
    private canvasHorizontalOffset: number = -33;
    private canvasVerticalOffset: number = -100;
    private canvasSizeMultiplier: number = 2.0;
    private canvasHorizontalStretch: number = 1.13;
    private canvasVerticalStretch: number = 1.04;
    
    // Game state
    private playerX: number = 60;
    private playerY: number = 80;
    private playerColor: number = PICO8.COLORS.WHITE;
    private waddleOffsetX: number = 0;
    private waddleOffsetY: number = 0;
    private waddleTimer: number = 0;
    private rotation: number = 0;
    private lastDirection: string = '';
    private jumpOffset: number = 0;
    private isJumping: boolean = false;
    private jumpTimer: number = 0;
    private spacePressed: boolean = false;
    private breathingAudio: HTMLAudioElement | null = null;
    private isBreathing: boolean = false;
    private audioContext: AudioContext | null = null;
    private staticAudioBuffer: AudioBuffer | null = null;
    private staticSourceNode: AudioBufferSourceNode | null = null;
    private staticGainNode: GainNode | null = null;
    private zombieNoises: HTMLAudioElement[] = [];
    private zombieNoiseTimer: number = 0;
    private glitterBlastAudio: HTMLAudioElement | null = null;
    private introMusicPlaying: boolean = false;
    private gameplayMusicStarted: boolean = false;
    private hitSounds: HTMLAudioElement[] = [];
    private hitAudio: HTMLAudioElement | null = null;
    private jumpCoinAudio: HTMLAudioElement | null = null;
    private candyCoinAudio: HTMLAudioElement | null = null;
    private heartPowerUpAudio: HTMLAudioElement | null = null;
    private pumpkinHitAudio: HTMLAudioElement | null = null;
    private introSounds: HTMLAudioElement[] = [];
    
    // Sprite assets
    private ghostImage: HTMLImageElement | null = null;
    private ghostPixels: Array<{x: number, y: number, color: string}> = [];
    private pumpkinImage: HTMLImageElement | null = null;
    private pumpkinPixels: Array<{x: number, y: number, color: string}> = [];
    private smashedPumpkinImage: HTMLImageElement | null = null;
    private smashedPumpkinPixels: Array<{x: number, y: number, color: string}> = [];
    private streetImage: HTMLImageElement | null = null;
    private streetPixels: Array<{x: number, y: number, color: string}> = [];
    private candyImage: HTMLImageElement | null = null;
    private candyPixels: Array<{x: number, y: number, color: string}> = [];
    private heartImage: HTMLImageElement | null = null;
    private heartPixels: Array<{x: number, y: number, color: string}> = [];
    private bushImage: HTMLImageElement | null = null;
    private bushPixels: Array<{x: number, y: number, color: string}> = [];
    private bloodTopLeftImage: HTMLImageElement | null = null;
    private bloodTopRightImage: HTMLImageElement | null = null;
    private bloodBottomLeftImage: HTMLImageElement | null = null;
    private bloodBottomRightImage: HTMLImageElement | null = null;
    private controlsImg: HTMLImageElement | null = null;
    private titleImg: HTMLImageElement | null = null;
    
    // Attacking enemy spawning
    private enemySpawnTimer: number = 0;
    
    // Pumpkin obstacles
    private pumpkins: Array<{x: number, y: number, isSmashed: boolean}> = [];
    private pumpkinSpawnTimer: number = 0;
    
    // Bush decorations
    private bushes: Array<{x: number, y: number}> = [];
    private bushSpawnTimer: number = 0;
    
    // Enemies
    private enemies: Enemy[] = [];
    private enemyPixels: Array<{x: number, y: number, color: string}> = [];
    private enemyImage: HTMLImageElement | null = null;
    private skeletonPixels: Array<{x: number, y: number, color: string}> = [];
    private skeletonImage: HTMLImageElement | null = null;
    
    // Bones
    private bones: Bone[] = [];
    private bonePixels: Array<{x: number, y: number, color: string}> = [];
    private boneImage: HTMLImageElement | null = null;
    
    // Game state
    private isGameOver: boolean = false;
    private gameState: GameState = GameState.SHOWING_CONTROLS;
    private staticNoiseOffset: number = 0;
    private lives: number = 3;
    private highScore: number = 0;
    private bloodSplatters: Array<{opacity: number, fadeTimer: number, corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right', state: 'initial' | 'dim' | 'fading'}> = [];
    private sparkleParticles: Array<{x: number, y: number, vx: number, vy: number, life: number, maxLife: number, color: string, size: number}> = [];
    private invincibilityTimer: number = 0;
    private gameOverTimer: number = 0;
    
    // Intro sequence
    private isIntroComplete: boolean = false;
    private introPhase: 'waiting' | 'walking-to-start' | 'zombies-entering' | 'jump' | 'road-starting' | 'complete' = 'waiting';
    private introTimer: number = 0;
    private roadScrollSpeed: number = 0;
    private musicFadeStartVolume: number = 0.8;
    private titleFadeTimer: number = 0;
    private titleFading: boolean = false;
    
    // Asset loading
    private assetsLoaded: boolean = false;
    private assetsToLoad: number = 0;
    private assetsLoadedCount: number = 0;
    
    // Random walking on controls screen
    private randomWalkTimer: number = 0;
    private randomWalkDirection: string = 'right';
    private randomWalkDuration: number = 60; // Start with 1 second duration
    private targetStartX: number = 60;
    private targetStartY: number = 80;
    
    // Background scrolling
    private backgroundScrollY: number = 0;
    
    // Candy system
    private candy: {x: number, y: number, rotation: number} | null = null;
    private candySpawnTimer: number = 0;
    private candyCount: number = 0;
    
    // Heart system
    private heart: {x: number, y: number, rotation: number} | null = null;
    private heartSpawnTimer: number = 0;
    
    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        
        // Set up canvas for pixel-perfect rendering
        this.ctx.imageSmoothingEnabled = false;
        
        // Set canvas size to match our display dimensions (4x scale)
        this.canvas.width = PICO8.DISPLAY_WIDTH;
        this.canvas.height = PICO8.DISPLAY_HEIGHT;
        
        // Load saved settings from localStorage
        this.loadSettings();
        
        // Count assets to load (images that need onload)
        this.assetsToLoad = 19; // ghost, pumpkin, street, enemy, skeleton, bone, candy, heart, bush, 4 blood images, controls, title, 3 intro sounds = 19 total
        
        // Set TV background image
        const tvImg = document.getElementById('tvBackground') as HTMLImageElement;
        tvImg.src = tvImage;
        
        // Set up responsive canvas positioning
        tvImg.onload = () => {
            this.updateCanvasPosition();
            // Apply saved TV opacity after image loads
            tvImg.style.opacity = this.tvOpacity.toString();
            this.assetLoaded();
        };
        window.addEventListener('resize', () => this.updateCanvasPosition());
        
        // Set up background music
        this.setupAudio();
        this.setupBreathingAudio();
        this.setupStaticAudio();
        this.setupZombieNoises();
        this.setupGlitterBlast();
        this.setupHitSounds();
        this.setupJumpCoinSound();
        this.setupCandyCoinSound();
        this.setupHeartPowerUpSound();
        this.setupPumpkinHitSound();
        this.setupIntroSounds();
        this.setupClickListener();
        
        // Load sprites
        this.loadGhostSprite();
        this.loadPumpkinSprite();
        this.loadSmashedPumpkinSprite();
        this.loadStreetBackground();
        this.loadEnemySprite();
        this.loadSkeletonSprite();
        this.loadBoneSprite();
        this.loadCandySprite();
        this.loadHeartSprite();
        this.loadBushSprite();
        this.loadBloodImage();
        this.loadControlsImage();
        this.loadTitleImage();
        this.initializePumpkins();
        this.initializeBushes();
        
        this.setupInput();
        this.setupControls();
        this.start();
    }
    
    private assetLoaded(): void {
        this.assetsLoadedCount++;
        this.updateLoadingScreen();
        
        if (this.assetsLoadedCount >= this.assetsToLoad) {
            this.assetsLoaded = true;
            // Start playing all intro sounds looping when ready
            this.playAllIntroSounds();
            this.introMusicPlaying = true;
        }
    }
    
    private updateLoadingScreen(): void {
        // Loading screen is now rendered on canvas in renderLoadingScreen()
    }
    
    private updateCanvasPosition(): void {
        const tvImg = document.getElementById('tvBackground') as HTMLImageElement;
        if (!tvImg || !tvImg.naturalWidth || !tvImg.naturalHeight) return;
        
        // Get the viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Get the TV image natural dimensions
        const imgWidth = tvImg.naturalWidth;
        const imgHeight = tvImg.naturalHeight;
        const imgAspect = imgWidth / imgHeight;
        
        // Calculate the rendered size of the TV image with object-fit: contain
        const viewportAspect = viewportWidth / viewportHeight;
        let renderedWidth: number;
        let renderedHeight: number;
        let offsetX: number;
        let offsetY: number;
        
        if (viewportAspect > imgAspect) {
            // Height constrained
            renderedHeight = viewportHeight;
            renderedWidth = renderedHeight * imgAspect;
            offsetX = (viewportWidth - renderedWidth) / 2;
            offsetY = 0;
        } else {
            // Width constrained
            renderedWidth = viewportWidth;
            renderedHeight = renderedWidth / imgAspect;
            offsetX = 0;
            offsetY = (viewportHeight - renderedHeight) / 2;
        }
        
        // Calculate canvas size and position based on TV image
        // Use dynamic positioning based on actual image dimensions
        // Position canvas slightly right of center to account for TV bezel
        const baseCanvasSize = Math.min(renderedWidth, renderedHeight) * 0.4; // 40% of smaller dimension
        const baseCanvasLeft = offsetX + (renderedWidth - baseCanvasSize) / 2 - (renderedWidth * 0.2); // Shift left 5% of TV width
        const baseCanvasTop = offsetY + (renderedHeight - baseCanvasSize) / 2; // Center vertically
        
        // Apply adjustments (not saved to localStorage)
        const canvasSize = baseCanvasSize * this.canvasSizeMultiplier;
        const canvasWidth = canvasSize * this.canvasHorizontalStretch;
        const canvasHeight = canvasSize * this.canvasVerticalStretch;
        
        // Scale offsets proportionally to rendered size to maintain alignment at different window sizes
        const scaleFactor = Math.min(renderedWidth, renderedHeight) / 400; // Use 400 as reference scale
        const canvasLeft = baseCanvasLeft + (this.canvasHorizontalOffset * scaleFactor);
        const canvasTop = baseCanvasTop + (this.canvasVerticalOffset * scaleFactor);
        
        // Apply to canvas
        this.canvas.style.width = `${canvasWidth}px`;
        this.canvas.style.height = `${canvasHeight}px`;
        this.canvas.style.left = `${canvasLeft}px`;
        this.canvas.style.top = `${canvasTop}px`;
    }
    
    private loadSettings(): void {
        // Load settings from localStorage
        const saved = localStorage.getItem('gameSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.enableScanlines = settings.enableScanlines ?? true;
                this.enableRGBSeparation = settings.enableRGBSeparation ?? true;
                this.glowIntensity = settings.glowIntensity ?? 0.99;
                this.vignetteIntensity = settings.vignetteIntensity ?? 0.72;
                this.fisheyeIntensity = settings.fisheyeIntensity ?? 0.60;
                this.tvOpacity = settings.tvOpacity ?? 1.0;
                this.highScore = settings.highScore ?? 0;
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        }
    }
    
    private saveSettings(): void {
        const settings = {
            enableScanlines: this.enableScanlines,
            enableRGBSeparation: this.enableRGBSeparation,
            glowIntensity: this.glowIntensity,
            vignetteIntensity: this.vignetteIntensity,
            fisheyeIntensity: this.fisheyeIntensity,
            tvOpacity: this.tvOpacity,
            highScore: this.highScore
        };
        localStorage.setItem('gameSettings', JSON.stringify(settings));
    }
    
    private setupControls(): void {
        const scanlinesToggle = document.getElementById('scanlinesToggle') as HTMLInputElement;
        if (scanlinesToggle) {
            scanlinesToggle.checked = this.enableScanlines;
            scanlinesToggle.addEventListener('change', (e) => {
                this.enableScanlines = (e.target as HTMLInputElement).checked;
                this.saveSettings();
            });
        }
        
        const rgbSeparationToggle = document.getElementById('rgbSeparationToggle') as HTMLInputElement;
        if (rgbSeparationToggle) {
            rgbSeparationToggle.checked = this.enableRGBSeparation;
            rgbSeparationToggle.addEventListener('change', (e) => {
                this.enableRGBSeparation = (e.target as HTMLInputElement).checked;
                this.saveSettings();
            });
        }
        
        const glowSlider = document.getElementById('glowSlider') as HTMLInputElement;
        const glowValue = document.getElementById('glowValue');
        if (glowSlider) {
            glowSlider.value = (this.glowIntensity * 100).toString();
            if (glowValue) {
                glowValue.textContent = this.glowIntensity.toFixed(2);
            }
            glowSlider.addEventListener('input', (e) => {
                this.glowIntensity = parseInt((e.target as HTMLInputElement).value) / 100;
                if (glowValue) {
                    glowValue.textContent = this.glowIntensity.toFixed(2);
                }
                this.saveSettings();
            });
        }
        
        const vignetteSlider = document.getElementById('vignetteSlider') as HTMLInputElement;
        const vignetteValue = document.getElementById('vignetteValue');
        if (vignetteSlider) {
            vignetteSlider.value = (this.vignetteIntensity * 100).toString();
            if (vignetteValue) {
                vignetteValue.textContent = this.vignetteIntensity.toFixed(2);
            }
            vignetteSlider.addEventListener('input', (e) => {
                this.vignetteIntensity = parseInt((e.target as HTMLInputElement).value) / 100;
                if (vignetteValue) {
                    vignetteValue.textContent = this.vignetteIntensity.toFixed(2);
                }
                this.saveSettings();
            });
        }
        
        const fisheyeSlider = document.getElementById('fisheyeSlider') as HTMLInputElement;
        const fisheyeValue = document.getElementById('fisheyeValue');
        if (fisheyeSlider) {
            fisheyeSlider.value = (this.fisheyeIntensity * 100).toString();
            if (fisheyeValue) {
                fisheyeValue.textContent = this.fisheyeIntensity.toFixed(2);
            }
            fisheyeSlider.addEventListener('input', (e) => {
                this.fisheyeIntensity = parseInt((e.target as HTMLInputElement).value) / 100;
                if (fisheyeValue) {
                    fisheyeValue.textContent = this.fisheyeIntensity.toFixed(2);
                }
                this.saveSettings();
            });
        }
        
        const tvOpacitySlider = document.getElementById('tvOpacitySlider') as HTMLInputElement;
        const tvOpacityValue = document.getElementById('tvOpacityValue');
        if (tvOpacitySlider) {
            tvOpacitySlider.value = (this.tvOpacity * 100).toString();
            if (tvOpacityValue) {
                tvOpacityValue.textContent = this.tvOpacity.toFixed(2);
            }
            tvOpacitySlider.addEventListener('input', (e) => {
                this.tvOpacity = parseInt((e.target as HTMLInputElement).value) / 100;
                if (tvOpacityValue) {
                    tvOpacityValue.textContent = this.tvOpacity.toFixed(2);
                }
                // Apply opacity to TV image
                const tvImg = document.getElementById('tvBackground') as HTMLImageElement;
                if (tvImg) {
                    tvImg.style.opacity = this.tvOpacity.toString();
                }
                this.saveSettings();
            });
        }
        
        // Canvas positioning controls (not saved)
        const canvasHSlider = document.getElementById('canvasHSlider') as HTMLInputElement;
        const canvasHValue = document.getElementById('canvasHValue');
        if (canvasHSlider) {
            canvasHSlider.addEventListener('input', (e) => {
                this.canvasHorizontalOffset = parseInt((e.target as HTMLInputElement).value);
                if (canvasHValue) {
                    canvasHValue.textContent = this.canvasHorizontalOffset.toString();
                }
                this.updateCanvasPosition();
            });
        }
        
        const canvasVSlider = document.getElementById('canvasVSlider') as HTMLInputElement;
        const canvasVValue = document.getElementById('canvasVValue');
        if (canvasVSlider) {
            canvasVSlider.addEventListener('input', (e) => {
                this.canvasVerticalOffset = parseInt((e.target as HTMLInputElement).value);
                if (canvasVValue) {
                    canvasVValue.textContent = this.canvasVerticalOffset.toString();
                }
                this.updateCanvasPosition();
            });
        }
        
        const canvasSizeSlider = document.getElementById('canvasSizeSlider') as HTMLInputElement;
        const canvasSizeValue = document.getElementById('canvasSizeValue');
        if (canvasSizeSlider) {
            canvasSizeSlider.addEventListener('input', (e) => {
                this.canvasSizeMultiplier = parseInt((e.target as HTMLInputElement).value) / 100;
                if (canvasSizeValue) {
                    canvasSizeValue.textContent = this.canvasSizeMultiplier.toFixed(2);
                }
                this.updateCanvasPosition();
            });
        }
        
        const canvasStretchHSlider = document.getElementById('canvasStretchHSlider') as HTMLInputElement;
        const canvasStretchHValue = document.getElementById('canvasStretchHValue');
        if (canvasStretchHSlider) {
            canvasStretchHSlider.addEventListener('input', (e) => {
                this.canvasHorizontalStretch = parseInt((e.target as HTMLInputElement).value) / 100;
                if (canvasStretchHValue) {
                    canvasStretchHValue.textContent = this.canvasHorizontalStretch.toFixed(2);
                }
                this.updateCanvasPosition();
            });
        }
        
        const canvasStretchVSlider = document.getElementById('canvasStretchVSlider') as HTMLInputElement;
        const canvasStretchVValue = document.getElementById('canvasStretchVValue');
        if (canvasStretchVSlider) {
            canvasStretchVSlider.addEventListener('input', (e) => {
                this.canvasVerticalStretch = parseInt((e.target as HTMLInputElement).value) / 100;
                if (canvasStretchVValue) {
                    canvasStretchVValue.textContent = this.canvasVerticalStretch.toFixed(2);
                }
                this.updateCanvasPosition();
            });
        }
        
        const pauseToggle = document.getElementById('pauseToggle') as HTMLInputElement;
        if (pauseToggle) {
            pauseToggle.addEventListener('change', (e) => {
                const isPaused = (e.target as HTMLInputElement).checked;
                this.gameState = isPaused ? GameState.PAUSED : GameState.PLAYING;
                
                // Pause/resume music
                const audio = document.getElementById('backgroundMusic') as HTMLAudioElement;
                if (audio) {
                    if (isPaused) {
                        audio.pause();
                    } else {
                        audio.play().catch(e => console.log('Audio play failed:', e));
                    }
                }
                
                // Intro sounds play automatically, no need to pause/resume
            });
        }
        
        // Dev panel toggle with double super key press
        let lastSuperKeyPress = 0;
        const doubleTapDelay = 300; // ms
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Meta' || e.key === 'OS') {
                const now = Date.now();
                if (now - lastSuperKeyPress < doubleTapDelay) {
                    // Double tap detected
                    const controls = document.getElementById('controls');
                    if (controls) {
                        controls.style.display = controls.style.display === 'none' ? 'block' : 'none';
                    }
                    lastSuperKeyPress = 0; // Reset to avoid triple tap
                } else {
                    lastSuperKeyPress = now;
                }
            }
            
            // Dismiss controls screen with any key
            if (this.gameState === GameState.SHOWING_CONTROLS) {
                this.gameState = GameState.PLAYING;
                this.titleFading = true;
                this.titleFadeTimer = 0;
                
                // Start intro sounds now that user has interacted
                this.startIntroSounds();
                
                // Start intro sequence if not complete
                if (!this.isIntroComplete) {
                    // Only set to walking-to-start if we're still waiting (first play)
                    // On restart, introPhase is already set to 'zombies-entering'
                    if (this.introPhase === 'waiting') {
                        this.introPhase = 'walking-to-start';
                        this.introTimer = 0;
                    } else {
                        // Restart scenario - stop intro sounds and start normal music
                        this.stopAllIntroSounds();
                        this.introMusicPlaying = false;
                        
                        const audio = document.getElementById('backgroundMusic') as HTMLAudioElement;
                        if (audio) {
                            audio.currentTime = 0;
                            audio.play().catch(e => console.log('Audio play failed:', e));
                        }
                    }
                } else {
                    // Already completed intro - stop intro sounds and start normal music
                    this.stopAllIntroSounds();
                    this.introMusicPlaying = false;
                    
                    const audio = document.getElementById('backgroundMusic') as HTMLAudioElement;
                    if (audio) {
                        audio.currentTime = 0;
                        audio.play().catch(e => console.log('Audio play failed:', e));
                    }
                }
                
                return;
            }
            
            // Toggle pause with Esc key
            if (e.key === 'Escape') {
                const wasPaused = this.gameState === GameState.PAUSED;
                this.gameState = wasPaused ? GameState.PLAYING : GameState.PAUSED;
                const pauseToggle = document.getElementById('pauseToggle') as HTMLInputElement;
                if (pauseToggle) {
                    pauseToggle.checked = !wasPaused;
                }
                
                // Pause/resume music
                const audio = document.getElementById('backgroundMusic') as HTMLAudioElement;
                if (audio) {
                    if (!wasPaused) {
                        audio.pause();
                    } else {
                        audio.play().catch(e => console.log('Audio play failed:', e));
                    }
                }
                
                // Intro sounds play automatically, no need to pause/resume
            }
            
            // Restart with R key
            if ((e.key === 'r' || e.key === 'R') && this.isGameOver) {
                // Reset all game state
                this.gameState = GameState.SHOWING_CONTROLS;
                this.isGameOver = false;
                this.isIntroComplete = false; // Play intro on restart
                this.introPhase = 'waiting'; // Random walking like intro
                this.introTimer = 0;
                this.roadScrollSpeed = 0;
                this.gameOverTimer = 0;
                
                // Reset player position
                this.playerX = 60;
                this.playerY = 80;
                
                // Reset lives and counters
                this.lives = 3;
                this.candyCount = 0;
                this.updateLivesDisplay();
                this.updateCandyCounter();
                
                // Clear blood splatters
                this.bloodSplatters = [];
                
                // Reset timers
                this.invincibilityTimer = 0;
                this.enemySpawnTimer = 0;
                this.pumpkinSpawnTimer = 0;
                this.candySpawnTimer = 0;
                this.backgroundScrollY = 0;
                this.zombieNoiseTimer = 0;
                this.introMusicPlaying = false;
                this.gameplayMusicStarted = false;
                this.titleFading = false;
                this.titleFadeTimer = 0;
                
                // Clear candy and bones
                this.candy = null;
                this.bones = [];
                
                // Reset enemies - clear and reinitialize
                this.enemies = [];
                if (this.enemyPixels.length > 0) {
                    this.initializeZombieHorde();
                }
                
                // Reset pumpkins
                this.initializePumpkins();
                
                // Reset bushes
                this.initializeBushes();
                
                // Reset player state
                this.waddleOffsetX = 0;
                this.waddleOffsetY = 0;
                this.waddleTimer = 0;
                this.rotation = 0;
                this.jumpOffset = 0;
                this.isJumping = false;
                this.jumpTimer = 0;
                this.spacePressed = false;
                
                // Reset breathing audio
                if (this.breathingAudio) {
                    this.breathingAudio.pause();
                    this.breathingAudio.currentTime = 0;
                    this.breathingAudio.volume = 0;
                    this.isBreathing = false;
                }
                
                // Stop background music
                const audio = document.getElementById('backgroundMusic') as HTMLAudioElement;
                if (audio) {
                    audio.pause();
                }
                
                // Restart intro sounds for controls screen
                this.playAllIntroSounds();
                this.introMusicPlaying = true;
                
                // Stop static sound
                this.stopStaticAudio();
            }
        });
        
        // Restart button
        const restartButton = document.getElementById('restartButton');
        if (restartButton) {
            restartButton.addEventListener('click', () => {
                if (this.isGameOver) {
                    // Same logic as R key restart - reset all game state
                    this.gameState = GameState.SHOWING_CONTROLS;
                    this.isGameOver = false;
                    this.isIntroComplete = false; // Play intro on restart
                    this.introPhase = 'waiting'; // Random walking like intro
                    this.introTimer = 0;
                    this.roadScrollSpeed = 0;
                    this.gameOverTimer = 0;
                    
                    this.playerX = 60;
                    this.playerY = 80;
                    
                    this.lives = 3;
                    this.candyCount = 0;
                    this.updateLivesDisplay();
                    this.updateCandyCounter();
                    
                    this.bloodSplatters = [];
                    
                    this.invincibilityTimer = 0;
                    this.enemySpawnTimer = 0;
                    this.pumpkinSpawnTimer = 0;
                    this.candySpawnTimer = 0;
                    this.backgroundScrollY = 0;
                    this.zombieNoiseTimer = 0;
                    this.introMusicPlaying = false;
                    this.gameplayMusicStarted = false;
                    this.titleFading = false;
                    this.titleFadeTimer = 0;
                    
                    this.candy = null;
                    this.bones = [];
                    
                    this.enemies = [];
                    if (this.enemyPixels.length > 0) {
                        this.initializeZombieHorde();
                    }
                    
                    this.initializePumpkins();
                    
                    this.initializeBushes();
                    
                    this.waddleOffsetX = 0;
                    this.waddleOffsetY = 0;
                    this.waddleTimer = 0;
                    this.rotation = 0;
                    this.jumpOffset = 0;
                    this.isJumping = false;
                    this.jumpTimer = 0;
                    this.spacePressed = false;
                    
                    if (this.breathingAudio) {
                        this.breathingAudio.pause();
                        this.breathingAudio.currentTime = 0;
                        this.breathingAudio.volume = 0;
                        this.isBreathing = false;
                    }
                    
                    // Stop background music
                    const audio = document.getElementById('backgroundMusic') as HTMLAudioElement;
                    if (audio) {
                        audio.pause();
                    }
                    
                    // Restart intro sounds for controls screen
                    this.playAllIntroSounds();
                    this.introMusicPlaying = true;
                    
                    this.stopStaticAudio();
                }
            });
        }
    }
    
    private loadGhostSprite(): void {
        this.ghostImage = new Image();
        this.ghostImage.src = spaceManSprite;
        this.ghostImage.onload = () => {
            console.log('Player sprite loaded successfully');
            this.convertSpriteToPixels();
            this.assetLoaded();
        };
        this.ghostImage.onerror = () => {
            console.error('Failed to load player sprite');
            this.assetLoaded();
        };
    }
    
    private convertSpriteToPixels(): void {
        if (!this.ghostImage) return;
        
        // Create a temporary canvas to read pixel data
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCanvas.width = 8;
        tempCanvas.height = 8;
        
        // Draw the sprite to the temp canvas
        tempCtx.drawImage(this.ghostImage, 0, 0, 8, 8);
        
        // Read pixel data
        const imageData = tempCtx.getImageData(0, 0, 8, 8);
        const data = imageData.data;
        
        this.ghostPixels = [];
        
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const index = (y * 8 + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];
                
                // Only add non-transparent pixels
                if (a > 0) {
                    this.ghostPixels.push({
                        x: x,
                        y: y,
                        color: `rgb(${r}, ${g}, ${b})`
                    });
                }
            }
        }
        
        console.log(`Converted sprite to ${this.ghostPixels.length} pixels`);
    }
    
    private loadPumpkinSprite(): void {
        this.pumpkinImage = new Image();
        this.pumpkinImage.src = pumpkinSprite;
        this.pumpkinImage.onload = () => {
            console.log('Pumpkin sprite loaded successfully');
            this.convertPumpkinToPixels();
            this.assetLoaded();
        };
        this.pumpkinImage.onerror = () => {
            console.error('Failed to load pumpkin sprite');
            this.assetLoaded();
        };
    }
    
    private convertPumpkinToPixels(): void {
        if (!this.pumpkinImage) return;
        
        // Create a temporary canvas to read pixel data
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCanvas.width = 8;
        tempCanvas.height = 8;
        
        // Draw the sprite to the temp canvas
        tempCtx.drawImage(this.pumpkinImage, 0, 0, 8, 8);
        
        // Read pixel data
        const imageData = tempCtx.getImageData(0, 0, 8, 8);
        const data = imageData.data;
        
        this.pumpkinPixels = [];
        
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const index = (y * 8 + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];
                
                // Only add non-transparent pixels
                if (a > 0) {
                    this.pumpkinPixels.push({
                        x: x,
                        y: y,
                        color: `rgb(${r}, ${g}, ${b})`
                    });
                }
            }
        }
        
        console.log(`Converted pumpkin to ${this.pumpkinPixels.length} pixels`);
    }
    
    private loadSmashedPumpkinSprite(): void {
        this.smashedPumpkinImage = new Image();
        this.smashedPumpkinImage.src = smashedPumpkinSprite;
        this.smashedPumpkinImage.onload = () => {
            console.log('Smashed pumpkin sprite loaded successfully');
            this.convertSmashedPumpkinToPixels();
            this.assetLoaded();
        };
        this.smashedPumpkinImage.onerror = () => {
            console.error('Failed to load smashed pumpkin sprite');
            this.assetLoaded();
        };
    }
    
    private convertSmashedPumpkinToPixels(): void {
        if (!this.smashedPumpkinImage) return;
        
        // Create a temporary canvas to read pixel data
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCanvas.width = 8;
        tempCanvas.height = 8;
        
        // Draw the sprite to the temp canvas
        tempCtx.drawImage(this.smashedPumpkinImage, 0, 0, 8, 8);
        
        // Read pixel data
        const imageData = tempCtx.getImageData(0, 0, 8, 8);
        const data = imageData.data;
        
        this.smashedPumpkinPixels = [];
        
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const index = (y * 8 + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];
                
                // Only add non-transparent pixels
                if (a > 0) {
                    this.smashedPumpkinPixels.push({
                        x: x,
                        y: y,
                        color: `rgb(${r}, ${g}, ${b})`
                    });
                }
            }
        }
        
        console.log(`Converted smashed pumpkin to ${this.smashedPumpkinPixels.length} pixels`);
    }
    
    private loadEnemySprite(): void {
        this.enemyImage = new Image();
        this.enemyImage.src = zombieSprite;
        this.enemyImage.onload = () => {
            console.log('Enemy sprite loaded successfully');
            this.convertEnemyToPixels();
            this.initializeZombieHorde();
            this.assetLoaded();
        };
        this.enemyImage.onerror = () => {
            console.error('Failed to load enemy sprite');
            this.assetLoaded();
        };
    }
    
    private loadSkeletonSprite(): void {
        this.skeletonImage = new Image();
        this.skeletonImage.src = skeletonSprite;
        this.skeletonImage.onload = () => {
            console.log('Skeleton sprite loaded successfully');
            this.convertSkeletonToPixels();
            this.assetLoaded();
        };
        this.skeletonImage.onerror = () => {
            console.error('Failed to load skeleton sprite');
            this.assetLoaded();
        };
    }
    
    private convertEnemyToPixels(): void {
        if (!this.enemyImage) return;
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCanvas.width = 8;
        tempCanvas.height = 8;
        
        tempCtx.drawImage(this.enemyImage, 0, 0, 8, 8);
        
        const imageData = tempCtx.getImageData(0, 0, 8, 8);
        const data = imageData.data;
        
        this.enemyPixels = [];
        
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const index = (y * 8 + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];
                
                if (a > 0) {
                    this.enemyPixels.push({
                        x: x,
                        y: y,
                        color: `rgb(${r}, ${g}, ${b})`
                    });
                }
            }
        }
        
        console.log(`Converted enemy sprite to ${this.enemyPixels.length} pixels`);
    }
    
    private convertSkeletonToPixels(): void {
        if (!this.skeletonImage) return;
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCanvas.width = 8;
        tempCanvas.height = 8;
        
        tempCtx.drawImage(this.skeletonImage, 0, 0, 8, 8);
        
        const imageData = tempCtx.getImageData(0, 0, 8, 8);
        const data = imageData.data;
        
        this.skeletonPixels = [];
        
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const index = (y * 8 + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];
                
                if (a > 0) {
                    this.skeletonPixels.push({
                        x: x,
                        y: y,
                        color: `rgb(${r}, ${g}, ${b})`
                    });
                }
            }
        }
        
        console.log(`Converted skeleton sprite to ${this.skeletonPixels.length} pixels`);
    }
    
    private loadBoneSprite(): void {
        this.boneImage = new Image();
        this.boneImage.src = boneSprite;
        this.boneImage.onload = () => {
            console.log('Bone sprite loaded successfully');
            this.convertBoneToPixels();
            this.assetLoaded();
        };
        this.boneImage.onerror = () => {
            console.error('Failed to load bone sprite');
            this.assetLoaded();
        };
    }
    
    private convertBoneToPixels(): void {
        if (!this.boneImage) return;
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCanvas.width = 8;
        tempCanvas.height = 8;
        
        tempCtx.drawImage(this.boneImage, 0, 0, 8, 8);
        
        const imageData = tempCtx.getImageData(0, 0, 8, 8);
        const data = imageData.data;
        
        this.bonePixels = [];
        
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const index = (y * 8 + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];
                
                if (a > 0) {
                    this.bonePixels.push({
                        x: x,
                        y: y,
                        color: `rgb(${r}, ${g}, ${b})`
                    });
                }
            }
        }
        
        console.log(`Converted bone sprite to ${this.bonePixels.length} pixels`);
    }
    
    private loadStreetBackground(): void {
        this.streetImage = new Image();
        this.streetImage.src = streetImage;
        this.streetImage.onload = () => {
            console.log('Street background loaded successfully');
            this.convertStreetToPixels();
            this.assetLoaded();
        };
        this.streetImage.onerror = () => {
            console.error('Failed to load street background');
            this.assetLoaded();
        };
    }
    
    private convertStreetToPixels(): void {
        if (!this.streetImage) return;
        
        // Create a temporary canvas to read pixel data
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCanvas.width = PICO8.SCREEN_WIDTH;
        tempCanvas.height = PICO8.SCREEN_HEIGHT;
        
        // Draw the street to the temp canvas
        tempCtx.drawImage(this.streetImage, 0, 0, PICO8.SCREEN_WIDTH, PICO8.SCREEN_HEIGHT);
        
        // Read pixel data
        const imageData = tempCtx.getImageData(0, 0, PICO8.SCREEN_WIDTH, PICO8.SCREEN_HEIGHT);
        const data = imageData.data;
        
        this.streetPixels = [];
        
        for (let y = 0; y < PICO8.SCREEN_HEIGHT; y++) {
            for (let x = 0; x < PICO8.SCREEN_WIDTH; x++) {
                const index = (y * PICO8.SCREEN_WIDTH + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];
                
                // Only add non-transparent pixels
                if (a > 0) {
                    this.streetPixels.push({
                        x: x,
                        y: y,
                        color: `rgb(${r}, ${g}, ${b})`
                    });
                }
            }
        }
        
        console.log(`Converted street to ${this.streetPixels.length} pixels`);
    }
    
    private loadCandySprite(): void {
        this.candyImage = new Image();
        this.candyImage.src = candyCornSprite;
        this.candyImage.onload = () => {
            console.log('Candy sprite loaded successfully');
            this.convertCandyToPixels();
            this.assetLoaded();
        };
        this.candyImage.onerror = () => {
            console.error('Failed to load candy sprite');
            this.assetLoaded();
        };
    }
    
    private convertCandyToPixels(): void {
        if (!this.candyImage) return;
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCanvas.width = 8;
        tempCanvas.height = 8;
        
        tempCtx.drawImage(this.candyImage, 0, 0, 8, 8);
        
        const imageData = tempCtx.getImageData(0, 0, 8, 8);
        const data = imageData.data;
        
        this.candyPixels = [];
        
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const index = (y * 8 + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];
                
                if (a > 0) {
                    this.candyPixels.push({
                        x: x,
                        y: y,
                        color: `rgb(${r}, ${g}, ${b})`
                    });
                }
            }
        }
        
        console.log(`Converted candy sprite to ${this.candyPixels.length} pixels`);
    }
    
    private loadHeartSprite(): void {
        this.heartImage = new Image();
        this.heartImage.src = heartSprite;
        this.heartImage.onload = () => {
            console.log('Heart sprite loaded successfully');
            this.convertHeartToPixels();
            this.assetLoaded();
        };
        this.heartImage.onerror = () => {
            console.error('Failed to load heart sprite');
            this.assetLoaded();
        };
    }
    
    private convertHeartToPixels(): void {
        if (!this.heartImage) return;
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCanvas.width = 8;
        tempCanvas.height = 8;
        
        tempCtx.drawImage(this.heartImage, 0, 0, 8, 8);
        
        const imageData = tempCtx.getImageData(0, 0, 8, 8);
        const data = imageData.data;
        
        this.heartPixels = [];
        
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const index = (y * 8 + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];
                
                if (a > 0) { // Only include non-transparent pixels
                    this.heartPixels.push({
                        x: x,
                        y: y,
                        color: `rgb(${r}, ${g}, ${b})`
                    });
                }
            }
        }
        
        console.log(`Converted heart sprite to ${this.heartPixels.length} pixels`);
    }
    
    private loadBushSprite(): void {
        this.bushImage = new Image();
        this.bushImage.src = bushSprite;
        this.bushImage.onload = () => {
            console.log('Bush sprite loaded successfully');
            this.convertBushToPixels();
            this.assetLoaded();
        };
        this.bushImage.onerror = () => {
            console.error('Failed to load bush sprite');
            this.assetLoaded();
        };
    }
    
    private convertBushToPixels(): void {
        if (!this.bushImage) return;
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCanvas.width = 8;
        tempCanvas.height = 8;
        
        tempCtx.drawImage(this.bushImage, 0, 0, 8, 8);
        
        const imageData = tempCtx.getImageData(0, 0, 8, 8);
        const data = imageData.data;
        
        this.bushPixels = [];
        
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const index = (y * 8 + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];
                
                if (a > 0) {
                    this.bushPixels.push({
                        x: x,
                        y: y,
                        color: `rgb(${r}, ${g}, ${b})`
                    });
                }
            }
        }
        
        console.log(`Converted bush sprite to ${this.bushPixels.length} pixels`);
    }
    
    private loadBloodImage(): void {
        this.bloodTopLeftImage = new Image();
        this.bloodTopLeftImage.src = bloodTopLeftImage;
        this.bloodTopLeftImage.onload = () => {
            console.log('Blood top-left image loaded successfully');
            this.assetLoaded();
        };
        this.bloodTopLeftImage.onerror = () => {
            console.error('Failed to load blood top-left image');
            this.assetLoaded();
        };
        
        this.bloodTopRightImage = new Image();
        this.bloodTopRightImage.src = bloodTopRightImage;
        this.bloodTopRightImage.onload = () => {
            console.log('Blood top-right image loaded successfully');
            this.assetLoaded();
        };
        this.bloodTopRightImage.onerror = () => {
            console.error('Failed to load blood top-right image');
            this.assetLoaded();
        };
        
        this.bloodBottomLeftImage = new Image();
        this.bloodBottomLeftImage.src = bloodBottomLeftImage;
        this.bloodBottomLeftImage.onload = () => {
            console.log('Blood bottom-left image loaded successfully');
            this.assetLoaded();
        };
        this.bloodBottomLeftImage.onerror = () => {
            console.error('Failed to load blood bottom-left image');
            this.assetLoaded();
        };
        
        this.bloodBottomRightImage = new Image();
        this.bloodBottomRightImage.src = bloodBottomRightImage;
        this.bloodBottomRightImage.onload = () => {
            console.log('Blood bottom-right image loaded successfully');
            this.assetLoaded();
        };
        this.bloodBottomRightImage.onerror = () => {
            console.error('Failed to load blood bottom-right image');
            this.assetLoaded();
        };
    }
    
    private loadControlsImage(): void {
        this.controlsImg = new Image();
        this.controlsImg.src = controlsImage;
        this.controlsImg.onload = () => {
            console.log('Controls image loaded successfully');
            this.assetLoaded();
        };
        this.controlsImg.onerror = () => {
            console.error('Failed to load controls image');
            this.assetLoaded();
        };
    }
    
    private loadTitleImage(): void {
        this.titleImg = new Image();
        this.titleImg.src = titleImage;
        this.titleImg.onload = () => {
            console.log('Title image loaded successfully');
            this.assetLoaded();
        };
        this.titleImg.onerror = () => {
            console.error('Failed to load title image');
            this.assetLoaded();
        };
    }
    
    private initializePumpkins(): void {
        // Start with no pumpkins - they'll spawn during gameplay
        this.pumpkins = [];
    }
    
    private isBushPositionValid(x: number, y: number): boolean {
        // Check if any existing bush is within 20 pixels
        for (const bush of this.bushes) {
            const dx = bush.x - x;
            const dy = bush.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 20) {
                return false;
            }
        }
        return true;
    }
    
    private initializeBushes(): void {
        // Start with some bushes already on screen at fixed positions
        this.bushes = [];
        
        // Fixed positions for initial bushes (alternating left/right)
        const fixedBushes = [
            { x: 12, y: 20 },   // Left side
            { x: 116, y: 45 },  // Right side
            { x: 8, y: 70 },    // Left side
            { x: 112, y: 95 },  // Right side
            { x: 15, y: 115 }   // Left side
        ];
        
        for (const pos of fixedBushes) {
            this.bushes.push({ x: pos.x, y: pos.y });
        }
    }
    
    private initializeZombieHorde(): void {
        // Create 60 zombies densely packed above screen (will waddle in during intro)
        const zombieCount = 60;
        
        for (let i = 0; i < zombieCount; i++) {
            const x = Math.random() * (PICO8.SCREEN_WIDTH - 8);
            const y = -30 + Math.random() * 15; // Start above screen (-30 to -15)
            
            this.spawnEnemy(x, y);
        }
        
        console.log(`Spawned ${zombieCount} zombies above screen`);
    }
    
    private spawnEnemy(x: number, y: number, isAttacking: boolean = false): void {
        // For attacking zombies, face toward player; for horde, randomize
        let facingLeft: boolean;
        if (isAttacking) {
            facingLeft = x > this.playerX; // Face left if spawned right of player
        } else {
            facingLeft = Math.random() > 0.5; // Random facing for horde
        }
        
        // Horde enemies are always ghosts, attacking enemies are random mix (but only after 5 candies)
        const enemyType = isAttacking ? 
            (this.candyCount >= 5 ? (Math.random() > 0.5 ? 'ghost' : 'skeleton') : 'ghost') : 
            'ghost';
        const sprite = enemyType === 'ghost' ? this.enemyPixels : this.skeletonPixels;
        
        this.enemies.push({
            x: x,
            y: y,
            sprite: sprite,
            waddleTimer: Math.random() * Math.PI * 2, // Random start phase
            waddleOffsetX: 0,
            waddleOffsetY: 0,
            rotation: 0,
            facingLeft: facingLeft,
            isAttacking: isAttacking,
            type: enemyType,
            boneShootTimer: enemyType === 'skeleton' ? Math.random() * 180 : undefined, // Random initial delay for skeletons
            hasShot: false // Initialize as not shot
        });
    }
    
    private spawnAttackingEnemy(): void {
        // Spawn from bottom of screen
        const x = Math.random() * PICO8.SCREEN_WIDTH;
        const y = PICO8.SCREEN_HEIGHT + 8;
        
        this.spawnEnemy(x, y, true);
    }
    
    private shootBone(fromX: number, fromY: number, targetX: number, targetY: number): void {
        // Calculate direction to target
        const dx = targetX - fromX;
        const dy = targetY - fromY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize direction and set consistent speed
        const speed = 0.75; // Bone speed (consistent)
        const vx = (dx / distance) * speed;
        const vy = (dy / distance) * speed;
        
        // Add some randomness to make it less predictable
        const randomAngle = (Math.random() - 0.5) * 0.3; // ±0.15 radians
        const cos = Math.cos(randomAngle);
        const sin = Math.sin(randomAngle);
        const finalVx = vx * cos - vy * sin;
        const finalVy = vx * sin + vy * cos;
        
        this.bones.push({
            x: fromX,
            y: fromY,
            vx: finalVx,
            vy: finalVy,
            rotation: Math.atan2(finalVy, finalVx)
        });
    }
    
    private setupAudio(): void {
        const audio = document.getElementById('backgroundMusic') as HTMLAudioElement;
        if (audio && !audio.dataset.setup) {
            console.log('Setting up audio with file:', musicFile);
            audio.dataset.setup = 'true'; // Mark as set up
            audio.src = musicFile;
            audio.volume = 1;
            audio.loop = true;
            audio.preload = 'auto';
            console.log('Audio ready but not playing (waiting for controls dismiss)');
        }
    }
    
    private setupBreathingAudio(): void {
        this.breathingAudio = new Audio(breathingSound);
        this.breathingAudio.loop = true;
        this.breathingAudio.volume = 0;
        this.breathingAudio.preload = 'auto';
    }
    
    private setupZombieNoises(): void {
        const zombieSounds = [zombieNoise1, zombieNoise2, zombieNoise3, fastZombie1];
        for (const sound of zombieSounds) {
            const audio = new Audio(sound);
            audio.volume = 0.3;
            audio.preload = 'auto';
            this.zombieNoises.push(audio);
        }
    }
    
    private playRandomZombieNoise(): void {
        if (this.zombieNoises.length === 0) return;
        const randomIndex = Math.floor(Math.random() * this.zombieNoises.length);
        const audio = this.zombieNoises[randomIndex].cloneNode() as HTMLAudioElement;
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Zombie noise play failed:', e));
    }
    
    private setupHitSounds(): void {
        const screamSounds = [femaleScream1, femaleScream2, femaleScream3, femaleScream4];
        for (const sound of screamSounds) {
            const audio = new Audio(sound);
            audio.volume = 0.7;
            audio.preload = 'auto';
            this.hitSounds.push(audio);
        }
        
        this.hitAudio = new Audio(hitSound);
        this.hitAudio.volume = 0.6;
        this.hitAudio.preload = 'auto';
    }
    
    private playHitSounds(): void {
        // Play meat impact sound
        if (this.hitAudio) {
            const hitClone = this.hitAudio.cloneNode() as HTMLAudioElement;
            hitClone.volume = 0.6;
            hitClone.play().catch(e => console.log('Hit sound play failed:', e));
        }
        
        // Play random female scream
        if (this.hitSounds.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.hitSounds.length);
            const screamClone = this.hitSounds[randomIndex].cloneNode() as HTMLAudioElement;
            screamClone.volume = 0.7;
            screamClone.play().catch(e => console.log('Scream sound play failed:', e));
        }
    }
    
    private setupJumpCoinSound(): void {
        this.jumpCoinAudio = new Audio(jumpCoinSound);
        this.jumpCoinAudio.volume = 0.5;
        this.jumpCoinAudio.preload = 'auto';
    }
    
    private setupCandyCoinSound(): void {
        this.candyCoinAudio = new Audio(candyCoinSound);
        this.candyCoinAudio.volume = 0.6;
        this.candyCoinAudio.preload = 'auto';
    }
    
    private setupHeartPowerUpSound(): void {
        this.heartPowerUpAudio = new Audio(heartPowerUpSound);
        this.heartPowerUpAudio.volume = 0.7;
        this.heartPowerUpAudio.preload = 'auto';
    }
    
    private setupPumpkinHitSound(): void {
        this.pumpkinHitAudio = new Audio(pumpkinHitSound);
        this.pumpkinHitAudio.volume = 0.8;
        this.pumpkinHitAudio.preload = 'auto';
    }
    
    private setupIntroSounds(): void {
        const sounds = [parkAmbienceBirds, parkAmbienceWind, treeCreak];
        for (const sound of sounds) {
            const audio = new Audio(sound);
            audio.volume = 0.4;
            audio.loop = true;
            audio.preload = 'auto';
            
            // Add load event listeners to track when sounds are ready
            audio.addEventListener('canplaythrough', () => {
                console.log('Intro sound loaded successfully');
                this.assetLoaded();
            });
            
            audio.addEventListener('error', () => {
                console.error('Failed to load intro sound');
                this.assetLoaded();
            });
            
            this.introSounds.push(audio);
        }
    }
    
    private setupClickListener(): void {
        document.addEventListener('click', () => {
            console.log('Left click detected - audio permissions may now be active');
            console.log('Trying to start intro sounds on click...');
            this.startIntroSounds();
        });
    }
    
    private playAllIntroSounds(): void {
        // Only play intro sounds after user interaction (space key press)
        // This avoids autoplay policy issues
        console.log('Intro sounds ready, waiting for user interaction');
    }
    
    private startIntroSounds(): void {
        // Start intro sounds after user interaction
        console.log('Starting intro sounds after user interaction');
        console.log('Number of intro sounds:', this.introSounds.length);
        
        // Try to play intro sounds, but handle iframe restrictions gracefully
        for (let i = 0; i < this.introSounds.length; i++) {
            const audio = this.introSounds[i];
            console.log(`Attempting to play intro sound ${i}:`, {
                paused: audio.paused,
                readyState: audio.readyState,
                src: audio.src
            });
            
            audio.play().then(() => {
                console.log(`Intro sound ${i} started successfully`);
            }).catch(e => {
                console.log(`Intro sound ${i} play failed:`, e.name, e.message);
            });
        }
    }
    
    
    private stopAllIntroSounds(): void {
        if (!this.introMusicPlaying) return;
        for (const audio of this.introSounds) {
            audio.pause();
            audio.currentTime = 0;
        }
    }
    
    private setupGlitterBlast(): void {
        this.glitterBlastAudio = new Audio(glitterBlast);
        this.glitterBlastAudio.volume = this.musicFadeStartVolume;
        this.glitterBlastAudio.loop = true;
        this.glitterBlastAudio.preload = 'auto';
    }
    
    private setupStaticAudio(): void {
        this.audioContext = new AudioContext();
        this.staticGainNode = this.audioContext.createGain();
        this.staticGainNode.connect(this.audioContext.destination);
        this.staticGainNode.gain.value = 0.8;
        
        fetch(staticSound)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => this.audioContext!.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                this.staticAudioBuffer = this.trimSilence(audioBuffer);
                console.log('Static audio loaded and trimmed for gapless loop');
            })
            .catch(e => console.error('Failed to load static audio:', e));
    }
    
    private trimSilence(buffer: AudioBuffer): AudioBuffer {
        const threshold = 0.001;
        const channels = buffer.numberOfChannels;
        const data = buffer.getChannelData(0);
        
        let start = 0;
        let end = buffer.length;
        
        // Find first zero crossing after silence
        for (let i = 0; i < buffer.length - 1; i++) {
            if (Math.abs(data[i]) > threshold) {
                // Found sound, now find nearest zero crossing
                for (let j = i; j < Math.min(i + 100, buffer.length - 1); j++) {
                    if ((data[j] >= 0 && data[j + 1] < 0) || (data[j] < 0 && data[j + 1] >= 0)) {
                        start = j;
                        break;
                    }
                }
                break;
            }
        }
        
        // Find last zero crossing before silence
        for (let i = buffer.length - 1; i >= 1; i--) {
            if (Math.abs(data[i]) > threshold) {
                // Found sound, now find nearest zero crossing
                for (let j = i; j > Math.max(i - 100, 0); j--) {
                    if ((data[j] >= 0 && data[j - 1] < 0) || (data[j] < 0 && data[j - 1] >= 0)) {
                        end = j;
                        break;
                    }
                }
                break;
            }
        }
        
        const length = end - start;
        const trimmed = this.audioContext!.createBuffer(channels, length, buffer.sampleRate);
        
        for (let ch = 0; ch < channels; ch++) {
            trimmed.copyToChannel(buffer.getChannelData(ch).slice(start, end), ch);
        }
        
        console.log(`Trimmed to zero crossings: start=${start}, end=${end}, duration=${trimmed.duration.toFixed(3)}s`);
        return trimmed;
    }
    
    private playStaticAudio(): void {
        if (!this.audioContext || !this.staticAudioBuffer || !this.staticGainNode) return;
        
        this.stopStaticAudio();
        
        this.staticSourceNode = this.audioContext.createBufferSource();
        this.staticSourceNode.buffer = this.staticAudioBuffer;
        this.staticSourceNode.loop = true;
        this.staticSourceNode.connect(this.staticGainNode);
        this.staticSourceNode.start(0);
    }
    
    private stopStaticAudio(): void {
        if (this.staticSourceNode) {
            try {
                this.staticSourceNode.stop();
                this.staticSourceNode.disconnect();
            } catch (e) {
                // Ignore if already stopped
            }
            this.staticSourceNode = null;
        }
    }
    
    private setupInput(): void {
        const keys: { [key: string]: boolean } = {};
        
        document.addEventListener('keydown', (e) => {
            keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            keys[e.code] = false;
        });
        
        // Store keys reference for game loop
        (this as any).keys = keys;
    }
    
    private start(): void {
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
        // Frame-rate independent timing: normalize to 60 FPS
        const targetFrameTime = 1000 / 60; // 16.67ms per frame at 60fps
        const deltaMultiplier = deltaTime / targetFrameTime;
        
        // Update title fade
        if (this.titleFading && this.titleFadeTimer < 60) {
            this.titleFadeTimer += deltaMultiplier;
        }
        
        // Random walking on controls screen
        if (this.gameState === GameState.SHOWING_CONTROLS && this.introPhase === 'waiting') {
            this.randomWalkTimer += deltaMultiplier;
            
            // Choose new direction periodically
            if (this.randomWalkTimer >= this.randomWalkDuration) {
                const directions = ['up', 'down', 'left', 'right'];
                this.randomWalkDirection = directions[Math.floor(Math.random() * directions.length)];
                this.randomWalkDuration = 30 + Math.random() * 90; // 0.5-2 seconds
                this.randomWalkTimer = 0;
            }
            
            // Move in current direction (constrained to center area)
            const walkSpeed = 0.25 * deltaMultiplier;
            const spriteWidth = 6;
            const spriteHeight = 6;
            
            // Define center area bounds (30% to 70% of screen)
            const centerMarginX = PICO8.SCREEN_WIDTH * 0.3;
            const centerMarginY = PICO8.SCREEN_HEIGHT * 0.3;
            const minX = centerMarginX;
            const maxX = PICO8.SCREEN_WIDTH - centerMarginX - spriteWidth;
            const minY = centerMarginY;
            const maxY = PICO8.SCREEN_HEIGHT - centerMarginY - spriteHeight;
            
            switch (this.randomWalkDirection) {
                case 'up':
                    this.playerY = PICO8Utils.clamp(this.playerY - walkSpeed, minY, maxY);
                    this.waddleTimer += 0.5 * deltaMultiplier;
                    this.waddleOffsetX = Math.sin(this.waddleTimer * 0.5) * 1.0;
                    this.waddleOffsetY = 0;
                    this.rotation = Math.sin(this.waddleTimer * 0.8) * 0.05;
                    break;
                case 'down':
                    this.playerY = PICO8Utils.clamp(this.playerY + walkSpeed, minY, maxY);
                    this.waddleTimer += 0.5 * deltaMultiplier;
                    this.waddleOffsetX = Math.sin(this.waddleTimer * 0.5) * 1.0;
                    this.waddleOffsetY = 0;
                    this.rotation = Math.sin(this.waddleTimer * 0.8) * 0.05;
                    break;
                case 'left':
                    this.playerX = PICO8Utils.clamp(this.playerX - walkSpeed, minX, maxX);
                    this.lastDirection = 'left';
                    this.waddleTimer += 0.5 * deltaMultiplier;
                    this.waddleOffsetX = 0;
                    this.waddleOffsetY = Math.cos(this.waddleTimer * 0.7) * 0.5;
                    this.rotation = Math.sin(this.waddleTimer * 1.2) * 0.1;
                    break;
                case 'right':
                    this.playerX = PICO8Utils.clamp(this.playerX + walkSpeed, minX, maxX);
                    this.lastDirection = 'right';
                    this.waddleTimer += 0.5 * deltaMultiplier;
                    this.waddleOffsetX = 0;
                    this.waddleOffsetY = Math.cos(this.waddleTimer * 0.7) * 0.5;
                    this.rotation = Math.sin(this.waddleTimer * 1.2) * -0.1;
                    break;
            }
            
            return; // Don't process game logic during controls screen
        }
        
        if (this.isGameOver || this.gameState !== GameState.PLAYING) return; // Don't update if game is over or not playing
        
        // Update invincibility timer
        if (this.invincibilityTimer > 0) {
            this.invincibilityTimer -= deltaMultiplier;
        }
        
        
        
        // Play zombie noises every 0.5 seconds (30 frames at 60fps)
        this.zombieNoiseTimer += deltaMultiplier;
        if (this.zombieNoiseTimer >= 30) {
            this.playRandomZombieNoise();
            this.zombieNoiseTimer = 0;
        }
        
        // Handle intro sequence
        if (!this.isIntroComplete) {
            this.introTimer += deltaMultiplier;
            
            if (this.introPhase === 'walking-to-start') {
                // Walk to starting position
                const walkSpeed = 0.35 * deltaMultiplier;
                const dx = this.targetStartX - this.playerX;
                const dy = this.targetStartY - this.playerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 1) {
                    // Move toward target
                    this.playerX += (dx / distance) * walkSpeed;
                    this.playerY += (dy / distance) * walkSpeed;
                    
                    // Waddle while walking
                    this.waddleTimer += 0.5 * deltaMultiplier;
                    this.waddleOffsetX = 0;
                    this.waddleOffsetY = Math.cos(this.waddleTimer * 0.7) * 0.5;
                    
                    // Set direction for sprite flip
                    if (Math.abs(dx) > Math.abs(dy)) {
                        this.lastDirection = dx < 0 ? 'left' : 'right';
                        this.rotation = Math.sin(this.waddleTimer * 1.2) * (dx < 0 ? 0.1 : -0.1);
                    } else {
                        this.rotation = Math.sin(this.waddleTimer * 0.8) * 0.05;
                    }
                } else {
                    // Reached starting position, zombies enter next
                    this.playerX = this.targetStartX;
                    this.playerY = this.targetStartY;
                    this.introPhase = 'zombies-entering';
                    this.introTimer = 0;
                    this.waddleOffsetX = 0;
                    this.waddleOffsetY = 0;
                    this.rotation = 0;
                }
            } else if (this.introPhase === 'zombies-entering') {
                // Move zombies down to their normal positions over ~1 second (60 frames)
                // Player stands still watching
                this.waddleOffsetX = 0;
                this.waddleOffsetY = 0;
                this.rotation = 0;
                
                const zombieEnterSpeed = 0.5 * deltaMultiplier;
                for (const enemy of this.enemies) {
                    if (!enemy.isAttacking && enemy.y < 15) {
                        enemy.y += zombieEnterSpeed;
                    }
                }
                
                // After 1 second, player jumps
                if (this.introTimer >= 60) {
                    this.introPhase = 'jump';
                    this.introTimer = 0;
                    this.isJumping = true;
                    this.jumpTimer = 0;
                    
                    // Play jump coin sound
                    if (this.jumpCoinAudio) {
                        const coinClone = this.jumpCoinAudio.cloneNode() as HTMLAudioElement;
                        coinClone.volume = 0.5;
                        coinClone.play().catch(e => console.log('Jump coin sound play failed:', e));
                    }
                }
            } else if (this.introPhase === 'jump') {
                // Wait for jump to complete (no waddle during jump)
                this.waddleOffsetX = 0;
                this.waddleOffsetY = 0;
                this.rotation = 0;
                
                // At peak of jump, play sounds
                const jumpDuration = 1.5;
                const t = this.jumpTimer / jumpDuration;
                
                if (t >= 0.48 && t <= 0.52 && this.introTimer < 5) {
                    // Play zombie sound and hit sounds (only once)
                    this.playRandomZombieNoise();
                    this.playHitSounds();
                }
                
                if (!this.isJumping) {
                    this.introPhase = 'road-starting';
                    this.introTimer = 0;
                }
            } else if (this.introPhase === 'road-starting') {
                // Start background music at the beginning of road scroll (once)
                if (!this.gameplayMusicStarted) {
                    // Stop intro sounds
                    this.stopAllIntroSounds();
                    this.introMusicPlaying = false;
                    
                    // Start SCP music
                    const audio = document.getElementById('backgroundMusic') as HTMLAudioElement;
                    if (audio) {
                        audio.currentTime = 0;
                        audio.play().catch(e => console.log('Audio play failed:', e));
                    }
                    this.gameplayMusicStarted = true;
                }
                
                // Ramp up road speed from 0 to 0.8 over ~1 second (60 frames)
                const targetSpeed = 0.8;
                const rampDuration = 60;
                this.roadScrollSpeed = Math.min(targetSpeed, (this.introTimer / rampDuration) * targetSpeed);
                
                // Make player waddle as road speeds up
                this.waddleTimer += 0.5 * deltaMultiplier;
                this.waddleOffsetX = Math.sin(this.waddleTimer * 0.5) * 1.0;
                this.waddleOffsetY = 0;
                this.rotation = Math.sin(this.waddleTimer * 0.8) * 0.05;
                
                if (this.introTimer >= rampDuration) {
                    this.introPhase = 'complete';
                    this.isIntroComplete = true;
                    this.roadScrollSpeed = targetSpeed;
                    // Reset waddle for clean start
                    this.waddleOffsetX = 0;
                    this.waddleOffsetY = 0;
                    this.rotation = 0;
                }
            }
        } else {
            // After intro, keep road at full speed
            this.roadScrollSpeed = 0.8;
        }
        
        const keys = (this as any).keys;
        const speed = 0.35 * deltaMultiplier; // Scale speed by deltaTime
        
        
        // Player movement (adjusted for ghost sprite size - 8x8 scaled to 75%)
        const spriteWidth = 6; // Ghost sprite width (8x8 * 0.75 = 6x6)
        const spriteHeight = 6; // Ghost sprite height (8x8 * 0.75 = 6x6)
        
        // Block player input during intro
        if (!this.isIntroComplete) {
            // Still update jump animation during intro
            if (this.isJumping) {
                this.jumpTimer += 0.08 * deltaMultiplier;
                const jumpHeight = 12;
                const jumpDuration = 1.5;
                const t = this.jumpTimer / jumpDuration;
                if (t <= 1) {
                    this.jumpOffset = 4 * t * (1 - t) * jumpHeight;
                } else {
                    this.jumpOffset = 0;
                }
                if (this.jumpTimer >= jumpDuration) {
                    this.isJumping = false;
                    this.jumpOffset = 0;
                }
            }
            
            // Continue to enemy updates, background scrolling, etc.
            // But skip player movement input
        }
        
        let isMoving = false;
        let currentDirection = '';
        
        // Only allow player movement after intro
        if (this.isIntroComplete) {
        
        if (keys['ArrowLeft'] || keys['KeyA']) {
            const newX = this.playerX - speed;
            if (!this.checkCollision(newX, this.playerY, spriteWidth, spriteHeight, this.isJumping)) {
                this.playerX = PICO8Utils.clamp(newX, 1, PICO8.SCREEN_WIDTH - spriteWidth - 1);
                isMoving = true;
                currentDirection = 'left';
                this.lastDirection = 'left'; // Update horizontal direction
            }
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
            const newX = this.playerX + speed;
            if (!this.checkCollision(newX, this.playerY, spriteWidth, spriteHeight, this.isJumping)) {
                this.playerX = PICO8Utils.clamp(newX, 1, PICO8.SCREEN_WIDTH - spriteWidth - 1);
                isMoving = true;
                currentDirection = 'right';
                this.lastDirection = 'right'; // Update horizontal direction
            }
        }
        if (keys['ArrowUp'] || keys['KeyW']) {
            const newY = this.playerY - speed;
            if (!this.checkCollision(this.playerX, newY, spriteWidth, spriteHeight, this.isJumping)) {
                this.playerY = PICO8Utils.clamp(newY, 1, PICO8.SCREEN_HEIGHT - spriteHeight - 1);
                isMoving = true;
                currentDirection = 'up';
                // Keep last horizontal direction for up movement
            }
        }
        if (keys['ArrowDown'] || keys['KeyS']) {
            const newY = this.playerY + speed;
            if (!this.checkCollision(this.playerX, newY, spriteWidth, spriteHeight, this.isJumping)) {
                this.playerY = PICO8Utils.clamp(newY, 1, PICO8.SCREEN_HEIGHT - spriteHeight - 1);
                isMoving = true;
                currentDirection = 'down';
                // Keep last horizontal direction for down movement
            }
            
            // Start breathing sound if not already playing (and not game over)
            if (!this.isBreathing && this.breathingAudio && !this.isGameOver) {
                this.isBreathing = true;
                this.breathingAudio.play().catch(e => console.log('Breathing audio play failed:', e));
            }
        }
        
        // Update breathing audio volume (only if not game over)
        if (this.breathingAudio && !this.isGameOver) {
            const fadeSpeed = 0.02 * deltaMultiplier;
            if (keys['ArrowDown'] || keys['KeyS']) {
                // Fade in
                if (this.breathingAudio.volume < 0.6) {
                    this.breathingAudio.volume = Math.min(0.6, this.breathingAudio.volume + fadeSpeed);
                }
            } else {
                // Fade out
                if (this.breathingAudio.volume > 0) {
                    this.breathingAudio.volume = Math.max(0, this.breathingAudio.volume - fadeSpeed);
                }
                // Stop playing when fully faded out
                if (this.breathingAudio.volume === 0 && this.isBreathing) {
                    this.isBreathing = false;
                    this.breathingAudio.pause();
                    this.breathingAudio.currentTime = 0;
                }
            }
        }
        
        // If not moving, player falls backward
        if (!isMoving) {
            const fallSpeed = this.roadScrollSpeed * deltaMultiplier; // Same as background scroll
            this.playerY = PICO8Utils.clamp(this.playerY - fallSpeed, 1, PICO8.SCREEN_HEIGHT - spriteHeight - 1);
        }
        
        // Update waddle animation based on direction
        if (isMoving) {
            this.waddleTimer += 0.5 * deltaMultiplier; // Speed of waddle
            
            if (currentDirection === 'left') {
                this.waddleOffsetX = 0; // No horizontal waddle when moving horizontally
                this.waddleOffsetY = Math.cos(this.waddleTimer * 0.7) * 0.5; // Only vertical waddle
                this.rotation = Math.sin(this.waddleTimer * 1.2) * 0.1; // Slight rotation
            } else if (currentDirection === 'right') {
                this.waddleOffsetX = 0; // No horizontal waddle when moving horizontally
                this.waddleOffsetY = Math.cos(this.waddleTimer * 0.7) * 0.5; // Only vertical waddle
                this.rotation = Math.sin(this.waddleTimer * 1.2) * -0.1; // Opposite rotation
            } else if (currentDirection === 'up') {
                // Use last horizontal direction for sprite orientation
                if (this.lastDirection === 'left') {
                    this.waddleOffsetX = Math.sin(this.waddleTimer * 0.5) * 1.0; // Only horizontal waddle
                    this.waddleOffsetY = 0; // No vertical waddle when moving vertically
                    this.rotation = Math.sin(this.waddleTimer * 0.8) * 0.05; // Less rotation
                } else {
                    this.waddleOffsetX = Math.sin(this.waddleTimer * 0.5 + Math.PI) * 1.0; // Opposite side waddle
                    this.waddleOffsetY = 0; // No vertical waddle when moving vertically
                    this.rotation = Math.sin(this.waddleTimer * 0.8) * -0.05; // Opposite rotation
                }
            } else if (currentDirection === 'down') {
                // Use last horizontal direction for sprite orientation
                if (this.lastDirection === 'left') {
                    this.waddleOffsetX = Math.sin(this.waddleTimer * 0.5) * 1.0; // Only horizontal waddle
                    this.waddleOffsetY = 0; // No vertical waddle when moving vertically
                    this.rotation = Math.sin(this.waddleTimer * 0.8) * 0.05; // Less rotation
                } else {
                    this.waddleOffsetX = Math.sin(this.waddleTimer * 0.5 + Math.PI) * 1.0; // Opposite side waddle
                    this.waddleOffsetY = 0; // No vertical waddle when moving vertically
                    this.rotation = Math.sin(this.waddleTimer * 0.8) * -0.05; // Opposite rotation
                }
            }
        } else {
            this.waddleOffsetX = 0; // Stop waddling when not moving
            this.waddleOffsetY = 0;
            this.rotation = 0;
        }
        
            // Jump with space (on press)
            if (keys['Space'] && !this.spacePressed && !this.isJumping) {
                // Trigger jump on space press
                this.isJumping = true;
                this.jumpTimer = 0;
                this.spacePressed = true;
            } else if (!keys['Space']) {
                this.spacePressed = false;
            }
            
            // Update jump animation (gravity-based) - only during normal play
            if (this.isJumping) {
                this.jumpTimer += 0.08 * deltaMultiplier; // Slower animation for longer jump
                
                // Gravity-based jump: starts fast up, slows at peak, accelerates down
                const jumpHeight = 12; // Higher jump
                const jumpDuration = 1.5; // Longer jump duration
                
                // Use a parabolic curve for realistic gravity
                const t = this.jumpTimer / jumpDuration;
                if (t <= 1) {
                    // Parabolic arc: 4 * t * (1 - t) gives a nice gravity curve
                    this.jumpOffset = 4 * t * (1 - t) * jumpHeight;
                } else {
                    // Land back down
                    this.jumpOffset = 0;
                }
                
                // End jump when animation completes
                if (this.jumpTimer >= jumpDuration) {
                    this.isJumping = false;
                    this.jumpOffset = 0;
                }
            }
        } // End of isIntroComplete check for player input
        
        // Update background scroll
        const scrollSpeed = this.roadScrollSpeed * deltaMultiplier;
        this.backgroundScrollY += scrollSpeed;
        if (this.backgroundScrollY >= PICO8.SCREEN_HEIGHT) {
            this.backgroundScrollY = 0;
        }
        
        // Move pumpkins backward with the road and remove if off screen
        for (let i = this.pumpkins.length - 1; i >= 0; i--) {
            this.pumpkins[i].y -= scrollSpeed;
            
            // Remove if gone off top
            if (this.pumpkins[i].y < -6) {
                this.pumpkins.splice(i, 1);
            }
        }
        
        // Spawn pumpkins periodically (less frequent than enemies)
        if (this.isIntroComplete) {
            this.pumpkinSpawnTimer += deltaMultiplier;
            if (this.pumpkinSpawnTimer >= 180) { // Every 3 seconds at 60fps
                const x = Math.random() * (PICO8.SCREEN_WIDTH - 6);
                const y = PICO8.SCREEN_HEIGHT + 6;
                this.pumpkins.push({ x, y, isSmashed: false });
                this.pumpkinSpawnTimer = 0;
            }
        }
        
        // Spawn attacking enemies periodically
        this.enemySpawnTimer += deltaMultiplier;
        if (this.enemySpawnTimer >= 180) { // Every 3 seconds at 60fps
            this.spawnAttackingEnemy();
            this.enemySpawnTimer = 0;
        }
        
        // Spawn candy periodically with random chance
        this.candySpawnTimer += deltaMultiplier;
        if (this.candySpawnTimer >= 120) { // Every 2 seconds at 60fps (for testing)
            // 100% chance to spawn candy (for testing)
            if (!this.candy) {
                this.spawnCandy();
            }
            this.candySpawnTimer = 0;
        }
        
        // Spawn heart rarely, only when damaged
        this.heartSpawnTimer += deltaMultiplier;
        if (this.heartSpawnTimer >= 120) { // Every 2 seconds at 60fps (for testing)
            if (!this.heart && this.lives < 3 && Math.random() < 0.8) { // 80% chance, only when damaged (for testing)
                this.spawnHeart();
            }
            this.heartSpawnTimer = 0;
        }
        
        // Move candy backward with the road
        if (this.candy) {
            this.candy.y -= scrollSpeed;
            
            
            // Remove if gone off top
            if (this.candy.y < -4) {
                this.candy = null;
            }
            
            // Check candy collision
            if (this.checkCandyCollision(this.playerX, this.playerY, spriteWidth, spriteHeight)) {
                this.collectCandy();
            }
        }
        
        // Move heart backward with the road
        if (this.heart) {
            this.heart.y -= scrollSpeed;
            
            // Remove if gone off top
            if (this.heart.y < -4) {
                this.heart = null;
            }
            
            // Check heart collision
            if (this.checkHeartCollision(this.playerX, this.playerY, spriteWidth, spriteHeight)) {
                this.collectHeart();
            }
        }
        
        // Move bushes backward with the road and remove if off screen
        for (let i = this.bushes.length - 1; i >= 0; i--) {
            this.bushes[i].y -= scrollSpeed;
            
            // Remove if gone off top
            if (this.bushes[i].y < -8) {
                this.bushes.splice(i, 1);
            }
        }
        
        // Spawn bushes periodically on the sides of the road
        this.bushSpawnTimer += deltaMultiplier;
        if (this.bushSpawnTimer >= 120) { // Every 2 seconds at 60fps
            let attempts = 0;
            let validPosition = false;
            let x: number = 0;
            
            // Try up to 5 times to find a valid position
            while (!validPosition && attempts < 5) {
                // Randomly choose left or right side
                const isLeftSide = Math.random() < 0.5;
                
                if (isLeftSide) {
                    // Left side: middle 16 pixels of 25-pixel section (x: 4-20)
                    x = 4 + Math.random() * 16;
                } else {
                    // Right side: middle 16 pixels of 25-pixel section (x: 108-124)
                    x = 108 + Math.random() * 16;
                }
                
                const y = PICO8.SCREEN_HEIGHT + 8;
                validPosition = this.isBushPositionValid(x, y);
                
                if (validPosition) {
                    this.bushes.push({ x, y });
                }
                
                attempts++;
            }
            
            this.bushSpawnTimer = 0;
        }
        
        // Update enemy waddle animation and movement
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Move attacking enemies toward player
            if (enemy.isAttacking) {
                // Move upward slower than scroll to catch player
                enemy.y -= scrollSpeed * 1.2; // Move upward at 1.2x scroll speed (slower)
                
                // Track player horizontally - move directly toward player
                const dx = this.playerX - enemy.x;
                if (Math.abs(dx) > 1) { // Small dead zone to prevent jitter
                    const horizontalSpeed = 0.35 * deltaMultiplier; // Better horizontal tracking
                    const movingLeft = dx < 0;
                    enemy.x += Math.sign(dx) * horizontalSpeed;
                    
                    // Update facing direction based on movement
                    enemy.facingLeft = movingLeft;
                    
                    // Waddle like player when moving horizontally
                    enemy.waddleTimer += 0.5 * deltaMultiplier;
                    enemy.waddleOffsetX = 0; // No horizontal waddle
                    enemy.waddleOffsetY = Math.cos(enemy.waddleTimer * 0.7) * 0.5; // Vertical waddle
                    enemy.rotation = Math.sin(enemy.waddleTimer * 1.2) * (movingLeft ? 0.1 : -0.1); // Rotation based on direction
                } else {
                    // Standing still or minimal movement
                    enemy.waddleOffsetX = 0;
                    enemy.waddleOffsetY = 0;
                    enemy.rotation = 0;
                }
                
                // Bone shooting for skeletons (only when not too close and hasn't shot yet)
                if (enemy.type === 'skeleton' && enemy.boneShootTimer !== undefined && !enemy.hasShot) {
                    enemy.boneShootTimer += deltaMultiplier;
                    
                    // Check distance to player - don't shoot if too close
                    const distanceToPlayer = Math.sqrt(
                        Math.pow(this.playerX - enemy.x, 2) + Math.pow(this.playerY - enemy.y, 2)
                    );
                    
                    // Only shoot if not too close (distance > 20 pixels) and timer is ready
                    if (distanceToPlayer > 20 && enemy.boneShootTimer >= 120) { // Shoot once when ready
                        this.shootBone(enemy.x + 4, enemy.y + 4, this.playerX, this.playerY);
                        enemy.hasShot = true; // Mark as having shot
                    }
                }
                
                // Remove if gone off top of screen
                if (enemy.y < -10) {
                    this.enemies.splice(i, 1);
                }
            } else {
                // Horde zombies: gentle idle waddle (no rotation)
                enemy.waddleTimer += 0.3 * deltaMultiplier;
                enemy.waddleOffsetX = Math.sin(enemy.waddleTimer * 0.5) * 0.5;
                enemy.waddleOffsetY = Math.cos(enemy.waddleTimer * 0.7) * 0.3;
                enemy.rotation = 0;
            }
        }
        
        // Update bones
        for (let i = this.bones.length - 1; i >= 0; i--) {
            const bone = this.bones[i];
            
            // Move bone
            bone.x += bone.vx * deltaMultiplier;
            bone.y += bone.vy * deltaMultiplier;
            
            // Rotate bone as it moves
            bone.rotation += 0.2 * deltaMultiplier;
            
            // Remove if off screen
            if (bone.x < -8 || bone.x > PICO8.SCREEN_WIDTH + 8 || 
                bone.y < -8 || bone.y > PICO8.SCREEN_HEIGHT + 8) {
                this.bones.splice(i, 1);
                continue;
            }
            
            // Check collision with player (only when not jumping)
            if (!this.isJumping) {
                const spriteWidth = 6;
                const spriteHeight = 6;
                if (bone.x < this.playerX + spriteWidth && 
                    bone.x + 4 > this.playerX && 
                    bone.y < this.playerY + spriteHeight && 
                    bone.y + 4 > this.playerY) {
                    
                    // Hit player - take damage
                    this.takeDamage();
                    this.bones.splice(i, 1);
                }
            }
        }
        
        // Update blood splatter fade timers
        for (let i = this.bloodSplatters.length - 1; i >= 0; i--) {
            const splatter = this.bloodSplatters[i];
            
            if (splatter.state === 'initial' && splatter.fadeTimer > 0) {
                // Initial damage fade - fade from 0.7 to 0.3 (more faded)
                splatter.fadeTimer -= deltaMultiplier;
                const fadeProgress = Math.max(0, splatter.fadeTimer / 120); // 2 seconds to partial fade
                splatter.opacity = 0.3 + (fadeProgress * 0.4); // Fades from 0.7 to 0.3
                
                // When fade timer reaches 0, transition to dim state
                if (splatter.fadeTimer <= 0) {
                    splatter.state = 'dim';
                    splatter.opacity = 0.3; // Stay at dim opacity (more faded)
                    splatter.fadeTimer = 0; // No more fading until heart collection
                }
            } else if (splatter.state === 'fading' && splatter.fadeTimer > 0) {
                // Healing fade - fade from 0.3 to 0.0 (complete fade)
                splatter.fadeTimer -= deltaMultiplier;
                const fadeProgress = Math.max(0, splatter.fadeTimer / 60);
                splatter.opacity = fadeProgress * 0.3; // Fade from 0.3 to 0.0
                
                // Remove splatter when fully faded
                if (splatter.opacity <= 0.01) {
                    this.bloodSplatters.splice(i, 1);
                }
            }
            // 'dim' state blood splatters stay at 0.4 opacity and don't fade on their own
        }

        // Update sparkle particles
        for (let i = this.sparkleParticles.length - 1; i >= 0; i--) {
            const particle = this.sparkleParticles[i];
            
            // Update position
            particle.x += particle.vx * deltaMultiplier;
            particle.y += particle.vy * deltaMultiplier;
            
            // Apply gravity
            particle.vy += 0.1 * deltaMultiplier;
            
            // Update life
            particle.life -= deltaMultiplier;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.sparkleParticles.splice(i, 1);
            }
        }
        
        // Check damage conditions and enemy collisions
        let shouldTakeDamage = false;
        
        // 1. Player collides with enemy (unless jumping and not at top)
        if (!this.isJumping || this.playerY < 20) {
            const hitEnemy = this.checkEnemyCollisionWithType(this.playerX, this.playerY, spriteWidth, spriteHeight);
            if (hitEnemy) {
                if (hitEnemy.isAttacking) {
                    // Attacking zombie: pass through but slowed down significantly
                    // Apply heavy slowdown to all movement
                    if (isMoving) {
                        const slowdownFactor = 0.5; // Counter 50% of movement
                        if (currentDirection === 'up') {
                            this.playerY += speed * slowdownFactor;
                        } else if (currentDirection === 'down') {
                            this.playerY -= speed * slowdownFactor;
                        } else if (currentDirection === 'left') {
                            this.playerX += speed * slowdownFactor;
                        } else if (currentDirection === 'right') {
                            this.playerX -= speed * slowdownFactor;
                        }
                    }
                } else {
                    // Horde zombie: bounce player back (forward in game terms, away from horde)
                    const bounceDistance = 6;
                    this.playerY = Math.min(PICO8.SCREEN_HEIGHT - spriteHeight, this.playerY + bounceDistance);
                }
                shouldTakeDamage = true;
            }
        }
        // 2. Player hits zombie barrier at top
        if (this.playerY <= 10) {
            shouldTakeDamage = true;
            // Stop at barrier
            this.playerY = 10;
        }
        // 3. Player falls off bottom
        if (this.playerY >= PICO8.SCREEN_HEIGHT - spriteHeight) {
            shouldTakeDamage = true;
        }
        
        // Take damage if hit (and not invincible)
        if (shouldTakeDamage && this.invincibilityTimer <= 0) {
            this.takeDamage();
        }
    }
    
    private checkCollision(x: number, y: number, width: number, height: number, isJumping: boolean = false): boolean {
        // When jumping, only check collisions with enemies at the top (horde)
        if (isJumping) {
            // Only check enemy collisions when near the top of the screen
            if (y < 20) { // Top 20 pixels
                return this.checkEnemyCollision(x, y, width, height);
            }
            return false; // No collision while jumping (except top)
        }
        
        // Normal collision: Check collision with pumpkins (exact hitbox)
        const hitboxPadding = 0; // No padding - exact collision
        for (let i = 0; i < this.pumpkins.length; i++) {
            const pumpkin = this.pumpkins[i];
            if (x + hitboxPadding < pumpkin.x + 6 - hitboxPadding && 
                x + width - hitboxPadding > pumpkin.x + hitboxPadding &&
                y + hitboxPadding < pumpkin.y + 6 - hitboxPadding && 
                y + height - hitboxPadding > pumpkin.y + hitboxPadding) {
                
                // If pumpkin is not already smashed, smash it and create particles
                if (!pumpkin.isSmashed) {
                    pumpkin.isSmashed = true;
                    this.createOrangeParticles(pumpkin.x + 3, pumpkin.y + 3); // Center of pumpkin
                    
                    // Play pumpkin hit sound
                    if (this.pumpkinHitAudio) {
                        const hitClone = this.pumpkinHitAudio.cloneNode() as HTMLAudioElement;
                        hitClone.volume = 0.8;
                        hitClone.play().catch(e => console.log('Pumpkin hit sound play failed:', e));
                    }
                }
                
                return true; // Block movement
            }
        }
        
        // Also check enemies when not jumping
        return this.checkEnemyCollision(x, y, width, height);
    }
    
    
    private checkEnemyCollision(x: number, y: number, width: number, height: number): boolean {
        // Check collision with enemies (only horde zombies block movement)
        const hitboxPadding = 0; // No padding - exact collision
        for (const enemy of this.enemies) {
            // Only block on horde zombies, not attacking zombies
            if (!enemy.isAttacking) {
                if (x + hitboxPadding < enemy.x + 8 - hitboxPadding && 
                    x + width - hitboxPadding > enemy.x + hitboxPadding &&
                    y + hitboxPadding < enemy.y + 8 - hitboxPadding && 
                    y + height - hitboxPadding > enemy.y + hitboxPadding) {
                    return true; // Collision with horde zombie detected - blocks movement
                }
            }
        }
        return false;
    }
    
    private checkEnemyCollisionWithType(x: number, y: number, width: number, height: number): Enemy | null {
        // Check collision with enemies and return the enemy hit
        const hitboxPadding = 0; // No padding - exact collision
        for (const enemy of this.enemies) {
            if (x + hitboxPadding < enemy.x + 8 - hitboxPadding && 
                x + width - hitboxPadding > enemy.x + hitboxPadding &&
                y + hitboxPadding < enemy.y + 8 - hitboxPadding && 
                y + height - hitboxPadding > enemy.y + hitboxPadding) {
                return enemy; // Return the enemy we collided with
            }
        }
        return null;
    }
    
    private spawnCandy(): void {
        const x = Math.random() * (PICO8.SCREEN_WIDTH - 4); // 4x4 size after scaling
        const y = PICO8.SCREEN_HEIGHT;
        const rotation = Math.random() * Math.PI * 2; // Random rotation 0 to 2π
        this.candy = { x, y, rotation };
    }
    
    private checkCandyCollision(x: number, y: number, width: number, height: number): boolean {
        if (!this.candy) return false;
        // Candy is now 4x4 due to 0.5 scale
        return x < this.candy.x + 4 && x + width > this.candy.x &&
               y < this.candy.y + 4 && y + height > this.candy.y;
    }
    
    private collectCandy(): void {
        // Spawn sparkle particles at candy position
        if (this.candy) {
            const colors = ['#FFA500', '#FFFF00', '#FFFFFF']; // Orange, yellow, white
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 * i) / 8;
                const speed = 1 + Math.random() * 2;
                this.sparkleParticles.push({
                    x: this.candy!.x + 2, // Center of candy
                    y: this.candy!.y + 2,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 1, // Slight upward bias
                    life: 30 + Math.random() * 20, // 0.5-0.83 seconds
                    maxLife: 30 + Math.random() * 20,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: 1 + Math.random() * 2
                });
            }
        }
        
        this.candy = null;
        this.candyCount++;
        this.updateCandyCounter();
        
        // Play candy coin sound
        if (this.candyCoinAudio) {
            const coinClone = this.candyCoinAudio.cloneNode() as HTMLAudioElement;
            coinClone.volume = 0.6;
            coinClone.play().catch(e => console.log('Candy coin sound play failed:', e));
        }
    }
    
    private updateCandyCounter(): void {
        const counterElement = document.getElementById('candyCount');
        if (counterElement) {
            counterElement.textContent = this.candyCount.toString();
        }
    }
    
    private spawnHeart(): void {
        const x = Math.random() * (PICO8.SCREEN_WIDTH - 4); // 4x4 size after scaling
        const y = PICO8.SCREEN_HEIGHT;
        const rotation = 0; // Always upright, no rotation
        this.heart = { x, y, rotation };
    }
    
    private checkHeartCollision(x: number, y: number, width: number, height: number): boolean {
        if (!this.heart) return false;
        // Heart is now 4x4 due to 0.5 scale
        return x < this.heart.x + 4 && x + width > this.heart.x &&
               y < this.heart.y + 4 && y + height > this.heart.y;
    }
    
    private collectHeart(): void {
        // Spawn red sparkle particles at heart position
        if (this.heart) {
            const colors = ['#FF0000', '#FF4444', '#FF6666']; // Red variations
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 * i) / 8;
                const speed = 1 + Math.random() * 2;
                this.sparkleParticles.push({
                    x: this.heart!.x + 2, // Center of heart
                    y: this.heart!.y + 2,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 1, // Slight upward bias
                    life: 30 + Math.random() * 20, // 0.5-0.83 seconds
                    maxLife: 30 + Math.random() * 20,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: 1 + Math.random() * 2
                });
            }
        }
        
        this.heart = null;
        const oldLives = this.lives;
        this.lives = Math.min(3, this.lives + 1); // Restore one life, max 3
        
        // Play heart power-up sound
        if (this.heartPowerUpAudio) {
            const powerUpClone = this.heartPowerUpAudio.cloneNode() as HTMLAudioElement;
            powerUpClone.volume = 0.7;
            powerUpClone.play().catch(e => console.log('Heart power-up sound play failed:', e));
        }
        
        // Only fade blood if life was actually restored
        if (this.lives > oldLives) {
            // Find the oldest blood splatter and start fading it from dim (0.3) to invisible (0.0)
            if (this.bloodSplatters.length > 0) {
                // Find the first blood splatter that's in 'dim' state
                const dimSplatter = this.bloodSplatters.find(s => s.state === 'dim');
                if (dimSplatter) {
                    dimSplatter.state = 'fading';
                    dimSplatter.opacity = 0.3; // Start from dim state (more faded)
                    dimSplatter.fadeTimer = 60; // 1 second to fully fade to invisible
                }
            }
        }
    }
    
    private createOrangeParticles(x: number, y: number): void {
        // Create orange particles when pumpkin is smashed
        const colors = ['#FF8C00', '#FFA500', '#FFB347', '#FFD700']; // Orange variations
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const speed = 1.5 + Math.random() * 2.5;
            this.sparkleParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.5, // Slight upward bias
                life: 40 + Math.random() * 30, // 0.67-1.17 seconds
                maxLife: 40 + Math.random() * 30,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 1 + Math.random() * 3
            });
        }
    }
    
    private takeDamage(): void {
        this.lives--;
        
        // Play hit sounds
        this.playHitSounds();
        
        // Check if dead
        if (this.lives <= 0) {
            this.gameOver();
            return; // Don't show blood splatter on final hit
        }
        
        // Find corners that don't already have blood
        const allCorners: Array<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'> = [
            'top-left', 'top-right', 'bottom-left', 'bottom-right'
        ];
        const usedCorners = this.bloodSplatters.map(s => s.corner);
        const availableCorners = allCorners.filter(corner => !usedCorners.includes(corner));
        
        // If all corners are used, pick a random one anyway
        const cornersToChooseFrom = availableCorners.length > 0 ? availableCorners : allCorners;
        const randomCorner = cornersToChooseFrom[Math.floor(Math.random() * cornersToChooseFrom.length)];
        
        // Add blood splatter effect (only if still alive)
        // Blood appears at full opacity (0.7) and fades to dim (0.4) over time
        this.bloodSplatters.push({
            opacity: 0.7,
            fadeTimer: 120, // 2 seconds at 60fps to fade from 0.7 to 0.4
            corner: randomCorner,
            state: 'initial'
        });
        
        // Grant invincibility frames (2 seconds)
        this.invincibilityTimer = 120;
        
        // Update lives display
        this.updateLivesDisplay();
    }
    
    private updateLivesDisplay(): void {
        const livesElement = document.getElementById('livesCount');
        if (livesElement) {
            livesElement.textContent = this.lives.toString();
        }
    }
    
    private gameOver(): void {
        if (this.isGameOver) return; // Already game over
        
        this.isGameOver = true;
        this.gameOverTimer = 0; // Reset timer for text delay
        console.log('Game Over!');
        
        // Check and update high score
        if (this.candyCount > this.highScore) {
            this.highScore = this.candyCount;
            this.saveSettings(); // Save the new high score
            console.log('New high score:', this.highScore);
        }
        
        // Clear any active blood splatters
        this.bloodSplatters = [];
        
        // Stop background music
        const audio = document.getElementById('backgroundMusic') as HTMLAudioElement;
        if (audio) {
            audio.pause();
        }
        
        // Stop breathing sound
        if (this.breathingAudio) {
            this.breathingAudio.pause();
            this.breathingAudio.currentTime = 0;
            this.breathingAudio.volume = 0;
            this.isBreathing = false;
        }
        
        // Play static sound
        this.playStaticAudio();
    }
    
    private render(): void {
        // Clear screen with black
        this.ctx.fillStyle = PICO8Utils.getColor(PICO8.COLORS.BLACK);
        this.ctx.fillRect(0, 0, PICO8.DISPLAY_WIDTH, PICO8.DISPLAY_HEIGHT);
        
        // Show loading screen if assets not loaded
        if (!this.assetsLoaded) {
            this.renderLoadingScreen();
            return;
        }
        
        // Scale up the rendering context for pixel-perfect 4x scaling
        this.ctx.save();
        this.ctx.scale(PICO8.DISPLAY_SCALE, PICO8.DISPLAY_SCALE);
        
        // Draw street background as individual pixels with scrolling
        if (this.streetPixels.length > 0) {
            // Draw first copy (scrolled)
            for (const pixel of this.streetPixels) {
                this.ctx.fillStyle = pixel.color;
                const scrolledY = pixel.y - this.backgroundScrollY;
                if (scrolledY >= -1 && scrolledY < PICO8.SCREEN_HEIGHT) {
                    this.ctx.fillRect(pixel.x, scrolledY, 1, 1);
                }
            }
            
            // Draw second copy (for seamless wrap)
            for (const pixel of this.streetPixels) {
                this.ctx.fillStyle = pixel.color;
                const scrolledY = pixel.y - this.backgroundScrollY + PICO8.SCREEN_HEIGHT;
                if (scrolledY >= -1 && scrolledY < PICO8.SCREEN_HEIGHT) {
                    this.ctx.fillRect(pixel.x, scrolledY, 1, 1);
                }
            }
        }
        
        // Draw pumpkins
        for (const pumpkin of this.pumpkins) {
            const pixels = pumpkin.isSmashed ? this.smashedPumpkinPixels : this.pumpkinPixels;
            
            if (pixels.length > 0) {
                this.ctx.save();
                
                // Move to center of pumpkin and scale
                const pumpkinScale = 0.75; // Same as player
                const pumpkinSize = 8 * pumpkinScale; // 6 pixels
                const centerX = pumpkin.x + pumpkinSize / 2;
                const centerY = pumpkin.y + pumpkinSize / 2;
                this.ctx.translate(centerX, centerY);
                this.ctx.scale(pumpkinScale, pumpkinScale);
                
                // Draw pixels relative to center
                for (const pixel of pixels) {
                    this.ctx.fillStyle = pixel.color;
                    this.ctx.fillRect(pixel.x - 4, pixel.y - 4, 1, 1);
                }
                
                this.ctx.restore();
            } else {
                // Fallback to orange rectangle if sprite not loaded
                this.ctx.fillStyle = pumpkin.isSmashed ? '#8B4513' : '#FF8C00'; // Brown for smashed, orange for normal
                this.ctx.fillRect(pumpkin.x, pumpkin.y, 6, 6);
            }
        }
        
        // Draw bushes
        for (const bush of this.bushes) {
            if (this.bushPixels.length > 0) {
                this.ctx.save();
                
                // Draw bushes at full size (8x8)
                for (const pixel of this.bushPixels) {
                    this.ctx.fillStyle = pixel.color;
                    this.ctx.fillRect(bush.x + pixel.x, bush.y + pixel.y, 1, 1);
                }
                
                this.ctx.restore();
            } else {
                // Fallback to green rectangle if sprite not loaded
                this.ctx.fillStyle = '#228B22';
                this.ctx.fillRect(bush.x, bush.y, 8, 8);
            }
        }
        
        // Draw enemies (zombies) with waddle, rotation, and horizontal flip
        for (const enemy of this.enemies) {
            if (enemy.sprite.length > 0) {
                this.ctx.save();
                
                // Move to sprite center for rotation and flip
                const centerX = enemy.x + 4 + enemy.waddleOffsetX; // 8x8 sprite, center at 4
                const centerY = enemy.y + 4 + enemy.waddleOffsetY;
                this.ctx.translate(centerX, centerY);
                
                // Apply rotation if present
                if (enemy.rotation !== undefined && enemy.rotation !== 0) {
                    this.ctx.rotate(enemy.rotation);
                }
                
                // Apply horizontal flip if facing left
                if (enemy.facingLeft) {
                    this.ctx.scale(-1, 1);
                }
                
                // Draw pixels relative to center
                for (const pixel of enemy.sprite) {
                    this.ctx.fillStyle = pixel.color;
                    this.ctx.fillRect(pixel.x - 4, pixel.y - 4, 1, 1);
                }
                
                this.ctx.restore();
            } else {
                // Fallback to red rectangle if sprite not loaded
                this.ctx.fillStyle = '#FF0000';
                this.ctx.fillRect(enemy.x + enemy.waddleOffsetX, enemy.y + enemy.waddleOffsetY, 8, 8);
            }
        }
        
        // Draw bones
        for (const bone of this.bones) {
            if (this.bonePixels.length > 0) {
                this.ctx.save();
                
                // Move to bone center and apply rotation
                const centerX = bone.x + 2; // 4x4 bone, center at 2
                const centerY = bone.y + 2;
                this.ctx.translate(centerX, centerY);
                this.ctx.rotate(bone.rotation);
                this.ctx.scale(0.5, 0.5); // Scale down to 50%
                
                // Draw bone pixels
                for (const pixel of this.bonePixels) {
                    this.ctx.fillStyle = pixel.color;
                    this.ctx.fillRect(pixel.x - 4, pixel.y - 4, 1, 1);
                }
                
                this.ctx.restore();
            } else {
                // Fallback to white rectangle if sprite not loaded
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillRect(bone.x, bone.y, 4, 4);
            }
        }
        
        // Draw candy
        if (this.candy) {
            
            if (this.candyPixels.length > 0) {
                // Add subtle glow effect that follows the candy shape
                const glowIntensity = 0.3 + 0.15 * Math.sin(Date.now() * 0.008); // Faster pulsing
                this.ctx.save();
                
                // Move to center of candy, apply rotation and scale
                const candySize = 4; // Half the original 8x8 size
                const centerX = this.candy.x + candySize;
                const centerY = this.candy.y + candySize;
                this.ctx.translate(centerX, centerY);
                this.ctx.rotate(this.candy.rotation);
                this.ctx.scale(0.5, 0.5); // Scale down to 50%
                
                // Draw subtle glow layer
                this.ctx.globalAlpha = glowIntensity * 0.2; // More transparent
                this.ctx.fillStyle = '#FFFFFF'; // White glow
                for (const pixel of this.candyPixels) {
                    // Draw slightly larger glow
                    this.ctx.fillRect(pixel.x - 4 - 1, pixel.y - 4 - 1, 3, 3);
                }
                
                // Draw the actual candy pixels on top
                this.ctx.globalAlpha = 1.0;
                for (const pixel of this.candyPixels) {
                    this.ctx.fillStyle = pixel.color;
                    this.ctx.fillRect(pixel.x - 4, pixel.y - 4, 1, 1);
                }
                
                this.ctx.restore();
            } else {
                // Fallback to red box if sprite not loaded
                this.ctx.fillStyle = PICO8Utils.getColor(PICO8.COLORS.RED);
                this.ctx.fillRect(this.candy.x, this.candy.y, 4, 4);
            }
        }

        // Draw heart (hide during intro)
        if (this.heart && this.isIntroComplete) {
            if (this.heartPixels.length > 0) {
                // Add subtle glow effect that follows the heart shape
                const glowIntensity = 0.3 + 0.15 * Math.sin(Date.now() * 0.008); // Faster pulsing
                this.ctx.save();
                
                // Move to center of heart, apply rotation and scale
                const heartSize = 4; // Half the original 8x8 size
                const centerX = this.heart.x + heartSize;
                const centerY = this.heart.y + heartSize;
                this.ctx.translate(centerX, centerY);
                this.ctx.rotate(this.heart.rotation);
                this.ctx.scale(0.5, 0.5); // Scale down to 50%
                
                // Draw subtle glow layer
                this.ctx.globalAlpha = glowIntensity * 0.2; // More transparent
                this.ctx.fillStyle = '#FF0000'; // Red glow
                for (const pixel of this.heartPixels) {
                    // Draw slightly larger glow
                    this.ctx.fillRect(pixel.x - 4 - 1, pixel.y - 4 - 1, 3, 3);
                }
                
                // Draw the actual heart pixels on top
                this.ctx.globalAlpha = 1.0;
                for (const pixel of this.heartPixels) {
                    this.ctx.fillStyle = pixel.color;
                    this.ctx.fillRect(pixel.x - 4, pixel.y - 4, 1, 1);
                }
                
                this.ctx.restore();
            } else {
                // Fallback to red box if sprite not loaded
                this.ctx.fillStyle = PICO8Utils.getColor(PICO8.COLORS.RED);
                this.ctx.fillRect(this.heart.x, this.heart.y, 4, 4);
            }
        }

        // Draw sparkle particles
        for (const particle of this.sparkleParticles) {
            const alpha = particle.life / particle.maxLife;
            const size = particle.size * alpha;
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x - size/2, particle.y - size/2, size, size);
            this.ctx.restore();
        }
        
        // Draw ghost sprite as individual pixels with waddle and rotation
        if (this.ghostPixels.length > 0) {
            // Flash when invincible
            const isInvincible = this.invincibilityTimer > 0;
            const shouldDraw = !isInvincible || Math.floor(this.invincibilityTimer / 5) % 2 === 0;
            
            if (shouldDraw) {
                // Save context for rotation
                this.ctx.save();
                
                const playerScale = 0.75; // Scale down to 75%
                const scaledSize = 8 * playerScale; // 6 pixels
                
                // Move to sprite center for rotation
                const centerX = this.playerX + scaledSize / 2 + this.waddleOffsetX;
                const centerY = this.playerY + scaledSize / 2 + this.waddleOffsetY - this.jumpOffset;
                this.ctx.translate(centerX, centerY);
                this.ctx.rotate(this.rotation);
                
                // Apply scale (flip horizontally if moving left)
                if (this.lastDirection === 'left') {
                    this.ctx.scale(-playerScale, playerScale);
                } else {
                    this.ctx.scale(playerScale, playerScale);
                }
                
                // Draw pixels relative to center
                for (const pixel of this.ghostPixels) {
                    this.ctx.fillStyle = pixel.color;
                    this.ctx.fillRect(pixel.x - 4, pixel.y - 4, 1, 1);
                }
                
                this.ctx.restore();
            }
        } else {
            // Fallback to colored rectangle if sprite not loaded
            this.ctx.fillStyle = PICO8Utils.getColor(this.playerColor);
            this.ctx.fillRect(this.playerX + this.waddleOffsetX, this.playerY + this.waddleOffsetY, 6, 6);
        }
        
        // Draw title (on controls screen or fading)
        if ((this.gameState === GameState.SHOWING_CONTROLS || this.titleFading) && this.titleImg) {
            this.ctx.save();
            
            const titleScaleW = 0.5; // Wider
            const titleScaleH = 0.25; // Less tall
            const titleWidth = PICO8.SCREEN_WIDTH * titleScaleW;
            const titleHeight = PICO8.SCREEN_HEIGHT * titleScaleH;
            const titleX = (PICO8.SCREEN_WIDTH - titleWidth) / 2;
            const titleY = (PICO8.SCREEN_HEIGHT - titleHeight) / 2 - 20; // Above controls
            
            // Apply fade effect
            if (this.titleFading) {
                const fadeProgress = this.titleFadeTimer / 60; // 1 second fade
                this.ctx.globalAlpha = Math.max(0, 1 - fadeProgress);
            }
            
            this.ctx.drawImage(this.titleImg, titleX, titleY, titleWidth, titleHeight);
            
            this.ctx.restore();
        }
        
        // Draw controls screen
        if (this.gameState === GameState.SHOWING_CONTROLS) {
            
            // Draw controls image with flashing
            if (this.controlsImg) {
                // Hard flashing effect - on/off
                const flashVisible = Math.floor(performance.now() / 500) % 2 === 0;
                
                if (flashVisible) {
                    this.ctx.save();
                    
                    // Draw controls image much smaller and centered
                    const scale = 0.3; // 30% of screen
                    const imgWidth = PICO8.SCREEN_WIDTH * scale;
                    const imgHeight = PICO8.SCREEN_HEIGHT * scale;
                    const x = (PICO8.SCREEN_WIDTH - imgWidth) / 2;
                    const y = (PICO8.SCREEN_HEIGHT - imgHeight) / 2;
                    
                    this.ctx.drawImage(this.controlsImg, x, y, imgWidth, imgHeight);
                    
                    this.ctx.restore();
                }
            }
            
            // Draw high score if available
            if (this.highScore > 0) {
                this.ctx.save();
                this.ctx.fillStyle = PICO8Utils.getColor(PICO8.COLORS.WHITE);
                this.ctx.font = 'bold 4px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`HIGH SCORE: ${this.highScore}`, PICO8.SCREEN_WIDTH / 2, PICO8.SCREEN_HEIGHT - 20);
                this.ctx.restore();
            }
        }
        
        // Draw pause indicator
        if (this.gameState === GameState.PAUSED) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, PICO8.SCREEN_WIDTH, PICO8.SCREEN_HEIGHT);
            this.ctx.fillStyle = PICO8Utils.getColor(PICO8.COLORS.WHITE);
            this.ctx.font = '8px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', PICO8.SCREEN_WIDTH / 2, PICO8.SCREEN_HEIGHT / 2);
        }
        
        // Draw static TV screen on game over
        if (this.isGameOver) {
            // Fill entire screen with random static noise
            this.staticNoiseOffset += 0.1;
            this.gameOverTimer += 1;
            
            for (let y = 0; y < PICO8.SCREEN_HEIGHT; y++) {
                for (let x = 0; x < PICO8.SCREEN_WIDTH; x++) {
                    // Generate pseudo-random noise based on position and time
                    const noise = Math.random();
                    const brightness = Math.floor(noise * 256);
                    this.ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
                    this.ctx.fillRect(x, y, 1, 1);
                }
            }
            
            // No blood on game over screen - just static
            
            // Add occasional horizontal scan lines for that analog TV feel
            if (Math.random() > 0.95) {
                const scanY = Math.floor(Math.random() * PICO8.SCREEN_HEIGHT);
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                this.ctx.fillRect(0, scanY, PICO8.SCREEN_WIDTH, 1);
            }
            
            // Add occasional vertical glitch lines
            if (Math.random() > 0.98) {
                const glitchX = Math.floor(Math.random() * PICO8.SCREEN_WIDTH);
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                this.ctx.fillRect(glitchX, 0, 1, PICO8.SCREEN_HEIGHT);
            }
            
            // Show game over text after delay with fade-in (1 second at 60fps = 60 frames)
            if (this.gameOverTimer > 60) {
                // Fade in over 1 second (60 frames)
                const fadeFrames = this.gameOverTimer - 60;
                const fadeOpacity = Math.min(1, fadeFrames / 60);
                
                this.ctx.save();
                
                // Draw dark overlay (like pause screen)
                this.ctx.globalAlpha = fadeOpacity * 0.7;
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, PICO8.SCREEN_WIDTH, PICO8.SCREEN_HEIGHT);
                
                // Draw text
                this.ctx.globalAlpha = fadeOpacity;
                this.ctx.fillStyle = 'rgb(100, 0, 0)'; // Dark blood red
                this.ctx.font = 'bold 8px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('GAME OVER', PICO8.SCREEN_WIDTH / 2, PICO8.SCREEN_HEIGHT / 2 - 6);
                this.ctx.font = 'bold 5px monospace';
                this.ctx.fillText('PRESS R TO RESTART', PICO8.SCREEN_WIDTH / 2, PICO8.SCREEN_HEIGHT / 2 + 4);
                
                this.ctx.restore();
            }
        }
        
        // Draw blood splatters (if any)
        for (const splatter of this.bloodSplatters) {
            this.ctx.save();
            this.ctx.globalAlpha = splatter.opacity;
            
            const scale = 0.5; // Make blood splatters smaller
            let image: HTMLImageElement | null = null;
            let x = 0;
            let y = 0;
            
            switch (splatter.corner) {
                case 'top-left':
                    image = this.bloodTopLeftImage;
                    x = 0;
                    y = 0;
                    break;
                case 'top-right':
                    image = this.bloodTopRightImage;
                    if (image) {
                        x = PICO8.SCREEN_WIDTH - (image.width * scale);
                        y = 0;
                    }
                    break;
                case 'bottom-left':
                    image = this.bloodBottomLeftImage;
                    if (image) {
                        x = 0;
                        y = PICO8.SCREEN_HEIGHT - (image.height * scale);
                    }
                    break;
                case 'bottom-right':
                    image = this.bloodBottomRightImage;
                    if (image) {
                        x = PICO8.SCREEN_WIDTH - (image.width * scale);
                        y = PICO8.SCREEN_HEIGHT - (image.height * scale);
                    }
                    break;
            }
            
            if (image) {
                this.ctx.drawImage(image, x, y, image.width * scale, image.height * scale);
            }
            
            this.ctx.restore();
        }
        
        // Draw candy counter in bottom right (only if not game over)
        if (!this.isGameOver) {
            if (this.candyPixels.length > 0) {
                this.ctx.save();
                
                // Draw tiny candy icon
                const iconX = PICO8.SCREEN_WIDTH - 23;
                const iconY = PICO8.SCREEN_HEIGHT - 7;
                const iconScale = 0.35; // Very small
                
                this.ctx.translate(iconX, iconY);
                this.ctx.scale(iconScale, iconScale);
                
                for (const pixel of this.candyPixels) {
                    this.ctx.fillStyle = pixel.color;
                    this.ctx.fillRect(pixel.x - 4, pixel.y - 4, 1, 1);
                }
                
                this.ctx.restore();
            }
            
            // Draw count number
            this.ctx.fillStyle = PICO8Utils.getColor(PICO8.COLORS.WHITE);
            this.ctx.font = '5px monospace';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`${this.candyCount}`, PICO8.SCREEN_WIDTH - 15, PICO8.SCREEN_HEIGHT - 5);
        }
        
        this.ctx.restore();
        
        // Apply fisheye effect first, then CRT effects
        applyFisheyeEffect(this.ctx, this.canvas, this.fisheyeIntensity);
        
        applyCRTEffect(this.ctx, this.canvas, {
            enableScanlines: this.enableScanlines,
            enableRGBSeparation: this.enableRGBSeparation,
            glowIntensity: this.glowIntensity,
            vignetteIntensity: this.vignetteIntensity
        });
    }
    
    private renderLoadingScreen(): void {
        this.ctx.save();
        this.ctx.scale(PICO8.DISPLAY_SCALE, PICO8.DISPLAY_SCALE);
        
        // Draw loading text
        this.ctx.fillStyle = PICO8Utils.getColor(PICO8.COLORS.WHITE);
        this.ctx.font = '8px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('LOADING...', PICO8.SCREEN_WIDTH / 2, PICO8.SCREEN_HEIGHT / 2 - 10);
        
        // Draw progress
        const progress = Math.floor((this.assetsLoadedCount / this.assetsToLoad) * 100);
        this.ctx.font = '6px monospace';
        this.ctx.fillText(`${progress}%`, PICO8.SCREEN_WIDTH / 2, PICO8.SCREEN_HEIGHT / 2 + 5);
        
        // Draw loading bar
        const barWidth = 60;
        const barHeight = 4;
        const barX = (PICO8.SCREEN_WIDTH - barWidth) / 2;
        const barY = PICO8.SCREEN_HEIGHT / 2 + 10;
        
        // Background
        this.ctx.fillStyle = PICO8Utils.getColor(PICO8.COLORS.DARK_GRAY);
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Progress
        this.ctx.fillStyle = PICO8Utils.getColor(PICO8.COLORS.WHITE);
        const progressWidth = (barWidth * this.assetsLoadedCount) / this.assetsToLoad;
        this.ctx.fillRect(barX, barY, progressWidth, barHeight);
        
        this.ctx.restore();
    }
    
    public stop(): void {
        this.isRunning = false;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PICO8Game();
});
