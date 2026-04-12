import { Car } from './Car.js';
import { ObstacleManager } from './Obstacle.js';
import { Renderer } from './Renderer.js';
import { Input } from './Input.js';

export class Game {
    constructor() {
        this.renderer = new Renderer(document.getElementById('game-canvas'));
        this.input = new Input();
        this.car = new Car(this.renderer.width, this.renderer.height);
        this.obstacleManager = new ObstacleManager(this.renderer.width, this.renderer.height);

        this.speedElement = document.getElementById('speed');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.gameOverOverlay = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.restartBtn = document.getElementById('restart-btn');

        this.restartBtn.onclick = () => this.reset();

        this.highScore = parseInt(localStorage.getItem('racer-highscore')) || 0;
        this.reset();
        this.gameLoop();
    }

    reset() {
        this.car.reset();
        this.obstacleManager.reset();
        this.distance = 0;
        this.isGameOver = false;
        this.gameOverOverlay.classList.add('hidden');
        this.updateUI();
    }

    update() {
        if (this.isGameOver) return;

        this.car.update(this.input);
        this.obstacleManager.update(this.car.speed);

        // 走行距離の加算
        if (this.car.speed > 0) {
            this.distance += this.car.speed / 10;
        }

        // 当たり判定
        for (const o of this.obstacleManager.obstacles) {
            if (this.checkCollision(this.car, o)) {
                this.endGame();
                break;
            }
        }

        this.updateUI();
    }

    checkCollision(car, obstacle) {
        // 簡易的な矩形判定
        // 回転を考慮すると複雑になるため、少し内側の矩形で判定
        const margin = 5;
        return (
            car.x + margin < obstacle.x + obstacle.width - margin &&
            car.x + car.width - margin > obstacle.x + margin &&
            car.y + margin < obstacle.y + obstacle.height - margin &&
            car.y + car.height - margin > obstacle.y + margin
        );
    }

    endGame() {
        this.isGameOver = true;
        const finalDist = Math.floor(this.distance);
        if (finalDist > this.highScore) {
            this.highScore = finalDist;
            localStorage.setItem('racer-highscore', this.highScore);
        }
        this.finalScoreElement.innerText = finalDist;
        this.gameOverOverlay.classList.remove('hidden');
    }

    updateUI() {
        this.speedElement.innerText = Math.floor(this.car.speed * 20); // KM/Hっぽく見せる
        this.scoreElement.innerText = Math.floor(this.distance);
        this.highScoreElement.innerText = this.highScore;
    }

    gameLoop() {
        this.update();
        this.renderer.draw(this.car, this.obstacleManager);
        requestAnimationFrame(() => this.gameLoop());
    }
}
