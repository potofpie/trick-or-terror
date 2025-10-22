import { BushData, Pixel } from '../types/interfaces';

export class Bush {
    data: BushData;
    private pixels: Pixel[];

    constructor(x: number, y: number, pixels: Pixel[]) {
        this.data = { x, y };
        this.pixels = pixels;
    }

    update(_deltaMultiplier: number, scrollSpeed: number): void {
        this.data.y -= scrollSpeed;
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.pixels.length === 0) return;

        ctx.save();
        ctx.translate(this.data.x, this.data.y);

        for (const pixel of this.pixels) {
            ctx.fillStyle = pixel.color;
            ctx.fillRect(pixel.x, pixel.y, 1, 1);
        }

        ctx.restore();
    }

    isOffScreen(): boolean {
        return this.data.y < -10;
    }
}

