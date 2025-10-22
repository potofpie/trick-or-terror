import { Pixel } from '../../types/interfaces';
import { EnemyType } from '../../types/enums';
import { BaseEnemy } from './BaseEnemy';

export class Skeleton extends BaseEnemy {
    private boneShootTimer: number;
    private hasShot: boolean = false;
    private onShoot?: (fromX: number, fromY: number, targetX: number, targetY: number) => void;

    constructor(
        x: number,
        y: number,
        sprite: Pixel[],
        facingLeft: boolean,
        isAttacking: boolean,
        onShoot?: (fromX: number, fromY: number, targetX: number, targetY: number) => void
    ) {
        super(x, y, sprite, EnemyType.SKELETON, facingLeft, isAttacking);
        this.boneShootTimer = Math.random() * 60; // Much faster initial shot
        this.onShoot = onShoot;
    }

    protected updateSpecific(deltaMultiplier: number, targetX: number, targetY: number): void {
        // Handle bone shooting
        this.boneShootTimer -= deltaMultiplier;

        if (this.boneShootTimer <= 0 && !this.hasShot && this.isOnScreen()) {
            this.hasShot = true;
            this.boneShootTimer = 60; // Much faster between shots
            
            // Trigger bone shooting
            if (this.onShoot) {
                this.onShoot(this.x, this.y, targetX, targetY);
            }
        }

        if (this.boneShootTimer <= 0) {
            this.boneShootTimer = 60 + Math.random() * 30; // Faster, more frequent shots
            this.hasShot = false;
        }
    }
}

