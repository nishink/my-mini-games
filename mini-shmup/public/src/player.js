export class Player {
    constructor(gameWidth, gameHeight, bulletManager) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.bulletManager = bulletManager;
        
        this.width = 30;
        this.height = 30;
        this.reset();
        
        this.speed = 300;
        this.shootCooldown = 0.2;
        this.cooldownTimer = 0;
    }

    reset() {
        this.x = this.gameWidth / 2 - this.width / 2;
        this.y = this.gameHeight - 60;
        this.hp = 100;
        this.active = true;
    }

    update(deltaTime, input) {
        // キーボード移動
        if (input.keys.ArrowLeft || input.keys.a) this.x -= this.speed * deltaTime;
        if (input.keys.ArrowRight || input.keys.d) this.x += this.speed * deltaTime;
        if (input.keys.ArrowUp || input.keys.w) this.y -= this.speed * deltaTime;
        if (input.keys.ArrowDown || input.keys.s) this.y += this.speed * deltaTime;

        // タッチ移動 (タッチ地点の少し上に自機を移動)
        if (input.isTouching) {
            // 自機の中心がタッチ位置の少し上に来るように計算（指で隠れないように）
            const offset = 60; 
            const targetX = input.touchX - this.width / 2;
            const targetY = input.touchY - this.height / 2 - offset;
            
            // 少し遊び（バッファ）を持たせて、急激な動きを抑制しつつ滑らかに追従
            this.x += (targetX - this.x) * 0.25;
            this.y += (targetY - this.y) * 0.25;
        }

        // 画面外に出ないように制限
        this.x = Math.max(0, Math.min(this.gameWidth - this.width, this.x));
        this.y = Math.max(0, Math.min(this.gameHeight - this.height, this.y));

        // ショット
        if (input.keys[' '] && this.cooldownTimer <= 0) {
            this.shoot();
            this.cooldownTimer = this.shootCooldown;
        }

        if (this.cooldownTimer > 0) {
            this.cooldownTimer -= deltaTime;
        }
    }

    shoot() {
        this.bulletManager.addPlayerBullet(this.x + this.width / 2 - 2, this.y);
    }

    takeDamage(amount) {
        this.hp -= amount;
    }
}
