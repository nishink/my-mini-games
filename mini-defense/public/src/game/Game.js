import { Map } from './Map.js';
import { Enemy } from './Enemy.js';
import { Tower } from './Tower.js';
import { Bullet } from './Bullet.js';

export class Game {
    constructor(canvas, ui) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ui = ui;
        
        this.tileSize = 40;
        this.map = new Map(15, 10, this.tileSize);
        
        canvas.width = this.map.width * this.tileSize;
        canvas.height = this.map.height * this.tileSize;
        
        this.reset();
    }

    reset() {
        this.gold = 100;
        this.hp = 20;
        this.wave = 0;
        
        this.enemies = [];
        this.towers = [];
        this.bullets = [];
        
        this.isWaveActive = false;
        this.isGameOver = false;
        this.selectedTowerType = null;
        
        this.updateUI();
    }

    startWave() {
        if (this.isWaveActive || this.isGameOver) return;
        
        this.wave++;
        this.isWaveActive = true;
        
        // ウェーブに応じた数の敵を生成
        const enemyCount = 5 + Math.floor(this.wave / 2) * 2;
        let spawned = 0;
        
        const spawnInterval = setInterval(() => {
            if (this.isGameOver) {
                clearInterval(spawnInterval);
                return;
            }
            
            this.enemies.push(new Enemy(this.map.path, this.wave, this.map));
            spawned++;
            
            if (spawned >= enemyCount) {
                clearInterval(spawnInterval);
            }
        }, 1000);
        
        this.updateUI();
    }

    update(deltaTime) {
        if (this.isGameOver) return;

        // 敵の更新
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime);
            if (enemy.reachedEnd) {
                this.hp--;
                enemy.active = false;
                if (this.hp <= 0) this.gameOver();
            }
        });

        // タワーの更新
        this.towers.forEach(tower => {
            tower.update(deltaTime, this.enemies, (x, y, target, damage) => {
                this.bullets.push(new Bullet(x, y, target, damage));
            });
        });

        // 弾の更新
        this.bullets.forEach(bullet => bullet.update(deltaTime));

        // 死んだ敵からゴールド獲得
        this.enemies.filter(e => !e.active && !e.reachedEnd).forEach(e => {
            this.gold += e.goldValue;
            // フィルタリングされる前に1回だけ加算するようにあとで調整が必要
            e.goldValue = 0; 
        });

        // 終了したオブジェクトのクリーンアップ
        this.enemies = this.enemies.filter(e => e.active);
        this.bullets = this.bullets.filter(b => b.active);

        // ウェーブ終了判定
        if (this.isWaveActive && this.enemies.length === 0) {
            this.isWaveActive = false;
        }

        this.updateUI();
    }

    buyTower(type, gx, gy) {
        const costs = { basic: 50, fast: 80, sniper: 150 };
        const cost = costs[type];

        if (this.gold >= cost && this.map.isBuildable(gx, gy)) {
            // 既にタワーがあるかチェック
            if (this.towers.some(t => t.gx === gx && t.gy === gy)) return false;

            this.gold -= cost;
            this.towers.push(new Tower(gx, gy, type, this.map));
            return true;
        }
        return false;
    }

    updateUI() {
        this.ui.goldVal.innerText = this.gold;
        this.ui.hpVal.innerText = Math.max(0, this.hp);
        this.ui.waveVal.innerText = this.wave;
    }

    gameOver() {
        this.isGameOver = true;
        this.ui.finalWave.innerText = this.wave;
        this.ui.gameOverScreen.classList.remove('hidden');
    }
}
