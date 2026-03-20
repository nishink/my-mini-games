import { Player } from './player.js';
import { EnemyManager } from './enemy.js';
import { BulletManager } from './bullet.js';
import { Renderer } from './renderer.js';
import { Input } from './input.js';

export class Game {
    constructor(canvas, ui) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ui = ui;
        
        this.width = canvas.width;
        this.height = canvas.height;
        
        this.input = new Input();
        this.renderer = new Renderer(this.ctx, this.width, this.height);
        this.bulletManager = new BulletManager(this.width, this.height);
        this.player = new Player(this.width, this.height, this.bulletManager);
        this.enemyManager = new EnemyManager(this.width, this.height, this.bulletManager);
        
        this.score = 0;
        this.isGameOver = false;
        this.lastTime = 0;
    }

    start() {
        this.score = 0;
        this.isGameOver = false;
        this.player.reset();
        this.enemyManager.reset();
        this.bulletManager.reset();
        this.updateUI();
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop(timestamp) {
        if (this.isGameOver) return;

        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(deltaTime) {
        this.player.update(deltaTime, this.input);
        this.bulletManager.update(deltaTime);
        this.enemyManager.update(deltaTime, this.player);

        // 当たり判定
        this.checkCollisions();

        if (this.player.hp <= 0) {
            this.gameOver();
        }

        this.updateUI();
    }

    checkCollisions() {
        // プレイヤーの弾 vs 敵
        this.bulletManager.playerBullets.forEach(bullet => {
            this.enemyManager.enemies.forEach(enemy => {
                if (this.isColliding(bullet, enemy)) {
                    bullet.active = false;
                    enemy.takeDamage(10);
                    if (!enemy.active) {
                        this.score += 100;
                    }
                }
            });
        });

        // 敵の弾 vs プレイヤー
        this.bulletManager.enemyBullets.forEach(bullet => {
            if (this.isColliding(bullet, this.player)) {
                bullet.active = false;
                this.player.takeDamage(10);
            }
        });

        // 敵本体 vs プレイヤー
        this.enemyManager.enemies.forEach(enemy => {
            if (this.isColliding(enemy, this.player)) {
                enemy.active = false;
                this.player.takeDamage(20);
            }
        });
    }

    isColliding(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    draw() {
        this.renderer.clear();
        this.renderer.drawBackground();
        this.renderer.drawPlayer(this.player);
        this.renderer.drawBullets(this.bulletManager.playerBullets, 'cyan');
        this.renderer.drawBullets(this.bulletManager.enemyBullets, 'red');
        this.renderer.drawEnemies(this.enemyManager.enemies);
    }

    updateUI() {
        this.ui.scoreBoard.innerText = `SCORE: ${this.score}`;
        this.ui.hpVal.innerText = Math.max(0, this.player.hp);
    }

    gameOver() {
        this.isGameOver = true;
        this.ui.finalScore.innerText = this.score;
        this.ui.gameOverScreen.classList.remove('hidden');
    }
}
