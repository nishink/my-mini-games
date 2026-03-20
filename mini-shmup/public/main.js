import { Game } from './src/game.js';

window.addEventListener('load', () => {
    const canvas = document.getElementById('game-canvas');
    const scoreBoard = document.getElementById('score-board');
    const hpVal = document.getElementById('hp-val');
    const gameOverScreen = document.getElementById('game-over');
    const finalScore = document.getElementById('final-score');
    const restartBtn = document.getElementById('restart-btn');

    // キャンバスサイズの設定（縦長）
    canvas.width = 400;
    canvas.height = 600;

    const game = new Game(canvas, {
        scoreBoard,
        hpVal,
        gameOverScreen,
        finalScore
    });

    restartBtn.addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        game.start();
    });

    game.start();
});
