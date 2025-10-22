import { BaseEnemy } from '../entities/enemies/BaseEnemy';
import { Zombie } from '../entities/enemies/Zombie';
import { Skeleton } from '../entities/enemies/Skeleton';
import { Pumpkin } from '../objects/Pumpkin';
import { Bush } from '../objects/Bush';
import { Candy } from '../objects/Candy';
import { Heart } from '../objects/Heart';
import { Jawbreaker } from '../objects/Jawbreaker';
import { Pixel } from '../types/interfaces';
import { PICO8 } from '../constraints/PICO8Constraints';

export class SpawnManager {
    private pumpkinSpawnTimer: number = 0;
    private bushSpawnTimer: number = 0;
    private enemySpawnTimer: number = 0;
    private candySpawnTimer: number = 0;
    private heartSpawnTimer: number = 0;
    private jawbreakerSpawnTimer: number = 0;
    private playerRunningTimer: number = 0;
    private hasStartedRunning: boolean = false;

    update(deltaMultiplier: number, isPlayerRunning: boolean = false): void {
        this.pumpkinSpawnTimer += deltaMultiplier;
        this.bushSpawnTimer += deltaMultiplier;
        this.candySpawnTimer += deltaMultiplier;
        this.heartSpawnTimer += deltaMultiplier;
        this.jawbreakerSpawnTimer += deltaMultiplier;

        // Track player running time
        if (isPlayerRunning) {
            if (!this.hasStartedRunning) {
                this.hasStartedRunning = true;
            }
            this.playerRunningTimer += deltaMultiplier;
        } else {
            // Reset if player stops running
            this.playerRunningTimer = 0;
            this.hasStartedRunning = false;
        }

        // Only start enemy spawn timer after 1 second of running (60 frames at 60fps)
        if (this.hasStartedRunning && this.playerRunningTimer >= 60) {
            this.enemySpawnTimer += deltaMultiplier;
        }
    }

    shouldSpawnPumpkin(): boolean {
        if (this.pumpkinSpawnTimer >= 90) {
            this.pumpkinSpawnTimer = 0;
            return true;
        }
        return false;
    }

    shouldSpawnBush(): boolean {
        if (this.bushSpawnTimer >= 300) {
            this.bushSpawnTimer = 0;
            return true;
        }
        return false;
    }

    shouldSpawnEnemy(): boolean {
        if (this.enemySpawnTimer >= 180) {
            this.enemySpawnTimer = 0;
            return true;
        }
        return false;
    }

    shouldSpawnCandy(): boolean {
        if (this.candySpawnTimer >= 200) {
            this.candySpawnTimer = 0;
            return true;
        }
        return false;
    }

    shouldSpawnHeart(candyCount: number): boolean {
        let spawnInterval = 600; // Base interval
        
        if (candyCount >= 20) {
            spawnInterval = 300;
        } else if (candyCount >= 15) {
            spawnInterval = 400;
        } else if (candyCount >= 10) {
            spawnInterval = 500;
        }
        
        if (this.heartSpawnTimer >= spawnInterval) {
            this.heartSpawnTimer = 0;
            return true;
        }
        return false;
    }

    shouldSpawnJawbreaker(candyCount: number): boolean {
        if (candyCount < 5) return false;
        if (this.jawbreakerSpawnTimer >= 600) {
            this.jawbreakerSpawnTimer = 0;
            return true;
        }
        return false;
    }

    reset(): void {
        this.pumpkinSpawnTimer = 0;
        this.bushSpawnTimer = 0;
        this.enemySpawnTimer = 0;
        this.candySpawnTimer = 0;
        this.heartSpawnTimer = 0;
        this.jawbreakerSpawnTimer = 0;
        this.playerRunningTimer = 0;
        this.hasStartedRunning = false;
    }

    spawnPumpkin(normalPixels: Pixel[], smashedPixels: Pixel[]): Pumpkin {
        const x = Math.random() * (PICO8.SCREEN_WIDTH - 6);
        const y = PICO8.SCREEN_HEIGHT;
        return new Pumpkin(x, y, normalPixels, smashedPixels);
    }

    spawnBush(pixels: Pixel[], existingBushes: Bush[]): Bush | null {
        const x = Math.random() > 0.5
            ? Math.random() * 20 + 5
            : Math.random() * 20 + (PICO8.SCREEN_WIDTH - 25);
        const y = PICO8.SCREEN_HEIGHT;

        if (this.isBushPositionValid(x, y, existingBushes)) {
            return new Bush(x, y, pixels);
        }
        return null;
    }

