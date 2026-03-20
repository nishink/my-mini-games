import { Snake } from './snake.js';
import { Input } from './input.js';
import { Renderer } from './renderer.js';

export class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.gridSize = 20; // 20x20 grid
        this.cellSize = canvas.width / this.gridSize;
        
        this.input = new Input();
        this.snake = new Snake(this.gridSize);
        this.renderer = new Renderer(ctx, this.cellSize);
        
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.isGameOver = false;
        
        this.food = { x: 5, y: 5 };
        this.spawnFood();

        this.lastUpdateTime = 0;
        this.updateInterval = 150; // ms
        
        this.scoreElement = document.getElementById('scoreVal');
        this.highScoreElement = document.getElementById('highscoreVal');
        this.messageElement = document.getElementById('message');
        
        this.highScoreElement.textContent = this.highScore;
    }

    spawnFood() {
        let newFood;
        while (true) {
            newFood = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
            // Check if food spawned inside snake
            if (!this.snake.isAt(newFood.x, newFood.y)) break;
        }
        this.food = newFood;
    }

    update(timestamp) {
        if (this.isGameOver) return;

        if (timestamp - this.lastUpdateTime > this.updateInterval) {
            this.input.update();
            this.snake.move(this.input.direction);

            if (this.snake.checkCollision(this.gridSize, this.gridSize)) {
                this.gameOver();
                return;
            }

            const head = this.snake.body[0];
            if (head.x === this.food.x && head.y === this.food.y) {
                this.snake.grow();
                this.score += 10;
                this.scoreElement.textContent = this.score;
                this.spawnFood();
                
                // Speed up slightly
                if (this.updateInterval > 80) this.updateInterval -= 1;
            }

            this.lastUpdateTime = timestamp;
        }
    }

    draw() {
        this.renderer.clear();
        this.renderer.drawFood(this.food);
        this.renderer.drawSnake(this.snake);
    }

    gameOver() {
        this.isGameOver = true;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.highScoreElement.textContent = this.highScore;
        }
        this.messageElement.innerHTML = `GAME OVER<br>Score: ${this.score}<br>Click Reset to try again`;
        this.messageElement.style.display = 'block';
    }

    reset() {
        this.snake.reset();
        this.input.reset();
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.updateInterval = 150;
        this.isGameOver = false;
        this.messageElement.style.display = 'none';
        this.spawnFood();
    }

    start() {
        const loop = (timestamp) => {
            this.update(timestamp);
            this.draw();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}
