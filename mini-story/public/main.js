import { Game } from './src/game/Game.js';

window.addEventListener('load', () => {
    const game = new Game();
    game.start();

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', () => {
        game.reset();
    });

    // Advance text with keyboard
    window.addEventListener('keydown', (e) => {
        if (e.key === 'z' || e.key === 'Z' || e.key === ' ' || e.key === 'Enter') {
            game.handleInput();
        }
    });

    // Advance text with click/tap on message box
    document.getElementById('msgBox').addEventListener('click', () => {
        game.handleInput();
    });
});
