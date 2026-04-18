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
        const availableHeight = vh * 0.55; // Use 55% of screen height for game board to be safe
        this.cellSize = Math.floor(availableHeight / 20);
        
        // Ensure minimum cell size for playability
        this.cellSize = Math.max(this.cellSize, 12);
        
        // If it's still too wide for the screen, scale down
        const availableWidth = window.innerWidth * 0.95;
        if (this.cellSize * 10 > availableWidth) {
            this.cellSize = Math.floor(availableWidth / 10);
        }

        this.canvas.width = 10 * this.cellSize;
        this.canvas.height = 20 * this.cellSize;

        // Next canvas should be fixed relative to its container's actual size if possible
        const nextRect = this.nextCanvas.getBoundingClientRect();
        this.nextCanvas.width = nextRect.width || (4 * this.cellSize);
        this.nextCanvas.height = nextRect.height || (4 * this.cellSize);
        
        // Next piece rendering uses a constant relative scale
        this.nextCellSize = this.nextCanvas.width / 4;
    }

    draw(board, currentPiece, ghostY) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // 盤面の描画
        for (let y = 0; y < board.rows; y++) {
            for (let x = 0; x < board.cols; x++) {
                if (board.grid[y][x]) {
                    this.drawCell(this.ctx, x, y, board.grid[y][x], this.cellSize);
                }
            }
        }

        // ゴースト（落下地点予測）の描画
        if (currentPiece) {
            this.drawPiece(this.ctx, currentPiece, currentPiece.x, ghostY, this.cellSize, true);
            this.drawPiece(this.ctx, currentPiece, currentPiece.x, currentPiece.y, this.cellSize);
        }
    }

    drawNext(piece) {
        this.nextCtx.clearRect(0, 0, this.nextCtx.canvas.width, this.nextCtx.canvas.height);
        if (piece) {
            const offsetX = (4 - piece.shape[0].length) / 2;
            const offsetY = (4 - piece.shape.length) / 2;
            this.drawPiece(this.nextCtx, piece, offsetX, offsetY, this.nextCellSize);
        }
    }

    drawPiece(ctx, piece, x, y, cellSize, isGhost = false) {
        for (let py = 0; py < piece.shape.length; py++) {
            for (let px = 0; px < piece.shape[py].length; px++) {
                if (piece.shape[py][px]) {
                    const color = isGhost ? `${piece.color}44` : piece.color;
                    this.drawCell(ctx, x + px, y + py, color, cellSize);
                }
            }
        }
    }

    drawCell(ctx, x, y, color, cellSize) {
        ctx.fillStyle = color;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
}
