import { Input } from './input.js';
import { Player } from './player.js';
import { Map } from './map.js';
import { Renderer } from './renderer.js';
import { Enemy, JumpingEnemy } from './enemy.js';
import { Bullet } from './bullet.js';
import { Item } from './item.js';

export class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.input = new Input();
        this.map = new Map();
        this.player = new Player(50, 400);
        this.level = 1; // 現在のレベル
        this.bullets = []; // 弾の初期化
        this.generateEntities(); // 敵とアイテムをランダム生成
        this.renderer = new Renderer(this.canvas, this.ctx, this.map, this.player, this.enemies, this.bullets, this.items);
        this.lastTime = 0;
        this.score = 0;
        this.lives = 3;
        this.gameState = 'playing'; // always start playing
    }

    start() {
        requestAnimationFrame(this.loop.bind(this));
    }

    loop(timestamp) {
        const delta = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.update(delta);
        this.renderer.render();
        requestAnimationFrame(this.loop.bind(this));
    }

    update(delta) {
        if (this.gameState !== 'playing') return;

        // poll input after checking presses
        this.player.update(this.input, this.map, delta, this.bullets);
        this.input.poll();

        // update enemies
        for (const enemy of this.enemies) {
            enemy.update(delta, this.map);
        }

        // update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(delta, this.map);
            if (!bullet.active) {
                this.bullets.splice(i, 1);
                continue;
            }
            // check collision with enemies
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (bullet.collidesWith(enemy)) {
                    this.enemies.splice(j, 1);
                    this.bullets.splice(i, 1);
                    this.score += 100;
                    break;
                }
            }
        }

        // check collisions with items
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            if (item.collidesWith(this.player)) {
                item.collect();
                this.items.splice(i, 1);
                this.score += 50; // アイテム収集で50点追加
            }
        }

        // check collisions with enemies
        for (const enemy of this.enemies) {
            if (enemy.collidesWith(this.player)) {
                this.lives--;
                if (this.lives <= 0) {
                    this.gameState = 'gameOver';
                    this.showMessage('ゲームオーバー！\nリセットボタンで再開');
                } else {
                    this.resetPlayer();
                }
                break;
            }
        }

        // check goal
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        if (this.map.getTileAt(playerCenterX, playerCenterY) === 2 ||
            this.map.getTileAt(this.player.x, this.player.y) === 2 ||
            this.map.getTileAt(this.player.x + this.player.width, this.player.y) === 2 ||
            this.map.getTileAt(this.player.x, this.player.y + this.player.height) === 2 ||
            this.map.getTileAt(this.player.x + this.player.width, this.player.y + this.player.height) === 2) {
            this.gameState = 'cleared';
            this.level++; // レベルアップ
            this.score += 1000;
            this.map.generateRandom(this.level); // 新しいランダムマップ生成
            this.generateEntities(); // 新しい敵とアイテム生成
            this.bullets = []; // 弾をクリア
            this.renderer.updateEnemies(this.enemies); // レンダラーを更新
            this.renderer.updateBullets(this.bullets); // レンダラーを更新
            this.renderer.updateItems(this.items); // レンダラーを更新
            this.showMessage('レベル ' + this.level + ' クリア！スコア: ' + this.score + '\n次のレベルへ');
            this.resetPlayer(); // プレイヤーをリセット
            this.gameState = 'playing'; // ゲーム続行
        }

        // update HUD
        document.getElementById('scoreVal').textContent = this.score;
        document.getElementById('livesVal').textContent = this.lives;
        document.getElementById('levelVal').textContent = this.level;
    }

    reset() {
        this.player.x = 50;
        this.player.y = 400;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.onGround = false;
        this.level = 1; // レベルをリセット
        this.map.generateRandom(this.level); // 新しいランダムマップ生成
        this.generateEntities(); // 敵とアイテムを再生成
        this.bullets = [];
        this.score = 0;
        this.lives = 3;
        this.gameState = 'playing';
        this.renderer.updateEnemies(this.enemies); // update renderer reference
        this.renderer.updateBullets(this.bullets); // update renderer reference
        this.renderer.updateItems(this.items); // update renderer reference
        document.getElementById('scoreVal').textContent = this.score;
        document.getElementById('livesVal').textContent = this.lives;
        this.hideMessage();
    }

    resetPlayer() {
        this.player.x = 50;
        this.player.y = 400;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.onGround = false;
        this.player.jumpCount = 0;
        this.bullets = []; // clear bullets on respawn
        this.renderer.updateBullets(this.bullets); // update renderer
    }

    showMessage(text) {
        const msgEl = document.getElementById('message');
        msgEl.textContent = text;
        msgEl.style.display = 'block';
        setTimeout(() => this.hideMessage(), 3000); // 3秒後に消す
    }

    hideMessage() {
        document.getElementById('message').style.display = 'none';
    }

    generateEntities() {
        this.enemies = [];
        this.items = [];
        const numEnemies = this.level + 2; // レベルが高いほど敵が多い
        const numItems = this.level + 1; // レベルが高いほどアイテムが多い

        for (let i = 0; i < numEnemies; i++) {
            const x = Math.random() * (this.map.width - 200) + 100; // 100からwidth-100の範囲
            const y = 400 - Math.floor(Math.random() * 3) * 64; // 地面またはプラットフォーム上
            const type = Math.random() < 0.5 ? 'normal' : 'jumping'; // ランダムに敵の種類
            if (type === 'jumping') {
                this.enemies.push(new JumpingEnemy(x, y));
            } else {
                this.enemies.push(new Enemy(x, y));
            }
        }

        for (let i = 0; i < numItems; i++) {
            const x = Math.random() * (this.map.width - 200) + 100;
            const y = 400 - Math.floor(Math.random() * 3) * 64;
            this.items.push(new Item(x, y));
        }
    }
}
