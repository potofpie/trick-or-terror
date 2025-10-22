import { GameSettings } from '../types/interfaces';

export class ScoreManager {
    private candyCount: number = 0;
    private lives: number = 3;
    private highScore: number = 0;

    constructor() {
        this.loadHighScore();
    }

    private loadHighScore(): void {
        const saved = localStorage.getItem('gameSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.highScore = settings.highScore ?? 0;
            } catch (e) {
                console.error('Failed to load high score:', e);
            }
        }
    }

    saveHighScore(): void {
        const saved = localStorage.getItem('gameSettings');
        let settings: Partial<GameSettings> = {};
        
        if (saved) {
            try {
                settings = JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse settings:', e);
            }
        }

        settings.highScore = this.highScore;
        localStorage.setItem('gameSettings', JSON.stringify(settings));
    }

    collectCandy(): void {
        this.candyCount++;
        this.updateCandyDisplay();
    }

    getCandyCount(): number {
        return this.candyCount;
    }

    getLives(): number {
        return this.lives;
    }

    takeDamage(): void {
        this.lives--;
        this.updateLivesDisplay();

        if (this.candyCount > this.highScore) {
            this.highScore = this.candyCount;
            this.saveHighScore();
        }
    }

    addLife(): void {
        this.lives = Math.min(3, this.lives + 1);
        this.updateLivesDisplay();
    }

    getHighScore(): number {
        return this.highScore;
    }

    reset(): void {
        this.lives = 3;
        this.candyCount = 0;
        this.updateLivesDisplay();
        this.updateCandyDisplay();
    }

    isGameOver(): boolean {
        return this.lives <= 0;
    }

    private updateLivesDisplay(): void {
        // Lives display removed - no longer updating HTML elements
    }

    private updateCandyDisplay(): void {
        // Candy display removed - no longer updating HTML elements
    }
}

