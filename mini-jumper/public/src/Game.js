import { Player } from './Player.js';
import { PlatformManager } from './Platform.js';
import { Renderer } from './Renderer.js';
import { Input } from './Input.js';

export class Game {
    constructor() {
        this.renderer = new Renderer(document.getElementById('game-canvas'));
        this.input = new Input();
        this.player = new Player(this.renderer.width, this.renderer.height);
        this.platformManager = new PlatformManager(this.renderer.width, this.renderer.height);

        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.gameOverOverlay = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.restartBtn = document.getElementById('restart-btn');

        this.restartBtn.onclick = () => this.reset();

        this.highScore = parseInt(localStorage.getItem('jumper-highscore')) || 0;
        this.reset();
        this.gameLoop();
    }

    reset() {
        this.player.reset();
        this.platformManager.reset();
        this.cameraY = 0;
        this.score = 0;
        this.isGameOver = false;
        this.gameOverOverlay.classList.add('hidden');
        this.updateUI();
    }

    update() {
        if (this.isGameOver) return;

        this.player.update(this.input);

        // カメラの追従
        const playerTop = this.player.y - this.cameraY;
        if (playerTop < this.renderer.height / 2) {
            const diff = (this.renderer.height / 2) - playerTop;
            this.cameraY -= diff;
            this.score = Math.max(this.score, Math.floor(-this.cameraY / 10));
        }

        // 足場の当たり判定
        if (this.player.vy > 0) { // 落下中のみ
            for (const p of this.platformManager.platforms) {
                if (this.player.x + this.player.width * 0.8 > p.x &&
                    this.player.x + this.player.width * 0.2 < p.x + p.width &&
                    this.player.y + this.player.height > p.y &&
                    this.player.y + this.player.height < p.y + p.height + this.player.vy) {
                    
                    this.player.y = p.y - this.player.height;
                    this.player.jump();
                    break;
                }
            }
        }

        this.platformManager.update(this.cameraY);
        this.updateUI();

        // ゲームオーバー判定
        if (this.player.y > this.cameraY + this.renderer.height + 200) {
            this.endGame();
        }
    }

    endGame() {
        this.isGameOver = true;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('jumper-highscore', this.highScore);
        }
        this.finalScoreElement.innerText = this.score;
        this.gameOverOverlay.classList.remove('hidden');
    }

    updateUI() {
        this.scoreElement.innerText = this.score;
        this.highScoreElement.innerText = this.highScore;
    }

    gameLoop() {
        this.update();
        this.renderer.draw(this.player, this.platformManager, this.cameraY);
        requestAnimationFrame(() => this.gameLoop());
    }
}
