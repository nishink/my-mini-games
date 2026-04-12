export class Car {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.width = 40;
        this.height = 70;
        this.reset();
    }

    reset() {
        this.x = this.canvasWidth / 2;
        this.y = this.canvasHeight - 120; // 画面下部に固定
        this.angle = -Math.PI / 2; // 上向き
        this.speed = 0;
        this.maxSpeed = 15;
        this.acceleration = 0.2;
        this.friction = 0.05;
        this.turnSpeed = 0.04;
    }

    update(input) {
        // アクセル・ブレーキ
        if (input.isPressed('ArrowUp')) {
            this.speed += this.acceleration;
        } else if (input.isPressed('ArrowDown')) {
            this.speed -= this.acceleration * 2;
        }

        // 摩擦（自然減速）
        if (this.speed > 0) this.speed -= this.friction;
        if (this.speed < 0) this.speed += this.friction;
        if (Math.abs(this.speed) < this.friction) this.speed = 0;

        // 速度制限
        if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
        if (this.speed < -this.maxSpeed / 2) this.speed = -this.maxSpeed / 2;

        // ステアリング（動いている時だけ曲がれる）
        if (this.speed !== 0) {
            const currentTurnSpeed = this.turnSpeed * (Math.abs(this.speed) / this.maxSpeed + 0.5);
            if (input.isPressed('ArrowLeft')) {
                this.angle -= currentTurnSpeed;
            }
            if (input.isPressed('ArrowRight')) {
                this.angle += currentTurnSpeed;
            }
        }

        // X座標の更新（横移動）
        // 実際のレースゲームらしく、角度に応じて横にスライドさせる
        this.x += Math.cos(this.angle) * Math.abs(this.speed) * 0.5;

        // 壁との衝突判定（簡易）
        const margin = 50; // コースの左右の壁
        if (this.x < margin) {
            this.x = margin;
            this.speed *= 0.5; // 衝突減速
        }
        if (this.x > this.canvasWidth - margin - this.width) {
            this.x = this.canvasWidth - margin - this.width;
            this.speed *= 0.5;
        }
    }
}
