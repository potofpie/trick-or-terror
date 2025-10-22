import { GameState } from '../types/enums';
import { GameSettings } from '../types/interfaces';

export class GameStateManager {
    private state: GameState = GameState.SHOWING_CONTROLS;
    private settings: GameSettings;

    constructor() {
        this.settings = this.loadSettings();
    }

    private loadSettings(): GameSettings {
        const saved = localStorage.getItem('gameSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                return {
                    enableScanlines: settings.enableScanlines ?? true,
                    enableRGBSeparation: settings.enableRGBSeparation ?? true,
                    glowIntensity: settings.glowIntensity ?? 0.99,
                    vignetteIntensity: settings.vignetteIntensity ?? 0.72,
                    fisheyeIntensity: settings.fisheyeIntensity ?? 0.60,
                    tvOpacity: settings.tvOpacity ?? 1.0,
                    highScore: settings.highScore ?? 0
                };
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        }
        
        return {
            enableScanlines: true,
            enableRGBSeparation: true,
            glowIntensity: 0.99,
            vignetteIntensity: 0.72,
            fisheyeIntensity: 0.60,
            tvOpacity: 1.0,
            highScore: 0
        };
    }

    saveSettings(): void {
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
    }

    getState(): GameState {
        return this.state;
    }

    setState(state: GameState): void {
        this.state = state;
    }

    getSettings(): GameSettings {
        return this.settings;
    }

    updateSetting<K extends keyof GameSettings>(key: K, value: GameSettings[K]): void {
        this.settings[key] = value;
        this.saveSettings();
    }
}

