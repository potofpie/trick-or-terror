import { PumpkinData, Pixel } from '../types/interfaces';

export class Pumpkin {
    data: PumpkinData;
    private normalPixels: Pixel[];
    private smashedPixels: Pixel[];

    constructor(x: number, y: number, normalPixels: Pixel[], smashedPixels: Pixel[]) {
        this.data = { x, y, isSmashed: false };
        this.normalPixels = normalPixels;
        this.smashedPixels = smashedPixels;
    }

    update(_deltaMultiplier: number, scrollSpeed: number): void {
        this.data.y -= scrollSpeed;
    }

    render(ctx: CanvasRenderingContext2D): void {
        const pixels = this.data.isSmashed ? this.smashedPixels : this.normalPixels;
        
        if (pixels.length === 0) return;

        ctx.save();
        const scale = 0.75;
        ctx.translate(this.data.x, this.data.y);
        ctx.scale(scale, scale);

        for (const pixel of pixels) {
            ctx.fillStyle = pixel.color;
            ctx.fillRect(pixel.x, pixel.y, 1, 1);
        }

        ctx.restore();
    }

    isOffScreen(): boolean {
        return this.data.y < -10;
    }

    checkCollision(x: number, y: number, width: number, height: number): boolean {
        const hitboxPadding = 0;
        return x + hitboxPadding < this.data.x + 6 - hitboxPadding &&
               x + width - hitboxPadding > this.data.x + hitboxPadding &&
               y + hitboxPadding < this.data.y + 6 - hitboxPadding &&
               y + height - hitboxPadding > this.data.y + hitboxPadding;
    }

    smash(): void {
        this.data.isSmashed = true;
    }
}

