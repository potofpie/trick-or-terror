import { Game } from './Game';

// Initialize and start the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing game...');
    try {
        const game = new Game();
        console.log('Game instance created successfully');
        game.start();
        console.log('Game started successfully');
    } catch (error) {
        console.error('Error initializing game:', error);
    }
});
