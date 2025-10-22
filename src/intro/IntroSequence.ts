import { IntroPhase } from '../types/enums';
import { Player } from '../entities/Player';
import { BaseEnemy } from '../entities/enemies/BaseEnemy';
import { PICO8, PICO8Utils } from '../constraints/PICO8Constraints';
import { AudioManager } from '../core/AudioManager';
import { Direction } from '../types/types';
import { IntroCharacter } from './IntroCharacter';
import { Pixel } from '../types/interfaces';

export class IntroSequence {
    private phase: IntroPhase = IntroPhase.WAITING;
    private timer: number = 0;
    private targetStartX: number = 60;
    private targetStartY: number = 80;
    private princessStartX: number = 30;
    private princessStartY: number = 80;
    private pirateStartX: number = 90;
    private pirateStartY: number = 80;
    private randomWalkTimer: number = 0;
    private randomWalkDirection: string = 'right';
    private randomWalkDuration: number = 60;
    private princessRandomWalkTimer: number = 0;
    private princessRandomWalkDirection: string = 'left';
    private princessRandomWalkDuration: number = 45;
    private pirateRandomWalkTimer: number = 0;
    private pirateRandomWalkDirection: string = 'up';
    private pirateRandomWalkDuration: number = 75;
    isComplete: boolean = false;
    roadScrollSpeed: number = 0;
    private gameplayMusicStarted: boolean = false;
    private jumpSoundPlayed: boolean = false;
    private princess: IntroCharacter;
    private pirate: IntroCharacter;

    constructor(princessPixels: Pixel[], piratePixels: Pixel[]) {
        this.princess = new IntroCharacter(princessPixels, this.princessStartX, this.princessStartY);
        this.pirate = new IntroCharacter(piratePixels, this.pirateStartX, this.pirateStartY);
    }

    update(
        deltaMultiplier: number,
        player: Player,
        enemies: BaseEnemy[],
        audioManager: AudioManager,
        isPlayingState: boolean
    ): void {
        if (this.isComplete) {
            this.roadScrollSpeed = 0.8;
            return;
        }

        if (this.phase === IntroPhase.WAITING && !isPlayingState) {
            this.updateRandomWalk(deltaMultiplier, player);
            return;
        }

        if (!isPlayingState) return;

        this.timer += deltaMultiplier;

        console.log('Current phase:', this.phase);
        switch (this.phase) {
            case IntroPhase.WALKING_TO_START:
                this.updateWalkingToStart(deltaMultiplier, player);
                break;
            case IntroPhase.ALL_JUMP:
                console.log('Calling updateAllJump');
                this.updateAllJump(deltaMultiplier, player, audioManager);
                break;
            case IntroPhase.ZOMBIES_ENTERING:
                this.updateZombiesEntering(deltaMultiplier, player, enemies, audioManager);
                break;
            case IntroPhase.ROAD_STARTING:
                this.updateRoadStarting(deltaMultiplier, player, audioManager);
                break;
        }
    }

    private updateRandomWalk(deltaMultiplier: number, player: Player): void {
        // Update player random walk
        this.randomWalkTimer += deltaMultiplier;
        if (this.randomWalkTimer >= this.randomWalkDuration) {
            const directions = ['up', 'down', 'left', 'right'];
            this.randomWalkDirection = directions[Math.floor(Math.random() * directions.length)];
            this.randomWalkDuration = 30 + Math.random() * 90;
            this.randomWalkTimer = 0;
        }

        // Update princess random walk
        this.princessRandomWalkTimer += deltaMultiplier;
        if (this.princessRandomWalkTimer >= this.princessRandomWalkDuration) {
            const directions = ['up', 'down', 'left', 'right'];
            this.princessRandomWalkDirection = directions[Math.floor(Math.random() * directions.length)];
            this.princessRandomWalkDuration = 30 + Math.random() * 90;
            this.princessRandomWalkTimer = 0;
        }

        // Update pirate random walk
        this.pirateRandomWalkTimer += deltaMultiplier;
        if (this.pirateRandomWalkTimer >= this.pirateRandomWalkDuration) {
            const directions = ['up', 'down', 'left', 'right'];
            this.pirateRandomWalkDirection = directions[Math.floor(Math.random() * directions.length)];
            this.pirateRandomWalkDuration = 30 + Math.random() * 90;
            this.pirateRandomWalkTimer = 0;
        }

        const walkSpeed = 0.25 * deltaMultiplier;
        const centerMarginX = PICO8.SCREEN_WIDTH * 0.3;
        const centerMarginY = PICO8.SCREEN_HEIGHT * 0.3;
        const minX = centerMarginX;
        const maxX = PICO8.SCREEN_WIDTH - centerMarginX - player.spriteWidth;
        const minY = centerMarginY;
        const maxY = PICO8.SCREEN_HEIGHT - centerMarginY - player.spriteHeight;

        // Move player
        this.moveCharacter(player, this.randomWalkDirection, walkSpeed, minX, maxX, minY, maxY, deltaMultiplier);
        
        // Move princess
        this.moveCharacter(this.princess, this.princessRandomWalkDirection, walkSpeed, minX, maxX, minY, maxY, deltaMultiplier);
        
        // Move pirate
        this.moveCharacter(this.pirate, this.pirateRandomWalkDirection, walkSpeed, minX, maxX, minY, maxY, deltaMultiplier);
    }

