export class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = 8;
        this.friction = 0.98; // 毎フレーム速度を減衰
        this.isMoving = false;
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.isMoving = false;
    }

    update() {
        if (!this.isMoving) return;

        this.x += this.vx;
        this.y += this.vy;

        // 摩擦
        this.vx *= this.friction;
        this.vy *= this.friction;

        // 停止判定
        if (Math.abs(this.vx) < 0.1 && Math.abs(this.vy) < 0.1) {
            this.vx = 0;
            this.vy = 0;
            this.isMoving = false;
        }
    }

    shoot(powerX, powerY) {
        this.vx = powerX;
        this.vy = powerY;
        this.isMoving = true;
    }
}
