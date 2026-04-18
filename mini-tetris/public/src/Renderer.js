export class Renderer {
    constructor(canvas, nextCanvas, initialCellSize) {
        this.canvas = canvas;
        this.nextCanvas = nextCanvas;
        this.ctx = canvas.getContext('2d');
        this.nextCtx = nextCanvas.getContext('2d');
        this.baseCellSize = initialCellSize;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        // Compute cell size based on screen height (leaving room for HUD and controls)
        const vh = window.innerHeight;
        const availableHeight = vh * 0.65; // Use 65% of screen height for game board
        this.cellSize = Math.floor(availableHeight / 20);
        
        // Ensure minimum cell size for playability
        this.cellSize = Math.max(this.cellSize, 15);
        
        // If it's still too wide for the screen, scale down
        const availableWidth = window.innerWidth * 0.9;
        if (this.cellSize * 10 > availableWidth) {
            this.cellSize = Math.floor(availableWidth / 10);
        }

        this.canvas.width = 10 * this.cellSize;
        this.canvas.height = 20 * this.cellSize;
        this.nextCanvas.width = 4 * this.cellSize;
        this.nextCanvas.height = 4 * this.cellSize;
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
