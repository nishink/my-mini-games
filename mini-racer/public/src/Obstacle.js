export class Obstacle {
    constructor(x, y, speed, type = 'CAR') {
        this.x = x;
        this.y = y;
        this.speed = speed; // 他車の自律速度
        this.width = 40;
        this.height = 70;
        this.color = this.getRandomColor();
    }

    getRandomColor() {
        const colors = ['#e74c3c', '#3498db', '#f1c40f', '#9b59b6', '#1abc9c'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update(playerSpeed) {
        // プレイヤーの速度に応じて相対的に動く
        // プレイヤーが速いほど、他車は下に流れていく
        this.y += (playerSpeed - this.speed);
    }
}

export class ObstacleManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.obstacles = [];
        this.spawnTimer = 0;
        this.margin = 60;
    }

    reset() {
        this.obstacles = [];
        this.spawnTimer = 0;
    }

    update(playerSpeed) {
        this.spawnTimer++;
        if (this.spawnTimer > 100) {
            this.spawnTimer = 0;
            this.spawn();
        }

        this.obstacles.forEach(o => o.update(playerSpeed));
        this.obstacles = this.obstacles.filter(o => o.y < this.canvasHeight + 100 && o.y > -500);
    }

    spawn() {
        const x = this.margin + Math.random() * (this.canvasWidth - 2 * this.margin - 40);
        const y = -100;
        const speed = 5 + Math.random() * 5;
        this.obstacles.push(new Obstacle(x, y, speed));
    }
}
