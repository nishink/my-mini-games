export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 12;
        this.speed = 3;
        this.baseSpeed = 3;
        this.slowSpeed = 1.5;
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
    }

    update(input, walls) {
        const speed = input.isPressed('ShiftLeft') ? this.slowSpeed : this.baseSpeed;
        let dx = 0;
        let dy = 0;

        if (input.isPressed('ArrowLeft') || input.isPressed('KeyA')) dx -= speed;
        if (input.isPressed('ArrowRight') || input.isPressed('KeyD')) dx += speed;
        if (input.isPressed('ArrowUp') || input.isPressed('KeyW')) dy -= speed;
        if (input.isPressed('ArrowDown') || input.isPressed('KeyS')) dy += speed;

        // 斜め移動の速度補正
        if (dx !== 0 && dy !== 0) {
            const factor = 1 / Math.sqrt(2);
            dx *= factor;
            dy *= factor;
        }

        // 壁との衝突判定（簡易）
        if (!this.checkWallCollision(this.x + dx, this.y, walls)) {
            this.x += dx;
        }
        if (!this.checkWallCollision(this.x, this.y + dy, walls)) {
            this.y += dy;
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
}
