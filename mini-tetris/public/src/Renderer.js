export class Renderer {
    constructor(canvas, nextCanvas, cellSize) {
        this.ctx = canvas.getContext('2d');
        this.nextCtx = nextCanvas.getContext('2d');
        this.cellSize = cellSize;
        
        canvas.width = 10 * cellSize;
        canvas.height = 20 * cellSize;
        nextCanvas.width = 4 * cellSize;
        nextCanvas.height = 4 * cellSize;
    }

    draw(board, currentPiece, ghostY) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // 盤面の描画
        for (let y = 0; y < board.rows; y++) {
            for (let x = 0; x < board.cols; x++) {
                if (board.grid[y][x]) {
                    this.drawCell(this.ctx, x, y, board.grid[y][x]);
                }
            }
        }

        // ゴースト（落下地点予測）の描画
        if (currentPiece) {
            this.drawPiece(this.ctx, currentPiece, currentPiece.x, ghostY, true);
            this.drawPiece(this.ctx, currentPiece, currentPiece.x, currentPiece.y);
        }
    }

    drawNext(piece) {
        this.nextCtx.clearRect(0, 0, this.nextCtx.canvas.width, this.nextCtx.canvas.height);
        if (piece) {
            // 中心に寄せるためのオフセット
            const offsetX = (4 - piece.shape[0].length) / 2;
            const offsetY = (4 - piece.shape.length) / 2;
            this.drawPiece(this.nextCtx, piece, offsetX, offsetY);
        }
    }

    drawPiece(ctx, piece, x, y, isGhost = false) {
        for (let py = 0; py < piece.shape.length; py++) {
            for (let px = 0; px < piece.shape[py].length; px++) {
                if (piece.shape[py][px]) {
                    const color = isGhost ? `${piece.color}44` : piece.color;
                    this.drawCell(ctx, x + px, y + py, color);
                }
            }
        }
    }

    drawCell(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        
        // ハイライト（立体感）
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.strokeRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
    }
}
