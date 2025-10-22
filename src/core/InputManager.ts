import { Keys } from '../types/types';

export class InputManager {
    private keys: Keys = {};
    private spacePressed: boolean = false;

    constructor() {
        this.setupListeners();
    }

    private setupListeners(): void {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    isKeyDown(code: string): boolean {
        return this.keys[code] || false;
    }

    isMovingLeft(): boolean {
        return this.keys['ArrowLeft'] || this.keys['KeyA'];
    }

    isMovingRight(): boolean {
        return this.keys['ArrowRight'] || this.keys['KeyD'];
    }

    isMovingUp(): boolean {
        return this.keys['ArrowUp'] || this.keys['KeyW'];
    }

    isMovingDown(): boolean {
        return this.keys['ArrowDown'] || this.keys['KeyS'];
    }

    isJumpPressed(): boolean {
        return this.keys['Space'] || false;
    }

    getSpacePressed(): boolean {
        return this.spacePressed;
    }

    setSpacePressed(value: boolean): void {
        this.spacePressed = value;
    }

    getKeys(): Keys {
        return this.keys;
    }
}

