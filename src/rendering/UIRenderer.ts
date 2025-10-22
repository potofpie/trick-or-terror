import { PICO8, PICO8Utils } from '../constraints/PICO8Constraints';
import { GameState } from '../types/enums';

export class UIRenderer {
    private controlsImg: HTMLImageElement | null = null;
    private titleImg: HTMLImageElement | null = null;
    private titleFading: boolean = false;
    private titleFadeTimer: number = 0;

    constructor(controlsImg: HTMLImageElement, titleImg: HTMLImageElement) {
        this.controlsImg = controlsImg;
        this.titleImg = titleImg;
    }

    updateTitleFade(deltaMultiplier: number): void {
        if (this.titleFading) {
            this.titleFadeTimer += deltaMultiplier;
        }
    }

    renderControlsScreen(ctx: CanvasRenderingContext2D, highScore: number): void {
        if (this.controlsImg) {
            const flashVisible = Math.floor(performance.now() / 500) % 2 === 0;

            if (flashVisible) {
                ctx.save();

                const scale = 0.3;
                const imgWidth = PICO8.SCREEN_WIDTH * scale;
                const imgHeight = PICO8.SCREEN_HEIGHT * scale;
                const x = (PICO8.SCREEN_WIDTH - imgWidth) / 2;
                const y = (PICO8.SCREEN_HEIGHT - imgHeight) / 2;

                ctx.drawImage(this.controlsImg, x, y, imgWidth, imgHeight);
                ctx.restore();
            }
        }

        if (highScore > 0) {
            ctx.save();
            ctx.fillStyle = PICO8Utils.getColor(PICO8.COLORS.WHITE);
            ctx.font = 'bold 4px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`HIGH SCORE: ${highScore}`, PICO8.SCREEN_WIDTH / 2, PICO8.SCREEN_HEIGHT - 20);
            ctx.restore();
        }
    }

    renderTitle(ctx: CanvasRenderingContext2D, gameState: GameState): void {
        if ((gameState === GameState.SHOWING_CONTROLS || this.titleFading) && this.titleImg) {
            ctx.save();

            const titleScaleW = 0.5;
            const titleScaleH = 0.25;
            const titleWidth = PICO8.SCREEN_WIDTH * titleScaleW;
            const titleHeight = PICO8.SCREEN_HEIGHT * titleScaleH;
            const titleX = (PICO8.SCREEN_WIDTH - titleWidth) / 2;
            const titleY = (PICO8.SCREEN_HEIGHT - titleHeight) / 2 - 20;

            if (this.titleFading) {
                const fadeProgress = this.titleFadeTimer / 60;
                ctx.globalAlpha = Math.max(0, 1 - fadeProgress);
            }

            ctx.drawImage(this.titleImg, titleX, titleY, titleWidth, titleHeight);
            ctx.restore();
        }
    }

    renderPauseScreen(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, PICO8.SCREEN_WIDTH, PICO8.SCREEN_HEIGHT);
        ctx.fillStyle = PICO8Utils.getColor(PICO8.COLORS.WHITE);
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', PICO8.SCREEN_WIDTH / 2, PICO8.SCREEN_HEIGHT / 2);
    }

    renderLoadingScreen(ctx: CanvasRenderingContext2D, loaded: number, total: number): void {
        ctx.fillStyle = PICO8Utils.getColor(PICO8.COLORS.BLACK);
        ctx.fillRect(0, 0, PICO8.SCREEN_WIDTH, PICO8.SCREEN_HEIGHT);

        ctx.fillStyle = PICO8Utils.getColor(PICO8.COLORS.WHITE);
        ctx.font = '4px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LOADING...', PICO8.SCREEN_WIDTH / 2, PICO8.SCREEN_HEIGHT / 2 - 10);

        const barWidth = 80;
        const barHeight = 8;
        const barX = (PICO8.SCREEN_WIDTH - barWidth) / 2;
        const barY = PICO8.SCREEN_HEIGHT / 2;

        ctx.strokeStyle = PICO8Utils.getColor(PICO8.COLORS.WHITE);
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        const progress = loaded / total;
        const fillWidth = (barWidth - 2) * progress;
        ctx.fillStyle = PICO8Utils.getColor(PICO8.COLORS.GREEN);
        ctx.fillRect(barX + 1, barY + 1, fillWidth, barHeight - 2);

        ctx.fillStyle = PICO8Utils.getColor(PICO8.COLORS.WHITE);
        ctx.fillText(`${Math.floor(progress * 100)}%`, PICO8.SCREEN_WIDTH / 2, barY + barHeight + 8);
    }

    startTitleFade(): void {
        this.titleFading = true;
        this.titleFadeTimer = 0;
    }

    resetTitleFade(): void {
        this.titleFading = false;
        this.titleFadeTimer = 0;
    }

    renderCandyCounter(ctx: CanvasRenderingContext2D, candyCount: number, candyPixels: any[]): void {
        // Position at bottom center of screen
        const x = PICO8.SCREEN_WIDTH / 2;
        const y = PICO8.SCREEN_HEIGHT - 8;
        
        // Draw candy sprite (scaled down)
        if (candyPixels && candyPixels.length > 0) {
            ctx.save();
            ctx.translate(x + 43, y -2);
            ctx.scale(0.4, 0.4); // Scale down to 50% size
            
            for (const pixel of candyPixels) {
                ctx.fillStyle = pixel.color;
                ctx.fillRect(pixel.x - 4, pixel.y - 4, 1, 1);
            }
            ctx.restore();
        } else {
            // Fallback to simple square if sprite not available
            ctx.fillStyle = PICO8Utils.getColor(PICO8.COLORS.YELLOW);
            ctx.fillRect(x - 8, y - 6, 4, 4);
        }
        
        // Draw candy count (closer to sprite)
        ctx.fillStyle = PICO8Utils.getColor(PICO8.COLORS.WHITE);
        ctx.font = '4px monospace';
        ctx.textAlign = 'left';
        ctx.fillText((candyCount).toString(), x + 48, y );
    }
}

