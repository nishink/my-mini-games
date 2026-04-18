export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 400;
        this.height = 600;
        canvas.width = this.width;
        canvas.height = this.height;
        this.scrollOffset = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const container = document.getElementById('game-container');
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        const availableWidth = rect.width - 10;
        const availableHeight = rect.height - 10;
        
        const aspect = this.width / this.height;
        const containerAspect = availableWidth / availableHeight;
        
        if (containerAspect > aspect) {
            this.canvas.style.height = `${availableHeight}px`;
            this.canvas.style.width = 'auto';
        } else {
            this.canvas.style.width = `${availableWidth}px`;
            this.canvas.style.height = 'auto';
        }
    }

    draw(car, obstacleManager) {
        // 背景（コース）
        this.ctx.fillStyle = '#444';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 左右の壁（路肩）
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(0, 0, 50, this.height);
        this.ctx.fillRect(this.width - 50, 0, 50, this.height);

        // 白線（スクロール）
        this.scrollOffset = (this.scrollOffset + car.speed) % 100;
        this.ctx.strokeStyle = '#fff';
        this.ctx.setLineDash([30, 70]);
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 2, -100 + this.scrollOffset);
        this.ctx.lineTo(this.width / 2, this.height + 100 + this.scrollOffset);
        this.ctx.stroke();

        // 障害物
        for (const o of obstacleManager.obstacles) {
            this.drawCar(o.x, o.y, -Math.PI / 2, o.color);
        }

        // プレイヤー車
        this.drawCar(car.x, car.y, car.angle, '#f1c40f');
    }

    drawCar(x, y, angle, color) {
        this.ctx.save();
        this.ctx.translate(x + 20, y + 35);
        this.ctx.rotate(angle + Math.PI / 2); // デフォルトが上向きなので調整
        
        // ボディ
        this.ctx.fillStyle = color;
        this.ctx.fillRect(-20, -35, 40, 70);

        // ウィンドウ
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(-15, -25, 30, 15); // フロント
        this.ctx.fillRect(-15, 10, 30, 10);  // リア

        // ライト
        this.ctx.fillStyle = 'yellow';
        this.ctx.fillRect(-18, -35, 10, 5);
        this.ctx.fillRect(8, -35, 10, 5);

        this.ctx.restore();
    }
}
