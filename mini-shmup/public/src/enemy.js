export class Enemy {
    constructor(x, y, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.type = type;
        this.active = true;
        this.hp = type === 'fast' ? 10 : 30;
        this.speed = type === 'fast' ? 200 : 100;
        this.shootTimer = Math.random() * 2;
    }

    update(deltaTime, bulletManager) {
        this.y += this.speed * deltaTime;
        
        if (this.y > 600) {
            this.active = false;
        }

        this.shootTimer -= deltaTime;
        if (this.shootTimer <= 0) {
            this.shoot(bulletManager);
            this.shootTimer = 2 + Math.random() * 2;
        }
    }

    shoot(bulletManager) {
        bulletManager.addEnemyBullet(this.x + this.width / 2 - 2, this.y + this.height);
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.active = false;
        }
    }
}

export class EnemyManager {
    constructor(gameWidth, gameHeight, bulletManager) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.bulletManager = bulletManager;
        this.enemies = [];
        this.spawnTimer = 0;
        this.spawnRate = 1.5;
    }

    reset() {
        this.enemies = [];
        this.spawnTimer = 0;
        this.spawnRate = 1.5;
    }

    update(deltaTime) {
        this.spawnTimer -= deltaTime;
        if (this.spawnTimer <= 0) {
            this.spawnEnemy();
            this.spawnTimer = this.spawnRate;
            // 徐々に難易度を上げる
            this.spawnRate = Math.max(0.5, this.spawnRate * 0.99);
        }

        this.enemies.forEach(enemy => enemy.update(deltaTime, this.bulletManager));
        this.enemies = this.enemies.filter(enemy => enemy.active);
    }

    spawnEnemy() {
        const x = Math.random() * (this.gameWidth - 30);
        const type = Math.random() > 0.8 ? 'fast' : 'normal';
        this.enemies.push(new Enemy(x, -30, type));
    }
}
