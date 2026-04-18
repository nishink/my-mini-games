import { Grid } from './Grid.js';

export class Game {
    constructor() {
        this.grid = new Grid(4);
        this.score = 0;
        this.best = parseInt(localStorage.getItem('2048-best')) || 0;
        this.isGameOver = false;

        this.scoreElement = document.getElementById('score');
        this.bestElement = document.getElementById('best');
        this.gameOverOverlay = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.restartBtn = document.getElementById('restart-btn');

        this.restartBtn.onclick = () => this.reset();
        
        // Keyboard Input
        window.addEventListener('keydown', (e) => this.handleInput(e));

        // Touch Input (Swipe)
        this.touchStartX = 0;
        this.touchStartY = 0;
        window.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }, { passive: false });

        window.addEventListener('touchend', (e) => {
            if (this.isGameOver) return;
            
            const dx = e.changedTouches[0].clientX - this.touchStartX;
            const dy = e.changedTouches[0].clientY - this.touchStartY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            if (Math.max(absDx, absDy) > 30) {
                let direction = null;
                if (absDx > absDy) {
                    direction = dx > 0 ? 'Right' : 'Left';
                } else {
                    direction = dy > 0 ? 'Down' : 'Up';
                }
                if (direction) this.executeMove(direction);
            }
        }, { passive: false });

        // Resize support
        window.addEventListener('resize', () => {
            this.grid.cells.flat().forEach(tile => {
                if (tile) tile.updatePosition();
            });
        });

        this.reset();
    }

    reset() {
        this.grid.reset();
        this.score = 0;
        this.isGameOver = false;
        this.gameOverOverlay.classList.add('hidden');
        
        this.grid.addRandomTile();
        this.grid.addRandomTile();
        
        this.updateUI();
    }

    handleInput(e) {
        if (this.isGameOver) return;

        let direction = null;
        switch (e.key) {
            case 'ArrowUp': case 'w': case 'W': direction = 'Up'; break;
            case 'ArrowDown': case 's': case 'S': direction = 'Down'; break;
            case 'ArrowLeft': case 'a': case 'A': direction = 'Left'; break;
            case 'ArrowRight': case 'd': case 'D': direction = 'Right'; break;
        }

        if (direction) {
            e.preventDefault();
            this.executeMove(direction);
        }
    }

    executeMove(direction) {
        const result = this.grid.move(direction);
        if (result.moved) {
            this.score += result.score;
            this.grid.addRandomTile();
            this.updateUI();

            if (!this.grid.movesAvailable()) {
                this.endGame();
            }
        }
    }

    endGame() {
        this.isGameOver = true;
        if (this.score > this.best) {
            this.best = this.score;
            localStorage.setItem('2048-best', this.best);
        }
        this.finalScoreElement.innerText = this.score;
        this.gameOverOverlay.classList.remove('hidden');
    }

    updateUI() {
        this.scoreElement.innerText = this.score;
        this.bestElement.innerText = this.best;
    }
}
