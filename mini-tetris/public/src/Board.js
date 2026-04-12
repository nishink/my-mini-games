export class Board {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.grid = this.createEmptyGrid();
    }

    createEmptyGrid() {
        return Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    }

    reset() {
        this.grid = this.createEmptyGrid();
    }

    isValidMove(piece, nextX, nextY, nextShape = piece.shape) {
        for (let y = 0; y < nextShape.length; y++) {
            for (let x = 0; x < nextShape[y].length; x++) {
                if (nextShape[y][x] === 0) continue;

                const boardX = nextX + x;
                const boardY = nextY + y;

                // 境界チェック
                if (boardX < 0 || boardX >= this.cols || boardY >= this.rows) {
                    return false;
                }

                // すでに埋まっているかチェック
                if (boardY >= 0 && this.grid[boardY][boardX]) {
                    return false;
                }
            }
        }
        return true;
    }

    placePiece(piece) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const boardY = piece.y + y;
                    if (boardY >= 0) {
                        this.grid[boardY][piece.x + x] = piece.color;
                    }
                }
            }
        }
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== 0)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++; // 同じ行を再度チェック
            }
        }
        return linesCleared;
    }
}
