export class Enemy {
    constructor(path) {
        this.path = path; // [{x, y}, ...] 巡回ポイント
        this.pathIndex = 0;
        this.x = path[0].x;
        this.y = path[0].y;
        this.angle = 0;
        this.speed = 1.5;
        
        this.radius = 15;
        this.viewDistance = 200;
        this.viewAngle = Math.PI / 3; // 60度
    }

    update(walls) {
        const target = this.path[this.pathIndex];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // 到達判定
        if (dist < 15) {
            this.pathIndex = (this.pathIndex + 1) % this.path.length;
            this.avoidTimer = 0;
        } else {
            // 回避モード中でなければ目標地点へ
            if (!(this.avoidTimer > 0)) {
                this.angle = Math.atan2(dy, dx);
            }

            const moveX = Math.cos(this.angle) * this.speed;
            const moveY = Math.sin(this.angle) * this.speed;

            const prevX = this.x;
            const prevY = this.y;

            // スライディング移動
            if (!this.checkWallCollision(this.x + moveX, this.y, walls)) this.x += moveX;
            if (!this.checkWallCollision(this.x, this.y + moveY, walls)) this.y += moveY;

            // 移動量のチェック
            const actualMovedDist = Math.sqrt((this.x - prevX)**2 + (this.y - prevY)**2);
            if (actualMovedDist < this.speed * 0.2) {
                // ほとんど動けていない（壁にぶつかっている）
                this.avoidTimer = 30; // しばらく回避方向を維持
                this.angle += Math.PI * 0.6 + Math.random() * Math.PI * 0.8;
                
                // 行き止まりと判断し、次の巡回ポイントへ切り替える
                this.pathIndex = (this.pathIndex + 1) % this.path.length;
            } else {
                if (this.avoidTimer > 0) this.avoidTimer--;
            }
        }
    }

    checkWallCollision(nextX, nextY, walls) {
        for (const wall of walls) {
            if (nextX + this.radius > wall.x &&
                nextX - this.radius < wall.x + wall.width &&
                nextY + this.radius > wall.y &&
                nextY - this.radius < wall.y + wall.height) {
                return true;
            }
        }
        return false;
    }

    // プレイヤーが視界に入っているか判定
    canSeePlayer(player, walls) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // 1. 距離チェック
        if (dist > this.viewDistance) return false;

        // 2. 角度チェック
        let angleToPlayer = Math.atan2(dy, dx);
        let angleDiff = angleToPlayer - this.angle;
        
        // 角度の差を -PI 〜 PI に正規化
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

        if (Math.abs(angleDiff) > this.viewAngle / 2) return false;

        // 3. 遮蔽物チェック（簡易的な線分判定）
        // 敵の中心からプレイヤーの中心までの間に壁があるか
        if (this.isBlockedByWall(this.x, this.y, player.x, player.y, walls)) {
            return false;
        }

        return true;
    }

    isBlockedByWall(x1, y1, x2, y2, walls) {
        for (const wall of walls) {
            if (this.lineRectIntersect(x1, y1, x2, y2, wall)) {
                return true;
            }
        }
        return false;
    }

    // 線分と矩形の交差判定（簡易版）
    lineRectIntersect(x1, y1, x2, y2, rect) {
        // 矩形の4辺それぞれと線分の交差をチェックすべきだが、
        // 潜入ゲームの「物陰に隠れる」感覚を出すため、中点数個をチェックする簡易方式を採用
        const samples = 10;
        for (let i = 1; i < samples; i++) {
            const px = x1 + (x2 - x1) * (i / samples);
            const py = y1 + (y2 - y1) * (i / samples);
            if (px > rect.x && px < rect.x + rect.width &&
                py > rect.y && py < rect.y + rect.height) {
                return true;
            }
        }
        return false;
    }
}
