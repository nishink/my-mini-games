import { Game } from './src/game/Game.js';

window.addEventListener('load', () => {
    const canvas = document.getElementById('game-canvas');
    const ui = {
        stageVal: document.getElementById('stage-val'),
        stageTotal: document.getElementById('stage-total'),
        levelClear: document.getElementById('level-clear'),
        gameComplete: document.getElementById('game-complete'),
        nextBtn: document.getElementById('next-btn'),
        restartBtn: document.getElementById('restart-btn')
    };

    const game = new Game(canvas, ui);

    ui.nextBtn.addEventListener('click', () => {
        ui.levelClear.classList.add('hidden');
        game.nextLevel();
    });

    ui.restartBtn.addEventListener('click', () => {
        ui.gameComplete.classList.add('hidden');
        game.restart();
    });

    game.start();
});
