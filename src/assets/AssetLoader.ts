import { Pixel } from '../types/interfaces';
import { SpriteConverter } from '../utils/SpriteConverter';
import { PICO8 } from '../constraints/PICO8Constraints';

import zombieSprite from './sprites/characters/zombie_man_8x8.png';
import spaceManSprite from './sprites/characters/space_man_8x8.png';
import skeletonSprite from './sprites/characters/skeloton.png';
import princessSprite from './sprites/characters/princess.png';
import pirateSprite from './sprites/characters/pirate.png';
import boneSprite from './sprites/objects/bone.png';
import pumpkinSprite from './sprites/objects/pumpkin.png';
import smashedPumpkinSprite from './sprites/objects/smashed-pumpkin.png';
import streetImage from './sprites/backgrounds/street.png';
import candyCornSprite from './sprites/objects/candy_corn.png';
import bushSprite from './sprites/objects/bush.png';
import heartSprite from './sprites/objects/heart.png';
import jawbreakerSprite from './sprites/objects/jawbreaker.png';
import bloodTopLeftImage from './sprites/ui/blood_top_left.png';
import bloodTopRightImage from './sprites/ui/blood_right_top.png';
import bloodBottomLeftImage from './sprites/ui/blood_bottom_left.png';
import bloodBottomRightImage from './sprites/ui/blood_bottom_right.png';
import controlsImage from './sprites/ui/controls.png';
import titleImage from './sprites/ui/title.png';
import tvImage from './sprites/backgrounds/tv_croped.png';

export interface LoadedAssets {
    playerPixels: Pixel[];
    zombiePixels: Pixel[];
    skeletonPixels: Pixel[];
    princessPixels: Pixel[];
    piratePixels: Pixel[];
    bonePixels: Pixel[];
    pumpkinPixels: Pixel[];
    smashedPumpkinPixels: Pixel[];
    streetPixels: Pixel[];
    candyPixels: Pixel[];
    heartPixels: Pixel[];
    jawbreakerPixels: Pixel[];
    bushPixels: Pixel[];
    bloodTopLeftImage: HTMLImageElement;
    bloodTopRightImage: HTMLImageElement;
    bloodBottomLeftImage: HTMLImageElement;
    bloodBottomRightImage: HTMLImageElement;
    controlsImg: HTMLImageElement;
    titleImg: HTMLImageElement;
}

export class AssetLoader {
    private assetsToLoad: number = 20; // 20 image assets (intro sounds counted separately)
    private assetsLoadedCount: number = 0;
    private onProgress: (loaded: number, total: number) => void;
    private onComplete: (assets: LoadedAssets) => void;
    private onTVLoaded?: () => void;
    private assets: Partial<LoadedAssets> = {};

    constructor(
        onProgress: (loaded: number, total: number) => void,
        onComplete: (assets: LoadedAssets) => void,
        onTVLoaded?: () => void
    ) {
        this.onProgress = onProgress;
        this.onComplete = onComplete;
        this.onTVLoaded = onTVLoaded;
    }

    load(): void {
        this.loadPlayerSprite();
        this.loadZombieSprite();
        this.loadSkeletonSprite();
        this.loadPrincessSprite();
        this.loadPirateSprite();
        this.loadBoneSprite();
        this.loadPumpkinSprite();
        this.loadSmashedPumpkinSprite();
        this.loadStreetBackground();
        this.loadCandySprite();
        this.loadHeartSprite();
        this.loadJawbreakerSprite();
        this.loadBushSprite();
        this.loadBloodImages();
        this.loadControlsImage();
        this.loadTitleImage();
        this.loadTVBackground();
    }

    private assetLoaded(): void {
        this.assetsLoadedCount++;
        this.onProgress(this.assetsLoadedCount, this.assetsToLoad);
        console.log(`Asset loaded: ${this.assetsLoadedCount}/${this.assetsToLoad}`);

        if (this.assetsLoadedCount >= this.assetsToLoad) {
            console.log('All assets loaded! Calling onComplete...');
            this.onComplete(this.assets as LoadedAssets);
        }
    }

    private loadPlayerSprite(): void {
        const img = new Image();
        img.src = spaceManSprite;
        img.onload = () => {
            this.assets.playerPixels = SpriteConverter.convertImageToPixels(img, 8, 8);
            this.assetLoaded();
        };
        img.onerror = () => {
            console.error('Failed to load player sprite');
            this.assetLoaded();
        };
    }

    private loadZombieSprite(): void {
        const img = new Image();
        img.src = zombieSprite;
        img.onload = () => {
            this.assets.zombiePixels = SpriteConverter.convertImageToPixels(img, 8, 8);
            this.assetLoaded();
        };
        img.onerror = () => {
            console.error('Failed to load zombie sprite');
            this.assetLoaded();
        };
    }

    private loadSkeletonSprite(): void {
        const img = new Image();
        img.src = skeletonSprite;
        img.onload = () => {
            this.assets.skeletonPixels = SpriteConverter.convertImageToPixels(img, 8, 8);
            this.assetLoaded();
        };
        img.onerror = () => {
            console.error('Failed to load skeleton sprite');
            this.assetLoaded();
        };
    }

