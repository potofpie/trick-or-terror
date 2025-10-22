import { EnemyData } from '../types/interfaces';
import { Pixel } from '../types/interfaces';
import { EnemyType } from '../types/enums';
import { Animation } from '../utils/Animation';
import { PICO8 } from '../constraints/PICO8Constraints';

export class Enemy {
    data: EnemyData;

    constructor(
        x: number,
        y: number,
        sprite: Pixel[],
        type: EnemyType,
        facingLeft: boolean,
        isAttacking: boolean = false
    ) {
        this.data = {
            x,
            y,
            sprite,
            waddleTimer: Math.random() * Math.PI * 2,
            waddleOffsetX: 0,
            waddleOffsetY: 0,
            rotation: 0,
            facingLeft,
            isAttacking,
            type,
            boneShootTimer: type === EnemyType.SKELETON ? Math.random() * 180 : undefined,
            hasShot: false
        };
    }

    update(deltaMultiplier: number, targetX?: number, targetY?: number): { shouldShoot: boolean } {
        this.data.waddleTimer += 0.5 * deltaMultiplier;
        const waddle = Animation.calculateEnemyWaddle(this.data.waddleTimer);
        this.data.waddleOffsetX = waddle.offsetX;
        this.data.waddleOffsetY = waddle.offsetY;

        // Only attacking zombies move - horde zombies stay at the top as a barrier
        if (this.data.isAttacking && targetX !== undefined && targetY !== undefined) {
            const dx = targetX - this.data.x;
            const dy = targetY - this.data.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                const speed = 0.4 * deltaMultiplier;
                this.data.x += (dx / distance) * speed;
                this.data.y += (dy / distance) * speed;
                this.data.facingLeft = dx < 0;
            }
        }
        // Horde zombies (isAttacking = false) don't move - they stay at top as barrier

        // Handle skeleton shooting
        if (this.data.type === EnemyType.SKELETON && this.data.boneShootTimer !== undefined) {
            this.data.boneShootTimer -= deltaMultiplier;

            if (this.data.boneShootTimer <= 0 && !this.data.hasShot && this.isOnScreen()) {
                this.data.hasShot = true;
                this.data.boneShootTimer = 180;
                return { shouldShoot: true };
            }

            if (this.data.boneShootTimer <= 0) {
                this.data.boneShootTimer = 180 + Math.random() * 60;
                this.data.hasShot = false;
            }
        }

        return { shouldShoot: false };
    }

    render(ctx: CanvasRenderingContext2D, pixels: Pixel[]): void {
        if (pixels.length === 0) return;

        ctx.save();

        const centerX = this.data.x + 4 + this.data.waddleOffsetX;
        const centerY = this.data.y + 4 + this.data.waddleOffsetY;

        ctx.translate(centerX, centerY);
        
        if (this.data.facingLeft) {
            ctx.scale(-1, 1);
        }

        for (const pixel of pixels) {
            ctx.fillStyle = pixel.color;
            ctx.fillRect(pixel.x - 4, pixel.y - 4, 1, 1);
        }

        ctx.restore();
    }

    isOffScreen(): boolean {
        return this.data.y > PICO8.SCREEN_HEIGHT + 10 || this.data.y < -40;
    }

    isOnScreen(): boolean {
        return this.data.y >= 0 && this.data.y <= PICO8.SCREEN_HEIGHT;
    }

    checkCollision(x: number, y: number, width: number, height: number): boolean {
        const hitboxPadding = 0;
        return x + hitboxPadding < this.data.x + 8 - hitboxPadding &&
               x + width - hitboxPadding > this.data.x + hitboxPadding &&
               y + hitboxPadding < this.data.y + 8 - hitboxPadding &&
               y + height - hitboxPadding > this.data.y + hitboxPadding;
    }
}