    private isBushPositionValid(x: number, y: number, bushes: Bush[]): boolean {
        for (const bush of bushes) {
            const dx = bush.data.x - x;
            const dy = bush.data.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 20) {
                return false;
            }
        }
        return true;
    }

    spawnEnemy(
        zombiePixels: Pixel[],
        skeletonPixels: Pixel[],
        playerX: number,
        candyCount: number,
        onSkeletonShoot: (fromX: number, fromY: number, targetX: number, targetY: number) => void
    ): BaseEnemy[] {
        const enemies: BaseEnemy[] = [];
        
        if (candyCount >= 20) {
            // Spawn 3 random enemies
            for (let i = 0; i < 3; i++) {
                const x = Math.random() * PICO8.SCREEN_WIDTH;
                const y = PICO8.SCREEN_HEIGHT + 8;
                const facingLeft = x > playerX;
                const shouldSpawnSkeleton = Math.random() > 0.5;
                
                if (shouldSpawnSkeleton) {
                    enemies.push(new Skeleton(x, y, skeletonPixels, facingLeft, true, onSkeletonShoot));
                } else {
                    enemies.push(new Zombie(x, y, zombiePixels, facingLeft, true));
                }
            }
        } else if (candyCount >= 15) {
            // Spawn two skeletons
            for (let i = 0; i < 2; i++) {
                const x = Math.random() * PICO8.SCREEN_WIDTH;
                const y = PICO8.SCREEN_HEIGHT + 8;
                const facingLeft = x > playerX;
                enemies.push(new Skeleton(x, y, skeletonPixels, facingLeft, true, onSkeletonShoot));
            }
        } else if (candyCount >= 10) {
            // Spawn skeleton + zombie
            const x1 = Math.random() * PICO8.SCREEN_WIDTH;
            const x2 = Math.random() * PICO8.SCREEN_WIDTH;
            const y = PICO8.SCREEN_HEIGHT + 8;
            
            enemies.push(new Skeleton(x1, y, skeletonPixels, x1 > playerX, true, onSkeletonShoot));
            enemies.push(new Zombie(x2, y, zombiePixels, x2 > playerX, true));
        } else if (candyCount >= 5) {
            // Can spawn skeletons (50% chance)
            const x = Math.random() * PICO8.SCREEN_WIDTH;
            const y = PICO8.SCREEN_HEIGHT + 8;
            const facingLeft = x > playerX;
            const shouldSpawnSkeleton = Math.random() > 0.5;
            
            if (shouldSpawnSkeleton) {
                enemies.push(new Skeleton(x, y, skeletonPixels, facingLeft, true, onSkeletonShoot));
            } else {
                enemies.push(new Zombie(x, y, zombiePixels, facingLeft, true));
            }
        } else {
            // Only zombies before 5 candy
            const x = Math.random() * PICO8.SCREEN_WIDTH;
            const y = PICO8.SCREEN_HEIGHT + 8;
            const facingLeft = x > playerX;
            enemies.push(new Zombie(x, y, zombiePixels, facingLeft, true));
        }
        
        return enemies;
    }

    spawnCandy(pixels: Pixel[]): Candy {
        const x = Math.random() * (PICO8.SCREEN_WIDTH - 4);
        const y = PICO8.SCREEN_HEIGHT;
        return new Candy(x, y, pixels);
    }

    spawnHeart(pixels: Pixel[]): Heart {
        const x = Math.random() * (PICO8.SCREEN_WIDTH - 4);
        const y = PICO8.SCREEN_HEIGHT;
        return new Heart(x, y, pixels);
    }

    spawnJawbreaker(pixels: Pixel[]): Jawbreaker {
        const x = Math.random() * (PICO8.SCREEN_WIDTH - 4);
        const y = PICO8.SCREEN_HEIGHT;
        return new Jawbreaker(x, y, pixels);
    }

    initializeZombieHorde(zombiePixels: Pixel[]): BaseEnemy[] {
        const zombieCount = 60;
        const enemies: BaseEnemy[] = [];

        for (let i = 0; i < zombieCount; i++) {
            const x = Math.random() * (PICO8.SCREEN_WIDTH - 8);
            const y = -30 + Math.random() * 15;
            const facingLeft = Math.random() > 0.5;
            // Horde is always zombies, never attacking (stationary barrier)
            enemies.push(new Zombie(x, y, zombiePixels, facingLeft, false));
        }

        return enemies;
    }

    initializeBushes(pixels: Pixel[]): Bush[] {
        const fixedBushes = [
            { x: 12, y: 20 },
            { x: 116, y: 45 },
            { x: 8, y: 70 },
            { x: 112, y: 95 },
            { x: 15, y: 115 }
        ];

        return fixedBushes.map(pos => new Bush(pos.x, pos.y, pixels));
    }
}

