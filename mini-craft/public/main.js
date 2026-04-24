import { Game } from './src/game/Game.js';

window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Resize handler
    const resize = () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const game = new Game(canvas, ctx);
    game.start();

    // HUD and UI events
    document.getElementById('resetBtn').addEventListener('click', () => {
        if(confirm('全てのブロックを消去しますか？')) {
            game.reset();
        }
    });

    document.getElementById('buildModeBtn').addEventListener('click', () => {
        game.setMode('build');
    });

    document.getElementById('deleteModeBtn').addEventListener('click', () => {
        game.setMode('delete');
    });

    // Keyboard support
    window.addEventListener('keydown', (e) => {
        if (e.key >= '1' && e.key <= '9') {
            game.selectBlock(parseInt(e.key) - 1);
        }
        if (e.key === 'Shift') {
            game.setMode('delete');
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'Shift') {
            game.setMode('build');
        }
    });
});