    private moveCharacter(character: Player | IntroCharacter, direction: string, walkSpeed: number, minX: number, maxX: number, minY: number, maxY: number, deltaMultiplier: number): void {
        switch (direction) {
            case 'up':
                character.y = PICO8Utils.clamp(character.y - walkSpeed, minY, maxY);
                character.updateWaddleAnimation('up' as Direction, deltaMultiplier);
                break;
            case 'down':
                character.y = PICO8Utils.clamp(character.y + walkSpeed, minY, maxY);
                character.updateWaddleAnimation('down' as Direction, deltaMultiplier);
                break;
            case 'left':
                character.x = PICO8Utils.clamp(character.x - walkSpeed, minX, maxX);
                character.updateWaddleAnimation('left' as Direction, deltaMultiplier);
                break;
            case 'right':
                character.x = PICO8Utils.clamp(character.x + walkSpeed, minX, maxX);
                character.updateWaddleAnimation('right' as Direction, deltaMultiplier);
                break;
        }
    }

    private updateWalkingToStart(deltaMultiplier: number, player: Player): void {
        const walkSpeed = 0.35 * deltaMultiplier;
        
        // Move player to center
        const playerDx = this.targetStartX - player.x;
        const playerDy = this.targetStartY - player.y;
        const playerDistance = Math.sqrt(playerDx * playerDx + playerDy * playerDy);
        
        // Move princess to left position
        const princessDx = this.princessStartX - this.princess.x;
        const princessDy = this.princessStartY - this.princess.y;
        const princessDistance = Math.sqrt(princessDx * princessDx + princessDy * princessDy);
        
        // Move pirate to right position
        const pirateDx = this.pirateStartX - this.pirate.x;
        const pirateDy = this.pirateStartY - this.pirate.y;
        const pirateDistance = Math.sqrt(pirateDx * pirateDx + pirateDy * pirateDy);

        let allAtPosition = true;

        if (playerDistance > 1) {
            player.x += (playerDx / playerDistance) * walkSpeed;
            player.y += (playerDy / playerDistance) * walkSpeed;
            
            let direction: Direction = 'right';
            if (Math.abs(playerDx) > Math.abs(playerDy)) {
                direction = playerDx > 0 ? 'right' : 'left';
            } else {
                direction = playerDy > 0 ? 'down' : 'up';
            }
            player.updateWaddleAnimation(direction, deltaMultiplier);
            allAtPosition = false;
        } else {
            player.setPosition(this.targetStartX, this.targetStartY);
        }

        if (princessDistance > 1) {
            this.princess.x += (princessDx / princessDistance) * walkSpeed;
            this.princess.y += (princessDy / princessDistance) * walkSpeed;
            
            let direction: Direction = 'right';
            if (Math.abs(princessDx) > Math.abs(princessDy)) {
                direction = princessDx > 0 ? 'right' : 'left';
            } else {
                direction = princessDy > 0 ? 'down' : 'up';
            }
            this.princess.updateWaddleAnimation(direction, deltaMultiplier);
            allAtPosition = false;
        } else {
            this.princess.setPosition(this.princessStartX, this.princessStartY);
        }

        if (pirateDistance > 1) {
            this.pirate.x += (pirateDx / pirateDistance) * walkSpeed;
            this.pirate.y += (pirateDy / pirateDistance) * walkSpeed;
            
            let direction: Direction = 'right';
            if (Math.abs(pirateDx) > Math.abs(pirateDy)) {
                direction = pirateDx > 0 ? 'right' : 'left';
            } else {
                direction = pirateDy > 0 ? 'down' : 'up';
            }
            this.pirate.updateWaddleAnimation(direction, deltaMultiplier);
            allAtPosition = false;
        } else {
            this.pirate.setPosition(this.pirateStartX, this.pirateStartY);
        }

        if (allAtPosition) {
            // Start all jumps and play sound when they reach positions
            console.log('All characters at position, starting jumps and changing to ALL_JUMP phase');
            player.startJump();
            this.princess.startJump();
            this.pirate.startJump();
            this.phase = IntroPhase.ALL_JUMP;
            this.timer = 0;
        }
    }

