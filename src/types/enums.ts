export enum GameState {
    SHOWING_CONTROLS,
    PLAYING,
    PAUSED,
    GAME_OVER
}

export enum EnemyType {
    ZOMBIE = 'zombie',
    SKELETON = 'skeleton'
}

export enum IntroPhase {
    WAITING = 'waiting',
    WALKING_TO_START = 'walking-to-start',
    ALL_JUMP = 'all-jump',
    ZOMBIES_ENTERING = 'zombies-entering',
    ROAD_STARTING = 'road-starting',
    COMPLETE = 'complete'
}

export enum BloodSplatterState {
    INITIAL = 'initial',
    DIM = 'dim',
    FADING = 'fading'
}

export enum BloodCorner {
    TOP_LEFT = 'top-left',
    TOP_RIGHT = 'top-right',
    BOTTOM_LEFT = 'bottom-left',
    BOTTOM_RIGHT = 'bottom-right'
}

