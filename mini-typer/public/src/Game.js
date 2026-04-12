import { WordManager } from './WordManager.js';
import { Renderer } from './Renderer.js';
import { Input } from './Input.js';

export class Game {
    constructor() {
        this.renderer = new Renderer(document.getElementById('game-canvas'));
        this.input = new Input();
        this.wordManager = new WordManager(this.renderer.width, this.renderer.height);

        this.scoreElement = document.getElementById('score');
        this.bestElement = document.getElementById('best');
        this.gameOverOverlay = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.restartBtn = document.getElementById('restart-btn');

        this.restartBtn.onclick = () => this.reset();
        this.input.onCharTyped = (char) => this.handleTyping(char);

        this.best = parseInt(localStorage.getItem('typer-best')) || 0;
        this.reset();
        this.gameLoop();
    }

    reset() {
        this.wordManager.reset();
        this.score = 0;
        this.isGameOver = false;
        this.gameOverOverlay.classList.add('hidden');
        this.updateUI();
    }

    handleTyping(char) {
        if (this.isGameOver) return;
        
        const scoreChange = this.wordManager.handleInput(char);
        this.score += scoreChange;
        if (this.score < 0) this.score = 0;
        this.updateUI();
    }

    update() {
        if (this.isGameOver) return;

        const isDead = this.wordManager.update(this.score);
        if (isDead) {
            this.endGame();
        }
    }

    endGame() {
        this.isGameOver = true;
        if (this.score > this.best) {
            this.best = this.score;
            localStorage.setItem('typer-best', this.best);
        }
        this.finalScoreElement.innerText = this.score;
        this.gameOverOverlay.classList.remove('hidden');
    }

    updateUI() {
        this.scoreElement.innerText = this.score;
        this.bestElement.innerText = this.best;
    }

    gameLoop() {
        this.update();
        this.renderer.draw(this.wordManager);
        requestAnimationFrame(() => this.gameLoop());
    }
}
