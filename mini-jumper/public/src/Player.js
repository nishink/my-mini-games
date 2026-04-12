export class Player {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.width = 40;
        this.height = 40;
        this.reset();
    }

    reset() {
        this.x = this.canvasWidth / 2 - this.width / 2;
        this.y = this.canvasHeight - 150;
        this.vx = 0;
        this.vy = 0;
        this.gravity = 0.4;
        this.jumpForce = -12;
        this.speed = 0.8;
        this.friction = 0.9;
    }

    update(input) {
        // 左右移動
        if (input.isPressed('ArrowLeft') || input.isPressed('KeyA')) {
            this.vx -= this.speed;
        } else if (input.isPressed('ArrowRight') || input.isPressed('KeyD')) {
            this.vx += this.speed;
        }

        this.vx *= this.friction;
        this.x += this.vx;

        // 重力
        this.vy += this.gravity;
        this.y += this.vy;

        // 左右の回り込み
        if (this.x + this.width < 0) this.x = this.canvasWidth;
        if (this.x > this.canvasWidth) this.x = -this.width;
    }

    jump() {
        this.vy = this.jumpForce;
    }
}
