import { Game } from './src/game.js';

window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    const game = new Game(canvas, ctx);
    game.start();

    document.getElementById('resetBtn').addEventListener('click', () => {
        game.reset();
    });
});
