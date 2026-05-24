export class Enemy {
    constructor(x, y, width = 32, height = 32) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = 50; // pixels per second, moving right initially
        this.dir = 1; // 1 for right, -1 for left
        this.type = 'normal'; // 敵のタイプ

        // Collision Hitbox
        this.hitbox = {
            offsetX: 4,
            offsetY: 8,
            width: 24,
            height: 16
        };
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
        const h = this.hitbox;
        const hx = x + h.offsetX;
        const hy = y + h.offsetY;

        const points = [
            { x: hx, y: hy },
            { x: hx + h.width, y: hy },
            { x: hx, y: hy + h.height },
            { x: hx + h.width, y: hy + h.height }
        ];
        for (const p of points) {
            if (map.getTileAt(p.x, p.y) !== 0) return true;
        }
        return false;
    }

    collidesWith(player) {
        // Use hitboxes for intersection check
        const e = this.hitbox;
        const ex1 = this.x + e.offsetX;
        const ey1 = this.y + e.offsetY;
        const ex2 = ex1 + e.width;
        const ey2 = ey1 + e.height;

        const p = player.hitbox;
        const px1 = player.x + p.offsetX;
        const py1 = player.y + p.offsetY;
        const px2 = px1 + p.width;
        const py2 = py1 + p.height;

        return !(ex2 < px1 || px2 < ex1 || ey2 < py1 || py2 < ey1);
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
                // Note: using sprite height for ground alignment to keep it visual
                const tileY = Math.floor((newY + this.hitbox.offsetY + this.hitbox.height) / 32) * 32;
                newY = tileY - (this.hitbox.offsetY + this.hitbox.height);
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
