import { BoneData, Pixel } from '../types/interfaces';
import { PICO8 } from '../constraints/PICO8Constraints';

export class Bone {
    data: BoneData;

    constructor(x: number, y: number, vx: number, vy: number) {
        this.data = {
            x,
            y,
            vx,
            vy,
            rotation: Math.atan2(vy, vx)
        };
    }

    update(deltaMultiplier: number, scrollSpeed: number): void {
        this.data.x += this.data.vx * deltaMultiplier;
        this.data.y += this.data.vy * deltaMultiplier;
        this.data.y -= scrollSpeed; // Compensate for road scroll
        this.data.rotation += 0.1 * deltaMultiplier;
    }

    render(ctx: CanvasRenderingContext2D, pixels: Pixel[]): void {
        if (pixels.length === 0) return;

        ctx.save();

        const centerX = this.data.x + 2; // Smaller center offset for 4x4 bone
        const centerY = this.data.y + 2;

        ctx.translate(centerX, centerY);
        ctx.rotate(this.data.rotation);
        ctx.scale(0.5, 0.5); // Scale down to 50% (4x4 instead of 8x8)

        for (const pixel of pixels) {
            ctx.fillStyle = pixel.color;
            ctx.fillRect(pixel.x - 4, pixel.y - 4, 1, 1);
        }

        ctx.restore();
    }

    isOffScreen(): boolean {
        return this.data.x < -10 || 
               this.data.x > PICO8.SCREEN_WIDTH + 10 ||
               this.data.y < -10 || 
               this.data.y > PICO8.SCREEN_HEIGHT + 10;
    }

    checkCollision(x: number, y: number, width: number, height: number): boolean {
        return this.data.x < x + width &&
               this.data.x + 2 > x && // Smaller collision box for 4x4 bone
               this.data.y < y + height &&
               this.data.y + 2 > y;
    }
}

