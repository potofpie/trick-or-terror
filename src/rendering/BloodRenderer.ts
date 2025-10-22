import { BloodSplatter } from '../types/interfaces';
import { BloodSplatterState, BloodCorner } from '../types/enums';
import { PICO8 } from '../constraints/PICO8Constraints';

export class BloodRenderer {
    private bloodSplatters: BloodSplatter[] = [];
    private bloodImages: Map<BloodCorner, HTMLImageElement> = new Map();

    constructor(
        bloodTopLeftImage: HTMLImageElement,
        bloodTopRightImage: HTMLImageElement,
        bloodBottomLeftImage: HTMLImageElement,
        bloodBottomRightImage: HTMLImageElement
    ) {
        this.bloodImages.set(BloodCorner.TOP_LEFT, bloodTopLeftImage);
        this.bloodImages.set(BloodCorner.TOP_RIGHT, bloodTopRightImage);
        this.bloodImages.set(BloodCorner.BOTTOM_LEFT, bloodBottomLeftImage);
        this.bloodImages.set(BloodCorner.BOTTOM_RIGHT, bloodBottomRightImage);
    }

    update(deltaMultiplier: number): void {
        for (let i = this.bloodSplatters.length - 1; i >= 0; i--) {
            const splatter = this.bloodSplatters[i];

            if (splatter.state === BloodSplatterState.INITIAL && splatter.fadeTimer > 0) {
                splatter.fadeTimer -= deltaMultiplier;
                const fadeProgress = Math.max(0, splatter.fadeTimer / 120);
                splatter.opacity = 0.3 + (fadeProgress * 0.4);

                if (splatter.fadeTimer <= 0) {
                    splatter.state = BloodSplatterState.DIM;
                    splatter.opacity = 0.3;
                    splatter.fadeTimer = 0;
                }
            } else if (splatter.state === BloodSplatterState.FADING && splatter.fadeTimer > 0) {
                splatter.fadeTimer -= deltaMultiplier;
                const fadeProgress = Math.max(0, splatter.fadeTimer / 60);
                splatter.opacity = fadeProgress * 0.3;

                if (splatter.opacity <= 0.01) {
                    this.bloodSplatters.splice(i, 1);
                }
            }
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        for (const splatter of this.bloodSplatters) {
            const img = this.bloodImages.get(splatter.corner);
            if (!img) continue;

            ctx.save();
            ctx.globalAlpha = splatter.opacity;

            let x = 0, y = 0;
            if (splatter.corner === BloodCorner.TOP_LEFT) {
                x = 0;
                y = 0;
            } else if (splatter.corner === BloodCorner.TOP_RIGHT) {
                x = PICO8.SCREEN_WIDTH / 2;
                y = 0;
            } else if (splatter.corner === BloodCorner.BOTTOM_LEFT) {
                x = 0;
                y = PICO8.SCREEN_HEIGHT / 2;
            } else if (splatter.corner === BloodCorner.BOTTOM_RIGHT) {
                x = PICO8.SCREEN_WIDTH / 2;
                y = PICO8.SCREEN_HEIGHT / 2;
            }

            ctx.drawImage(img, x, y, PICO8.SCREEN_WIDTH / 2 + 16, PICO8.SCREEN_HEIGHT / 2 + 16);
            ctx.restore();
        }
    }

    addSplatter(): void {
        const allCorners: BloodCorner[] = [
            BloodCorner.TOP_LEFT,
            BloodCorner.TOP_RIGHT,
            BloodCorner.BOTTOM_LEFT,
            BloodCorner.BOTTOM_RIGHT
        ];
        const usedCorners = this.bloodSplatters.map(s => s.corner);
        const availableCorners = allCorners.filter(corner => !usedCorners.includes(corner));

        const cornersToChooseFrom = availableCorners.length > 0 ? availableCorners : allCorners;
        const randomCorner = cornersToChooseFrom[Math.floor(Math.random() * cornersToChooseFrom.length)];

        this.bloodSplatters.push({
            opacity: 0.7,
            fadeTimer: 120,
            corner: randomCorner,
            state: BloodSplatterState.INITIAL
        });
    }

    fadeOldestBlood(): boolean {
        const dimSplatter = this.bloodSplatters.find(s => s.state === BloodSplatterState.DIM);
        if (dimSplatter) {
            dimSplatter.state = BloodSplatterState.FADING;
            dimSplatter.opacity = 0.3;
            dimSplatter.fadeTimer = 60;
            return true;
        }
        return false;
    }

    clear(): void {
        this.bloodSplatters = [];
    }
}

