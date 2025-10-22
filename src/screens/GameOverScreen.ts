import { PICO8 } from '../constraints/PICO8Constraints';

export class GameOverScreen {
    private gameOverTimer: number = 0;
    private staticNoiseOffset: number = 0;
    private candyCount: number = 0;
    private candyPixels: any[] = [];

    update(deltaMultiplier: number): void {
        this.gameOverTimer += deltaMultiplier;
        this.staticNoiseOffset += 0.1;
    }

    render(ctx: CanvasRenderingContext2D, candyCount: number = 0, candyPixels: any[] = []): void {
        this.candyCount = candyCount;
        this.candyPixels = candyPixels;
        // Static noise
        for (let y = 0; y < PICO8.SCREEN_HEIGHT; y++) {
            for (let x = 0; x < PICO8.SCREEN_WIDTH; x++) {
                const noise = Math.random();
                const brightness = Math.floor(noise * 256);
                ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }

        // Scan lines
        if (Math.random() > 0.95) {
            const scanY = Math.floor(Math.random() * PICO8.SCREEN_HEIGHT);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillRect(0, scanY, PICO8.SCREEN_WIDTH, 1);
        }

        // Vertical glitches
        if (Math.random() > 0.98) {
            const glitchX = Math.floor(Math.random() * PICO8.SCREEN_WIDTH);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(glitchX, 0, 1, PICO8.SCREEN_HEIGHT);
        }

        // Text after 2 seconds (120 frames at 60fps)
        if (this.gameOverTimer > 120) {
            const fadeFrames = this.gameOverTimer - 120;
            const fadeOpacity = Math.min(1, fadeFrames / 60);

            ctx.save();

            // Semi-transparent black background for better text visibility
            ctx.globalAlpha = fadeOpacity * 0.8;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, PICO8.SCREEN_WIDTH, PICO8.SCREEN_HEIGHT);

            ctx.globalAlpha = fadeOpacity;
            ctx.fillStyle = 'rgb(100, 0, 0)';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', PICO8.SCREEN_WIDTH / 2, PICO8.SCREEN_HEIGHT / 2 - 10);

            // Restart instruction
            ctx.fillStyle = 'rgb(100, 0, 0)';
            ctx.font = 'bold 5px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('PRESS R TO RESTART', PICO8.SCREEN_WIDTH / 2, PICO8.SCREEN_HEIGHT / 2 + 5);

            // Draw candy sprite with count (below everything else, centered as a unit)
            const candyY = PICO8.SCREEN_HEIGHT / 2 + 20;
            const candySpriteWidth = 6; // Approximate width of candy sprite at 0.4 scale
            const textWidth = this.candyCount.toString().length * 3; // Approximate text width
            const totalWidth = candySpriteWidth + 4 + textWidth; // 4px spacing between sprite and text
            const candyX = (PICO8.SCREEN_WIDTH - totalWidth) / 2; // Center the entire unit
            
            if (this.candyPixels && this.candyPixels.length > 0) {
                ctx.save();
                ctx.translate(candyX, candyY);
                ctx.scale(0.4, 0.4); // Smaller than before
                
                for (const pixel of this.candyPixels) {
                    ctx.fillStyle = pixel.color;
                    ctx.fillRect(pixel.x - 4, pixel.y - 4, 1, 1);
                }
                ctx.restore();
            } else {
                // Fallback to simple square if sprite not available
                ctx.fillStyle = 'rgb(255, 255, 0)';
                ctx.fillRect(candyX - 3, candyY - 3, 6, 6);
            }

            // Draw candy count next to sprite
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.font = 'bold 4px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(this.candyCount.toString(), candyX + 8, candyY + 1);

            ctx.restore();
        }
    }

    reset(): void {
        this.gameOverTimer = 0;
        this.staticNoiseOffset = 0;
    }
}

