import { JawbreakerData, Pixel } from '../types/interfaces';

export class Jawbreaker {
    data: JawbreakerData;
    private pixels: Pixel[];
    private pulseTimer: number = 0;
    private wobbleOffsetX: number = 0;
    private wobbleOffsetY: number = 0;
    private wobbleTimer: number = 0;

    constructor(x: number, y: number, pixels: Pixel[]) {
        this.data = {
            x,
            y,
            rotation: 0,
            scale: 1.0,
            isOrbiting: false
        };
        this.pixels = pixels;
    }

    update(deltaMultiplier: number, scrollSpeed: number, playerX?: number, playerY?: number): void {
        this.data.y -= scrollSpeed;
        this.pulseTimer += 0.1 * deltaMultiplier;
        
        // Float toward player if player position is provided and not orbiting
        if (!this.data.isOrbiting && playerX !== undefined && playerY !== undefined) {
            const dx = playerX - this.data.x;
            const dy = playerY - this.data.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Only float if within close range (8-25 pixels) - closer attraction
            if (distance > 4 && distance < 25) {
                const floatSpeed = 0.8 * deltaMultiplier; // Faster float speed
                this.data.x += (dx / distance) * floatSpeed;
                this.data.y += (dy / distance) * floatSpeed;
            }
        }

        // No rotation - just bobbing and glow
    }

    updateOrbital(playerX: number, playerY: number, deltaMultiplier: number): void {
        if (!this.data.isOrbiting) return;
        
        this.pulseTimer += 0.1 * deltaMultiplier;
        
        // Base position: ahead of player, slightly below
        const baseX = playerX + 3; // Center of player sprite
        const baseY = playerY + 12; // Further ahead of player
        
        // Add wobble effect
        this.wobbleTimer += 0.05 * deltaMultiplier;
        this.wobbleOffsetX = Math.sin(this.wobbleTimer) * 2;
        this.wobbleOffsetY = Math.cos(this.wobbleTimer * 0.7) * 1.5;
        
        this.data.x = baseX + this.wobbleOffsetX;
        this.data.y = baseY + this.wobbleOffsetY;
    }

    private getBobOffset(): number {
        return Math.sin(this.pulseTimer * 0.8) * 2; // More visible bobbing motion
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.pixels.length === 0) return;

        ctx.save();
        
        let renderX = this.data.x;
        let renderY = this.data.y;
        
        // If orbiting, use the position set in updateOrbital
        // (no need to calculate orbital position since it's just floating in front)
        
        const scale = 0.5 * this.data.scale; // Same size as candy
        const bobOffset = this.getBobOffset();
        const centerX = renderX + 4 * scale;
        const centerY = renderY + 4 * scale + bobOffset;

        ctx.translate(centerX, centerY);
        // No rotation - just scale
        ctx.scale(scale, scale);

        // Pulsing glow effect - draw glow around each jawbreaker pixel
        const pulse = Math.sin(this.pulseTimer) * 0.3 + 0.7;
        ctx.globalAlpha = pulse * 0.2; // More visible glow for jawbreaker
        ctx.fillStyle = '#FFFFFF'; // White glow for jawbreaker
        
        // Draw glow for each jawbreaker pixel
        for (const pixel of this.pixels) {
            // Only draw glow for actual jawbreaker pixels (not transparent ones)
            if (pixel.color !== 'transparent' && pixel.color !== 'rgba(0,0,0,0)') {
                // Draw a small glow around each pixel
                ctx.fillRect(pixel.x - 4 - 1, pixel.y - 4 - 1, 3, 3);
            }
        }

        // Draw the actual jawbreaker pixels on top
        ctx.globalAlpha = 1.0;
        for (const pixel of this.pixels) {
            ctx.fillStyle = pixel.color;
            ctx.fillRect(pixel.x - 4, pixel.y - 4, 1, 1);
        }

        ctx.restore();
    }

    isOffScreen(): boolean {
        return this.data.y < -10;
    }

    checkCollision(x: number, y: number, width: number, height: number): boolean {
        return x < this.data.x + 4 &&
               x + width > this.data.x &&
               y < this.data.y + 4 &&
               y + height > this.data.y;
    }

    checkOrbitalCollision(enemyX: number, enemyY: number, enemyWidth: number, enemyHeight: number): boolean {
        if (!this.data.isOrbiting) return false;
        
        // Use the jawbreaker's current position (set in updateOrbital)
        const jawbreakerX = this.data.x;
        const jawbreakerY = this.data.y;
        
        return enemyX < jawbreakerX + 4 &&
               enemyX + enemyWidth > jawbreakerX &&
               enemyY < jawbreakerY + 4 &&
               enemyY + enemyHeight > jawbreakerY;
    }

    setOrbiting(): void {
        this.data.isOrbiting = true;
        this.data.scale = 0.3; // Shrink when collected
    }
}
