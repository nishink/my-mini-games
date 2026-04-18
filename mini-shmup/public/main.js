import { Game } from './src/game.js';

window.addEventListener('load', () => {
    const canvas = document.getElementById('game-canvas');
    const scoreBoard = document.getElementById('score-board');
    const hpVal = document.getElementById('hp-val');
    const gameOverScreen = document.getElementById('game-over');
    const finalScore = document.getElementById('final-score');
    const restartBtn = document.getElementById('restart-btn');

    // 内部解像度の設定（固定してゲームバランスを維持）
    const INTERNAL_WIDTH = 400;
    const INTERNAL_HEIGHT = 600;
    canvas.width = INTERNAL_WIDTH;
    canvas.height = INTERNAL_HEIGHT;

    // 表示サイズのリサイズ処理
    function resizeCanvas() {
        const container = document.getElementById('game-container');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const containerAspect = containerWidth / containerHeight;
        const internalAspect = INTERNAL_WIDTH / INTERNAL_HEIGHT;
        
        if (containerAspect > internalAspect) {
            // 縦に合わせる
            canvas.style.height = '100%';
            canvas.style.width = 'auto';
        } else {
            // 横に合わせる
            canvas.style.width = '100%';
            canvas.style.height = 'auto';
        }
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

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
