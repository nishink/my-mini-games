export class Enemy {
    constructor(x, y, width = 32, height = 32) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = 50; // pixels per second, moving right initially
        this.dir = 1; // 1 for right, -1 for left
        this.type = 'normal'; // 敵のタイプ
    }

    update(delta, map) {
        const dt = delta / 1000;
        let newX = this.x + this.vx * dt * this.dir;

        // check collision with map
        if (this._collides(newX, this.y, map)) {
            this.dir *= -1; // reverse direction
            newX = this.x; // don't move
        }
        this.x = newX;
    }

    _collides(x, y, map) {
        const points = [
            { x: x, y: y },
            { x: x + this.width, y: y },
            { x: x, y: y + this.height },
            { x: x + this.width, y: y + this.height }
        ];
        for (const p of points) {
            if (map.getTileAt(p.x, p.y) !== 0) return true;
        }
        return false;
    }

    collidesWith(player) {
        return !(this.x + this.width < player.x ||
                 player.x + player.width < this.x ||
                 this.y + this.height < player.y ||
                 player.y + player.height < this.y);
    }
}

export class JumpingEnemy extends Enemy {
    constructor(x, y, width = 32, height = 32) {
        super(x, y, width, height);
        this.type = 'jumping';
        this.vy = 0; // 垂直速度
        this.gravity = 500; // 重力
        this.jumpPower = -200; // ジャンプ力
        this.jumpTimer = 0; // ジャンプ間隔タイマー
        this.jumpInterval = 2000; // 2秒ごとにジャンプ
        this.onGround = true; // 地面にいるかどうか
    }

    update(delta, map) {
        const dt = delta / 1000;

        // ジャンプタイマーを更新
        this.jumpTimer += delta;
        if (this.jumpTimer >= this.jumpInterval && this.onGround) {
            this.vy = this.jumpPower;
            this.onGround = false;
            this.jumpTimer = 0;
        }

        // 垂直移動
        this.vy += this.gravity * dt;
        let newY = this.y + this.vy * dt;

        // 地面との衝突判定
        if (this._collides(this.x, newY, map)) {
            if (this.vy > 0) { // 下向きの場合、地面に着地
                this.vy = 0;
                this.onGround = true;
                // 地面に合わせる
                const tileY = Math.floor(newY / 32) * 32;
                newY = tileY - this.height;
            } else { // 上向きの場合、頭をぶつける
                this.vy = 0;
                newY = this.y;
            }
        } else {
            this.onGround = false;
        }
        this.y = newY;

        // 水平移動（ジャンプ中は移動しない）
        if (this.onGround) {
            let newX = this.x + this.vx * dt * this.dir;
            if (this._collides(newX, this.y, map)) {
                this.dir *= -1;
                newX = this.x;
            }
            this.x = newX;
        }
    }
}