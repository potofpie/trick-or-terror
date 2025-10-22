import { Pixel } from '../../types/interfaces';
import { EnemyType } from '../../types/enums';
import { PICO8 } from '../../constraints/PICO8Constraints';

export abstract class BaseEnemy {
    x: number;
    y: number;
    protected sprite: Pixel[];
    protected waddleTimer: number;
    protected waddleOffsetX: number = 0;
    protected waddleOffsetY: number = 0;
    protected rotation: number = 0;
    facingLeft: boolean;
    isAttacking: boolean;
    type: EnemyType;

    constructor(
        x: number,
        y: number,
        sprite: Pixel[],
        type: EnemyType,
        facingLeft: boolean,
        isAttacking: boolean
    ) {
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.type = type;
        this.facingLeft = facingLeft;
        this.isAttacking = isAttacking;
        this.waddleTimer = Math.random() * Math.PI * 2;
    }

    update(deltaMultiplier: number, targetX: number, targetY: number): void {
        // All enemies move - constant upward speed while tracking player horizontally
        this.updateMovement(deltaMultiplier, targetX, targetY);

        // Update waddle animation - enemies always waddle since they're always moving upward
        this.waddleTimer += 0.5 * deltaMultiplier;
        // Enemy waddle - only vertical movement since they move upward, not horizontal like player
        this.waddleOffsetX = 0; // No horizontal waddle for enemies
        this.waddleOffsetY = Math.cos(this.waddleTimer * 0.7) * 0.5; // Vertical waddle only
        this.rotation = Math.sin(this.waddleTimer * 1.2) * (this.facingLeft ? 0.15 : -0.15); // Increased rotation for more dynamic swaying

        // Enemy-specific update logic
        this.updateSpecific(deltaMultiplier, targetX, targetY);
    }

    protected updateMovement(deltaMultiplier: number, targetX: number, _targetY: number): void {
        // Only move if this is an attacking enemy
        if (!this.isAttacking) {
            // Horde zombies don't move - they stay stationary at the top
            return;
        }

        // Move toward player horizontally (kiting)
        const dx = targetX - this.x;
        const distance = Math.abs(dx);

        // Add dead zone to prevent snapping when close to player
        const deadZone = 8; // Stop moving when within 8 pixels of player
        if (distance > deadZone) {
            const speed = 0.7 * deltaMultiplier; // Increased from 0.4 to 0.7 for more aggressive tracking
            this.x += (dx / distance) * speed;
            this.facingLeft = dx < 0;
        } else {
            // When in dead zone, just update facing direction without moving
            this.facingLeft = dx < 0;
        }
        
        // Vertical movement is just upward (toward top), not tracking player's Y
        // This makes them kite toward the player then fall off the back naturally
        this.y -= 1.0 * deltaMultiplier; // Faster than road speed (0.8) for proper enemy flow
    }

    // Override in child classes for specific behavior
    protected abstract updateSpecific(deltaMultiplier: number, targetX: number, targetY: number): void;

    render(ctx: CanvasRenderingContext2D): void {
        if (this.sprite.length === 0) return;

        ctx.save();

        const centerX = this.x + 4 + this.waddleOffsetX;
        const centerY = this.y + 4 + this.waddleOffsetY;

        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);

        if (this.facingLeft) {
            ctx.scale(-1, 1);
        }

        for (const pixel of this.sprite) {
            ctx.fillStyle = pixel.color;
            ctx.fillRect(pixel.x - 4, pixel.y - 4, 1, 1);
        }

        ctx.restore();
    }

    isOffScreen(): boolean {
        // Horde zombies (non-attacking) should never be removed
        if (!this.isAttacking) {
            return false;
        }
        // Only attacking enemies can go off screen
        return this.y > PICO8.SCREEN_HEIGHT + 10 || this.y < -40;
    }

    isOnScreen(): boolean {
        return this.y >= 0 && this.y <= PICO8.SCREEN_HEIGHT;
    }

    checkCollision(x: number, y: number, width: number, height: number): boolean {
        const hitboxPadding = 0;
        return x + hitboxPadding < this.x + 8 - hitboxPadding &&
               x + width - hitboxPadding > this.x + hitboxPadding &&
               y + hitboxPadding < this.y + 8 - hitboxPadding &&
               y + height - hitboxPadding > this.y + hitboxPadding;
    }
}