    private updateAllJump(deltaMultiplier: number, player: Player, audioManager: AudioManager): void {
        // Play jump sound when phase starts (only once)
        if (!this.jumpSoundPlayed) {
            console.log('Playing jump coin sound!');
            audioManager.playJumpCoin();
            this.jumpSoundPlayed = true;
        }

        // Update all jump animations
        player.updateJump(deltaMultiplier);
        this.princess.updateJump(deltaMultiplier);
        this.pirate.updateJump(deltaMultiplier);

        // Check if all characters finished jumping
        if (!player.getIsJumping() && !this.princess.getIsJumping() && !this.pirate.getIsJumping()) {
            this.phase = IntroPhase.ZOMBIES_ENTERING;
            this.timer = 0;
        }
    }

    private updateZombiesEntering(
        deltaMultiplier: number,
        _player: Player,
        enemies: BaseEnemy[],
        _audioManager: AudioManager
    ): void {
        const zombieEnterSpeed = 0.5 * deltaMultiplier;
        const exitSpeed = 1.0 * deltaMultiplier;
        
        // Move zombies down
        for (const enemy of enemies) {
            if (!enemy.isAttacking && enemy.y < 15) {
                enemy.y += zombieEnterSpeed;
            }
        }

        // Move princess and pirate off screen with waddle animation
        this.princess.y += exitSpeed;
        this.princess.updateWaddleAnimation('down' as Direction, deltaMultiplier);
        
        this.pirate.y += exitSpeed;
        this.pirate.updateWaddleAnimation('down' as Direction, deltaMultiplier);

        if (this.timer >= 60) {
            this.phase = IntroPhase.ROAD_STARTING;
            this.timer = 0;
        }
    }


    private updateRoadStarting(deltaMultiplier: number, player: Player, audioManager: AudioManager): void {
        if (!this.gameplayMusicStarted) {
            audioManager.stopAllIntroSounds();
            audioManager.setIntroMusicPlaying(false);

            const audio = document.getElementById('backgroundMusic') as HTMLAudioElement;
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(e => console.log('Audio play failed:', e));
            }
            this.gameplayMusicStarted = true;
        }

        // Make player waddle during road starting
        player.updateWaddleAnimation('right' as Direction, deltaMultiplier);

        const targetSpeed = 0.8;
        const rampDuration = 60;
        this.roadScrollSpeed = Math.min(targetSpeed, (this.timer / rampDuration) * targetSpeed);

        if (this.timer >= rampDuration) {
            this.phase = IntroPhase.COMPLETE;
            this.isComplete = true;
            this.roadScrollSpeed = targetSpeed;
        }
    }

    start(): void {
        this.phase = IntroPhase.WALKING_TO_START;
        this.timer = 0;
    }

    reset(): void {
        this.phase = IntroPhase.WAITING;
        this.timer = 0;
        this.isComplete = false;
        this.roadScrollSpeed = 0;
        this.gameplayMusicStarted = false;
        this.jumpSoundPlayed = false;
        this.princess.reset();
        this.pirate.reset();
        this.princess.setPosition(this.princessStartX, this.princessStartY);
        this.pirate.setPosition(this.pirateStartX, this.pirateStartY);
    }

    getPhase(): IntroPhase {
        return this.phase;
    }

    getPrincess(): IntroCharacter {
        return this.princess;
    }

    getPirate(): IntroCharacter {
        return this.pirate;
    }

    shouldRenderIntroCharacters(): boolean {
        return this.phase === IntroPhase.WAITING || 
               this.phase === IntroPhase.WALKING_TO_START || 
               this.phase === IntroPhase.ALL_JUMP || 
               this.phase === IntroPhase.ZOMBIES_ENTERING;
    }
}

