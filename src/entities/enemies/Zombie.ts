import { Pixel } from '../../types/interfaces';
import { EnemyType } from '../../types/enums';
import { BaseEnemy } from './BaseEnemy';

export class Zombie extends BaseEnemy {
    constructor(
        x: number,
        y: number,
        sprite: Pixel[],
        facingLeft: boolean,
        isAttacking: boolean
    ) {
        super(x, y, sprite, EnemyType.ZOMBIE, facingLeft, isAttacking);
    }

    protected updateSpecific(_deltaMultiplier: number, _targetX: number, _targetY: number): void {
        // Zombies have no special behavior beyond base movement and waddle
    }
}

