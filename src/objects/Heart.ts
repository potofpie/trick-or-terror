import { HeartData, Pixel } from '../types/interfaces';

export class Heart {
    data: HeartData;
    private pixels: Pixel[];
    private pulseTimer: number = 0;

    constructor(x: number, y: number, pixels: Pixel[]) {
        this.data = { x, y, rotation: 0 };
        this.pixels = pixels;
    }

    update(deltaMultiplier: number, scrollSpeed: number, playerX?: number, playerY?: number): void {
        this.data.y -= scrollSpeed;
        this.pulseTimer += 0.1 * deltaMultiplier;
        
        // Float toward player if player position is provided
        if (playerX !== undefined && playerY !== undefined) {
            const dx = playerX - this.data.x;
            const dy = playerY - this.data.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Only float if within close range (12-20 pixels)
            if (distance > 4 && distance < 15) {
                const floatSpeed = 0.8 * deltaMultiplier; // Faster float speed
                this.data.x += (dx / distance) * floatSpeed;
                this.data.y += (dy / distance) * floatSpeed;
            }
        }
    }

    private getBobOffset(): number {
        return Math.sin(this.pulseTimer * 0.8) * 2; // More visible bobbing motion
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.pixels.length === 0) return;

        ctx.save();

        const scale = 0.5;
        const bobOffset = this.getBobOffset();
        const centerX = this.data.x + 4 * scale;
        const centerY = this.data.y + 4 * scale + bobOffset;

        // Move to center for rotation and scaling
        ctx.translate(centerX, centerY);
        ctx.rotate(this.data.rotation);
        ctx.scale(scale, scale);

        // Pulsing glow effect - draw glow around each heart pixel
        const pulse = Math.sin(this.pulseTimer) * 0.3 + 0.7;
        ctx.globalAlpha = pulse * 0.2; // More subtle glow
        ctx.fillStyle = '#FFFFFF'; // White glow
        
        // Draw glow for each heart pixel
        for (const pixel of this.pixels) {
            // Only draw glow for actual heart pixels (not transparent ones)
            if (pixel.color !== 'transparent' && pixel.color !== 'rgba(0,0,0,0)') {
                // Draw a small glow around each pixel
                ctx.fillRect(pixel.x - 4 - 1, pixel.y - 4 - 1, 3, 3);
            }
        }

        // Draw the actual heart pixels on top
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
}

