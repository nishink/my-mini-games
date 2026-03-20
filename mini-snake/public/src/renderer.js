export class Renderer {
    constructor(ctx, cellSize) {
        this.ctx = ctx;
        this.cellSize = cellSize;
    }

    clear() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    drawSnake(snake) {
        snake.body.forEach((segment, index) => {
            // Head is a different color
            this.ctx.fillStyle = index === 0 ? '#1abc9c' : '#2ecc71';
            this.ctx.fillRect(
                segment.x * this.cellSize + 1,
                segment.y * this.cellSize + 1,
                this.cellSize - 2,
                this.cellSize - 2
            );
        });
    }

    drawFood(food) {
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.beginPath();
        const centerX = food.x * this.cellSize + this.cellSize / 2;
        const centerY = food.y * this.cellSize + this.cellSize / 2;
        this.ctx.arc(centerX, centerY, this.cellSize / 2 - 2, 0, Math.PI * 2);
        this.ctx.fill();
    }
}
