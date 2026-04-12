export class Renderer {
    constructor(canvas, nextCanvas, cellSize) {
        this.ctx = canvas.getContext('2d');
        this.nextCtx = nextCanvas.getContext('2d');
        this.cellSize = cellSize;
        
        canvas.width = 6 * cellSize;
        canvas.height = 12 * cellSize;
        nextCanvas.width = cellSize * 2;
        nextCanvas.height = cellSize * 4;
    }

    draw(board, currentPair) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // 盤面の描画
        for (let y = 0; y < board.rows; y++) {
            for (let x = 0; x < board.cols; x++) {
                if (board.grid[y][x]) {
                    this.drawPuyo(this.ctx, x, y, board.grid[y][x]);
                }
            }
        }

        // 操作中のぷよ
        if (currentPair) {
            this.drawPuyo(this.ctx, currentPair.puyo1.x, currentPair.puyo1.y, currentPair.puyo1.color);
            this.drawPuyo(this.ctx, currentPair.puyo2.x, currentPair.puyo2.y, currentPair.puyo2.color);
        }
    }

    drawNext(pair) {
        this.nextCtx.clearRect(0, 0, this.nextCtx.canvas.width, this.nextCtx.canvas.height);
        if (pair) {
            this.drawPuyo(this.nextCtx, 0.5, 2.5, pair.puyo1.color);
            this.drawPuyo(this.nextCtx, 0.5, 1.5, pair.puyo2.color);
        }
    }

    drawPuyo(ctx, x, y, color) {
        const radius = this.cellSize * 0.45;
        const centerX = (x + 0.5) * this.cellSize;
        const centerY = (y + 0.5) * this.cellSize;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // 目の描画
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(centerX - radius/3, centerY - radius/4, radius/4, 0, Math.PI * 2);
        ctx.arc(centerX + radius/3, centerY - radius/4, radius/4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(centerX - radius/3, centerY - radius/4, radius/8, 0, Math.PI * 2);
        ctx.arc(centerX + radius/3, centerY - radius/4, radius/8, 0, Math.PI * 2);
        ctx.fill();

        // 光沢
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(centerX - radius/3, centerY - radius/3, radius/5, 0, Math.PI * 2);
        ctx.fill();
    }
}
