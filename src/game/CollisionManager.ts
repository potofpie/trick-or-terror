import { BaseEnemy } from '../entities/enemies/BaseEnemy';
import { Pumpkin } from '../objects/Pumpkin';

export class CollisionManager {
    checkPumpkinCollision(
        x: number,
        y: number,
        width: number,
        height: number,
        pumpkins: Pumpkin[]
    ): Pumpkin | null {
        for (const pumpkin of pumpkins) {
            if (pumpkin.checkCollision(x, y, width, height)) {
                return pumpkin;
            }
        }
        return null;
    }

    checkEnemyCollision(
        x: number,
        y: number,
        width: number,
        height: number,
        enemies: BaseEnemy[]
    ): boolean {
        for (const enemy of enemies) {
            if (enemy.checkCollision(x, y, width, height)) {
                return true;
            }
        }
        return false;
    }

    checkEnemyCollisionWithType(
        x: number,
        y: number,
        width: number,
        height: number,
        enemies: BaseEnemy[]
    ): BaseEnemy | null {
        for (const enemy of enemies) {
            if (enemy.checkCollision(x, y, width, height)) {
                return enemy;
            }
        }
        return null;
    }

    checkCollision(
        x: number,
        y: number,
        width: number,
        height: number,
        isJumping: boolean,
        pumpkins: Pumpkin[],
        enemies: BaseEnemy[]
    ): boolean {
        // Only check pumpkin collisions when NOT jumping (pumpkins explode when run into, not when jumped over)
        if (!isJumping) {
            const pumpkinHit = this.checkPumpkinCollision(x, y, width, height, pumpkins);
            if (pumpkinHit) {
                return true;
            }
        }

        // Enemy collision logic
        if (isJumping) {
            if (y < 20) {
                return this.checkEnemyCollision(x, y, width, height, enemies);
            }
            return false;
        }

        return this.checkEnemyCollision(x, y, width, height, enemies);
    }
}

