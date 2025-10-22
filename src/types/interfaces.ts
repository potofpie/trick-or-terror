import { EnemyType, BloodSplatterState, BloodCorner } from './enums';

export interface Pixel {
    x: number;
    y: number;
    color: string;
}

export interface IUpdateable {
    update(deltaMultiplier: number): void;
}

export interface IRenderable {
    render(ctx: CanvasRenderingContext2D): void;
}

export interface Position {
    x: number;
    y: number;
}

export interface Velocity {
    vx: number;
    vy: number;
}

export interface EnemyData {
    x: number;
    y: number;
    sprite: Pixel[];
    waddleTimer: number;
    waddleOffsetX: number;
    waddleOffsetY: number;
    rotation?: number;
    facingLeft: boolean;
    isAttacking?: boolean;
    type: EnemyType;
    boneShootTimer?: number;
    hasShot?: boolean;
}

export interface BoneData {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
}

export interface PumpkinData {
    x: number;
    y: number;
    isSmashed: boolean;
}

export interface BushData {
    x: number;
    y: number;
}

export interface CandyData {
    x: number;
    y: number;
    rotation: number;
}

export interface HeartData {
    x: number;
    y: number;
    rotation: number;
}

export interface JawbreakerData {
    x: number;
    y: number;
    rotation: number;
    scale: number;
    isOrbiting: boolean;
}

export interface OrbitalJawbreaker {
    jawbreaker: JawbreakerData;
    angle: number;
    distance: number;
    orbitSpeed: number;
}

export interface BloodSplatter {
    opacity: number;
    fadeTimer: number;
    corner: BloodCorner;
    state: BloodSplatterState;
}

export interface SparkleParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
}

export interface GameSettings {
    enableScanlines: boolean;
    enableRGBSeparation: boolean;
    glowIntensity: number;
    vignetteIntensity: number;
    fisheyeIntensity: number;
    tvOpacity: number;
    highScore: number;
}

