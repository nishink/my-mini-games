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
        window.addEventListener('keydown', (e) => this.handleInput(e));

        this.reset();
    }

    reset() {
        this.grid.reset();
        this.score = 0;
        this.isGameOver = false;
        this.gameOverOverlay.classList.add('hidden');
        
        // 最初に2枚タイルを出す
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
