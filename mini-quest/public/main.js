import { Game } from './src/game/Game.js';

window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const game = new Game(canvas, ctx);
    game.start();

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', () => {
        game.reset();
    });

    // Touch controls
    const buttons = document.querySelectorAll('.ctrl-btn');
    buttons.forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const action = btn.getAttribute('data-action');
            game.handleInput(action, true);
        });
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            const action = btn.getAttribute('data-action');
            game.handleInput(action, false);
        });
        // Mouse support for desktop testing of touch buttons
        btn.addEventListener('mousedown', () => {
            const action = btn.getAttribute('data-action');
            game.handleInput(action, true);
        });
        btn.addEventListener('mouseup', () => {
            const action = btn.getAttribute('data-action');
            game.handleInput(action, false);
        });
        btn.addEventListener('mouseleave', () => {
            const action = btn.getAttribute('data-action');
            game.handleInput(action, false);
        });
    });

    // Keyboard support
    window.addEventListener('keydown', (e) => {
        let action;
        switch(e.key) {
            case 'ArrowUp': action = 'up'; break;
            case 'ArrowDown': action = 'down'; break;
            case 'ArrowLeft': action = 'left'; break;
            case 'ArrowRight': action = 'right'; break;
            case 'z':
            case 'Z':
            case ' ':
            case 'Enter': action = 'action'; break;
        }
        if (action) {
            game.handleInput(action, true);
        }
    });

    window.addEventListener('keyup', (e) => {
        let action;
        switch(e.key) {
            case 'ArrowUp': action = 'up'; break;
            case 'ArrowDown': action = 'down'; break;
            case 'ArrowLeft': action = 'left'; break;
            case 'ArrowRight': action = 'right'; break;
            case 'z':
            case 'Z':
            case ' ':
            case 'Enter': action = 'action'; break;
        }
        if (action) {
            game.handleInput(action, false);
        }
    });
});