    private loadPrincessSprite(): void {
        const img = new Image();
        img.src = princessSprite;
        img.onload = () => {
            this.assets.princessPixels = SpriteConverter.convertImageToPixels(img, 8, 8);
            this.assetLoaded();
        };
        img.onerror = () => {
            console.error('Failed to load princess sprite');
            this.assetLoaded();
        };
    }

    private loadPirateSprite(): void {
        const img = new Image();
        img.src = pirateSprite;
        img.onload = () => {
            this.assets.piratePixels = SpriteConverter.convertImageToPixels(img, 8, 8);
            this.assetLoaded();
        };
        img.onerror = () => {
            console.error('Failed to load pirate sprite');
            this.assetLoaded();
        };
    }

    private loadBoneSprite(): void {
        const img = new Image();
        img.src = boneSprite;
        img.onload = () => {
            this.assets.bonePixels = SpriteConverter.convertImageToPixels(img, 8, 8);
            this.assetLoaded();
        };
        img.onerror = () => {
            console.error('Failed to load bone sprite');
            this.assetLoaded();
        };
    }

    private loadPumpkinSprite(): void {
        const img = new Image();
        img.src = pumpkinSprite;
        img.onload = () => {
            this.assets.pumpkinPixels = SpriteConverter.convertImageToPixels(img, 8, 8);
            this.assetLoaded();
        };
        img.onerror = () => {
            console.error('Failed to load pumpkin sprite');
            this.assetLoaded();
        };
    }

    private loadSmashedPumpkinSprite(): void {
        const img = new Image();
        img.src = smashedPumpkinSprite;
        img.onload = () => {
            this.assets.smashedPumpkinPixels = SpriteConverter.convertImageToPixels(img, 8, 8);
            this.assetLoaded();
        };
        img.onerror = () => {
            console.error('Failed to load smashed pumpkin sprite');
            this.assetLoaded();
        };
    }

    private loadStreetBackground(): void {
        const img = new Image();
        img.src = streetImage;
        img.onload = () => {
            this.assets.streetPixels = SpriteConverter.convertBackgroundToPixels(
                img,
                PICO8.SCREEN_WIDTH,
                PICO8.SCREEN_HEIGHT
            );
            this.assetLoaded();
        };
        img.onerror = () => {
            console.error('Failed to load street background');
            this.assetLoaded();
        };
    }

    private loadCandySprite(): void {
        const img = new Image();
        img.src = candyCornSprite;
        img.onload = () => {
            this.assets.candyPixels = SpriteConverter.convertImageToPixels(img, 8, 8);
            this.assetLoaded();
        };
        img.onerror = () => {
            console.error('Failed to load candy sprite');
            this.assetLoaded();
        };
    }

    private loadHeartSprite(): void {
        const img = new Image();
        img.src = heartSprite;
        img.onload = () => {
            this.assets.heartPixels = SpriteConverter.convertImageToPixels(img, 8, 8);
            this.assetLoaded();
        };
        img.onerror = () => {
            console.error('Failed to load heart sprite');
            this.assetLoaded();
        };
    }

    private loadJawbreakerSprite(): void {
        const img = new Image();
        img.src = jawbreakerSprite;
        img.onload = () => {
            this.assets.jawbreakerPixels = SpriteConverter.convertImageToPixels(img, 8, 8);
            this.assetLoaded();
        };
        img.onerror = () => {
            console.error('Failed to load jawbreaker sprite');
            this.assetLoaded();
        };
    }

    private loadBushSprite(): void {
        const img = new Image();
        img.src = bushSprite;
        img.onload = () => {
            this.assets.bushPixels = SpriteConverter.convertImageToPixels(img, 8, 8);
            this.assetLoaded();
        };
        img.onerror = () => {
            console.error('Failed to load bush sprite');
            this.assetLoaded();
        };
    }

    private loadBloodImages(): void {
        const images = [
            { src: bloodTopLeftImage, key: 'bloodTopLeftImage' },
            { src: bloodTopRightImage, key: 'bloodTopRightImage' },
            { src: bloodBottomLeftImage, key: 'bloodBottomLeftImage' },
            { src: bloodBottomRightImage, key: 'bloodBottomRightImage' }
        ];

        images.forEach(({ src, key }) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                (this.assets as any)[key] = img;
                this.assetLoaded();
            };
            img.onerror = () => {
                console.error(`Failed to load ${key}`);
                this.assetLoaded();
            };
        });
    }

    private loadControlsImage(): void {
        const img = new Image();
        img.src = controlsImage;
        img.onload = () => {
            this.assets.controlsImg = img;
            this.assetLoaded();
        };
        img.onerror = () => {
            console.error('Failed to load controls image');
            this.assetLoaded();
        };
    }

    private loadTitleImage(): void {
        const img = new Image();
        img.src = titleImage;
        img.onload = () => {
            this.assets.titleImg = img;
            this.assetLoaded();
        };
        img.onerror = () => {
            console.error('Failed to load title image');
            this.assetLoaded();
        };
    }

    private loadTVBackground(): void {
        const tvImg = document.getElementById('tvBackground') as HTMLImageElement;
        tvImg.src = tvImage;
        tvImg.onload = () => {
            console.log('TV background loaded');
            if (this.onTVLoaded) this.onTVLoaded();
            this.assetLoaded();
        };
        tvImg.onerror = () => {
            console.error('Failed to load TV background');
            this.assetLoaded();
        };
    }
}

