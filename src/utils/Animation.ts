export class Animation {
    static calculateWaddleOffset(
        waddleTimer: number,
        direction: 'left' | 'right' | 'up' | 'down' | '',
        lastDirection: 'left' | 'right'
    ): { offsetX: number; offsetY: number; rotation: number } {
        if (direction === 'left') {
            return {
                offsetX: 0,
                offsetY: Math.cos(waddleTimer * 0.7) * 0.5,
                rotation: Math.sin(waddleTimer * 1.2) * 0.1
            };
        } else if (direction === 'right') {
            return {
                offsetX: 0,
                offsetY: Math.cos(waddleTimer * 0.7) * 0.5,
                rotation: Math.sin(waddleTimer * 1.2) * -0.1
            };
        } else if (direction === 'up' || direction === 'down') {
            if (lastDirection === 'left') {
                return {
                    offsetX: Math.sin(waddleTimer * 0.5) * 1.0,
                    offsetY: 0,
                    rotation: Math.sin(waddleTimer * 0.8) * 0.05
                };
            } else {
                return {
                    offsetX: Math.sin(waddleTimer * 0.5 + Math.PI) * 1.0,
                    offsetY: 0,
                    rotation: Math.sin(waddleTimer * 0.8) * -0.05
                };
            }
        }
        
        return { offsetX: 0, offsetY: 0, rotation: 0 };
    }

    static calculateJumpOffset(jumpTimer: number, jumpDuration: number, jumpHeight: number): number {
        const t = jumpTimer / jumpDuration;
        if (t <= 1) {
            return 4 * t * (1 - t) * jumpHeight;
        }
        return 0;
    }

    static calculateEnemyWaddle(waddleTimer: number): { offsetX: number; offsetY: number } {
        return {
            offsetX: Math.sin(waddleTimer * 0.5) * 1.0,
            offsetY: Math.cos(waddleTimer * 0.7) * 0.5
        };
    }
}

