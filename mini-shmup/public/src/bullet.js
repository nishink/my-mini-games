export class Bullet {
    constructor(x, y, speedY) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.speedY = speedY;
        this.active = true;
    }

    update(deltaTime) {
        this.y += this.speedY * deltaTime;
        if (this.y < -20 || this.y > 620) {
            this.active = false;
        }
    }
}

export class BulletManager {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.playerBullets = [];
        this.enemyBullets = [];
    }

    reset() {
        this.playerBullets = [];
        this.enemyBullets = [];
    }

    addPlayerBullet(x, y) {
        this.playerBullets.push(new Bullet(x, y, -500));
    }

    addEnemyBullet(x, y) {
        this.enemyBullets.push(new Bullet(x, y, 300));
    }

    update(deltaTime) {
        this.playerBullets.forEach(b => b.update(deltaTime));
        this.enemyBullets.forEach(b => b.update(deltaTime));
        
        this.playerBullets = this.playerBullets.filter(b => b.active);
        this.enemyBullets = this.enemyBullets.filter(b => b.active);
    }
}
