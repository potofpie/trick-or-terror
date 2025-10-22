import { Pixel } from '../types/interfaces';
import { PICO8 } from '../constraints/PICO8Constraints';

export class BackgroundRenderer {
    private streetPixels: Pixel[];
    private scrollY: number = 0;

    constructor(streetPixels: Pixel[]) {
        this.streetPixels = streetPixels;
    }

    update(scrollSpeed: number): void {
        this.scrollY += scrollSpeed;
        if (this.scrollY >= PICO8.SCREEN_HEIGHT) {
            this.scrollY = 0;
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.streetPixels.length === 0) return;

        // Draw first copy (scrolled)
        for (const pixel of this.streetPixels) {
            ctx.fillStyle = pixel.color;
            const scrolledY = pixel.y - this.scrollY;
            if (scrolledY >= -1 && scrolledY < PICO8.SCREEN_HEIGHT) {
                ctx.fillRect(pixel.x, scrolledY, 1, 1);
            }
        }

        // Draw second copy (for seamless wrap)
        for (const pixel of this.streetPixels) {
            ctx.fillStyle = pixel.color;
            const scrolledY = pixel.y - this.scrollY + PICO8.SCREEN_HEIGHT;
            if (scrolledY >= -1 && scrolledY < PICO8.SCREEN_HEIGHT) {
                ctx.fillRect(pixel.x, scrolledY, 1, 1);
            }
        }
    }

    reset(): void {
        this.scrollY = 0;
    }

    getScrollY(): number {
        return this.scrollY;
    }
}

