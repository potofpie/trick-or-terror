import { Pixel } from '../types/interfaces';
import { InputManager } from '../core/InputManager';
import { PICO8, PICO8Utils } from '../constraints/PICO8Constraints';
import { Animation } from '../utils/Animation';
import { Direction } from '../types/types';

export class Player {
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
    invincibilityTimer: number = 0;

    readonly spriteWidth: number = 6;
    readonly spriteHeight: number = 6;

    constructor(pixels: Pixel[]) {
        this.pixels = pixels;
    }

    update(
        inputManager: InputManager,
        deltaMultiplier: number,
        fallSpeed: number,
        isIntroComplete: boolean,
        checkCollision: (x: number, y: number, width: number, height: number, jumping: boolean) => boolean
    ): { moving: boolean; direction: Direction } {
        if (!isIntroComplete) {
            if (this.isJumping) {
                this.updateJump(deltaMultiplier);
            }
            return { moving: false, direction: '' };
        }

        const speed = 0.35 * deltaMultiplier;
        let isMoving = false;
        let currentDirection: Direction = '';

        if (inputManager.isMovingLeft()) {
            const newX = this.x - speed;
            if (!checkCollision(newX, this.y, this.spriteWidth, this.spriteHeight, this.isJumping)) {
                this.x = PICO8Utils.clamp(newX, 1, PICO8.SCREEN_WIDTH - this.spriteWidth - 1);
                isMoving = true;
                currentDirection = 'left';
                this.lastDirection = 'left';
            }
        }
        if (inputManager.isMovingRight()) {
            const newX = this.x + speed;
            if (!checkCollision(newX, this.y, this.spriteWidth, this.spriteHeight, this.isJumping)) {
                this.x = PICO8Utils.clamp(newX, 1, PICO8.SCREEN_WIDTH - this.spriteWidth - 1);
                isMoving = true;
                currentDirection = 'right';
                this.lastDirection = 'right';
            }
        }
        if (inputManager.isMovingUp()) {
            const newY = this.y - speed;
            if (!checkCollision(this.x, newY, this.spriteWidth, this.spriteHeight, this.isJumping)) {
                this.y = PICO8Utils.clamp(newY, 1, PICO8.SCREEN_HEIGHT - this.spriteHeight - 1);
                isMoving = true;
                currentDirection = 'up';
            }
        }
        if (inputManager.isMovingDown()) {
            const newY = this.y + speed;
            if (!checkCollision(this.x, newY, this.spriteWidth, this.spriteHeight, this.isJumping)) {
                this.y = PICO8Utils.clamp(newY, 1, PICO8.SCREEN_HEIGHT - this.spriteHeight - 1);
                isMoving = true;
                currentDirection = 'down';
            }
        }

        if (!isMoving) {
            this.y = PICO8Utils.clamp(this.y - fallSpeed, 1, PICO8.SCREEN_HEIGHT - this.spriteHeight - 1);
        }

        if (isMoving) {
            this.waddleTimer += 0.5 * deltaMultiplier;
            const waddle = Animation.calculateWaddleOffset(this.waddleTimer, currentDirection, this.lastDirection);
            this.waddleOffsetX = waddle.offsetX;
            this.waddleOffsetY = waddle.offsetY;
            this.rotation = waddle.rotation;
        } else {
            this.waddleOffsetX = 0;
            this.waddleOffsetY = 0;
            this.rotation = 0;
        }

        // Jump handling
        if (inputManager.isJumpPressed() && !inputManager.getSpacePressed() && !this.isJumping) {
            this.isJumping = true;
            this.jumpTimer = 0;
            inputManager.setSpacePressed(true);
        } else if (!inputManager.isJumpPressed()) {
            inputManager.setSpacePressed(false);
        }

        if (this.isJumping) {
            this.updateJump(deltaMultiplier);
        }

        if (this.invincibilityTimer > 0) {
            this.invincibilityTimer -= deltaMultiplier;
        }

        return { moving: isMoving, direction: currentDirection };
    }

    public updateJump(deltaMultiplier: number): void {
        this.jumpTimer += 0.08 * deltaMultiplier;
        const jumpHeight = 12;
        const jumpDuration = 1.5;

        this.jumpOffset = Animation.calculateJumpOffset(this.jumpTimer, jumpDuration, jumpHeight);

        if (this.jumpTimer >= jumpDuration) {
            this.isJumping = false;
            this.jumpOffset = 0;
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        const isInvincible = this.invincibilityTimer > 0;
        const shouldDraw = !isInvincible || Math.floor(this.invincibilityTimer / 5) % 2 === 0;

        if (!shouldDraw || this.pixels.length === 0) return;

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

    getIsJumping(): boolean {
        return this.isJumping;
    }

    startJump(): void {
        this.isJumping = true;
        this.jumpTimer = 0;
    }

    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    reset(): void {
        this.x = 60;
        this.y = 80;
        this.waddleOffsetX = 0;
        this.waddleOffsetY = 0;
        this.waddleTimer = 0;
        this.rotation = 0;
        this.jumpOffset = 0;
        this.isJumping = false;
        this.jumpTimer = 0;
        this.invincibilityTimer = 0;
    }

    applySlowdown(speed: number, direction: Direction, deltaMultiplier: number): void {
        const slowdownFactor = 0.5 * deltaMultiplier * speed;
        if (direction === 'up') {
            this.y += slowdownFactor;
        } else if (direction === 'down') {
            this.y -= slowdownFactor;
        } else if (direction === 'left') {
            this.x += slowdownFactor;
        } else if (direction === 'right') {
            this.x -= slowdownFactor;
        }
    }

    bounceBack(spriteHeight: number): void {
        const bounceDistance = 6;
        this.y = Math.min(PICO8.SCREEN_HEIGHT - spriteHeight, this.y + bounceDistance);
    }

    setInvincibility(frames: number): void {
        this.invincibilityTimer = frames;
    }

    isInvincible(): boolean {
        return this.invincibilityTimer > 0;
    }

    getLastDirection(): 'left' | 'right' {
        return this.lastDirection;
    }

    public updateWaddleAnimation(direction: Direction, deltaMultiplier: number): void {
        this.waddleTimer += 0.5 * deltaMultiplier;
        const waddle = Animation.calculateWaddleOffset(this.waddleTimer, direction, this.lastDirection);
        this.waddleOffsetX = waddle.offsetX;
        this.waddleOffsetY = waddle.offsetY;
        this.rotation = waddle.rotation;
        
        if (direction === 'left') this.lastDirection = 'left';
        if (direction === 'right') this.lastDirection = 'right';
    }
}

