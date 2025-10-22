import { Pixel } from '../types/interfaces';
import { Animation } from '../utils/Animation';
import { Direction } from '../types/types';

export class IntroCharacter {
    x: number = 60;
    y: number = 80;
    private pixels: Pixel[] = [];
    private waddleOffsetX: number = 0;
    private waddleOffsetY: number = 0;
    private waddleTimer: number = 0;
    private rotation: number = 0;
    private lastDirection: 'left' | 'right' = 'right';
    private jumpOffset: number = 0;
    private isJumping: boolean = false;
    private jumpTimer: number = 0;

    readonly spriteWidth: number = 6;
    readonly spriteHeight: number = 6;

    constructor(pixels: Pixel[], startX: number = 60, startY: number = 80) {
        this.pixels = pixels;
        this.x = startX;
        this.y = startY;
    }

    updateWaddleAnimation(direction: Direction, deltaMultiplier: number): void {
        this.waddleTimer += 0.5 * deltaMultiplier;
        const waddle = Animation.calculateWaddleOffset(this.waddleTimer, direction, this.lastDirection);
        this.waddleOffsetX = waddle.offsetX;
        this.waddleOffsetY = waddle.offsetY;
        this.rotation = waddle.rotation;
        
        if (direction === 'left') this.lastDirection = 'left';
        if (direction === 'right') this.lastDirection = 'right';
    }

    updateJump(deltaMultiplier: number): void {
        this.jumpTimer += 0.08 * deltaMultiplier;
        const jumpHeight = 12;
        const jumpDuration = 1.5;

        this.jumpOffset = Animation.calculateJumpOffset(this.jumpTimer, jumpDuration, jumpHeight);

        if (this.jumpTimer >= jumpDuration) {
            this.isJumping = false;
            this.jumpOffset = 0;
        }
    }

    startJump(): void {
        this.isJumping = true;
        this.jumpTimer = 0;
    }

    getIsJumping(): boolean {
        return this.isJumping;
    }

    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.pixels.length === 0) return;

        ctx.save();

        const playerScale = 0.75;
        const scaledSize = 8 * playerScale;
        const centerX = this.x + scaledSize / 2 + this.waddleOffsetX;
        const centerY = this.y + scaledSize / 2 + this.waddleOffsetY - this.jumpOffset;

        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);

        if (this.lastDirection === 'left') {
            ctx.scale(-playerScale, playerScale);
        } else {
            ctx.scale(playerScale, playerScale);
        }

        for (const pixel of this.pixels) {
            ctx.fillStyle = pixel.color;
            ctx.fillRect(pixel.x - 4, pixel.y - 4, 1, 1);
        }

        ctx.restore();
    }

    reset(): void {
        this.waddleOffsetX = 0;
        this.waddleOffsetY = 0;
        this.waddleTimer = 0;
        this.rotation = 0;
        this.jumpOffset = 0;
        this.isJumping = false;
        this.jumpTimer = 0;
    }
}
