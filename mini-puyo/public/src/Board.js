export class Board {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.grid = this.createEmptyGrid();
    }

    createEmptyGrid() {
        return Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
    }

    isValidMove(puyo1, puyo2) {
        return this.isInside(puyo1.x, puyo1.y) && !this.isOccupied(puyo1.x, puyo1.y) &&
               this.isInside(puyo2.x, puyo2.y) && !this.isOccupied(puyo2.x, puyo2.y);
    }

    isInside(x, y) {
        return x >= 0 && x < this.cols && y < this.rows;
    }

    isOccupied(x, y) {
        if (y < 0) return false;
        return this.grid[y][x] !== null;
    }

    placePuyo(x, y, color) {
        if (y >= 0) {
            this.grid[y][x] = color;
        }
    }

    // すべてのぷよを下に落とす（自由落下）
    applyGravity() {
        let moved = false;
        for (let x = 0; x < this.cols; x++) {
            for (let y = this.rows - 2; y >= 0; y--) {
                if (this.grid[y][x] !== null && this.grid[y + 1][x] === null) {
                    let currentY = y;
                    while (currentY + 1 < this.rows && this.grid[currentY + 1][x] === null) {
                        this.grid[currentY + 1][x] = this.grid[currentY][x];
                        this.grid[currentY][x] = null;
                        currentY++;
                        moved = true;
                    }
                }
            }
        }
        return moved;
    }

    // 4つ以上繋がっているぷよを見つけて消す
    findAndClearGroups() {
        const visited = Array.from({ length: this.rows }, () => Array(this.cols).fill(false));
        let clearedCount = 0;
        const toClear = [];

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x] !== null && !visited[y][x]) {
                    const group = this.findGroup(x, y, this.grid[y][x], visited);
                    if (group.length >= 4) {
                        toClear.push(...group);
                        clearedCount += group.length;
                    }
                }
            }
        }

        toClear.forEach(({ x, y }) => {
            this.grid[y][x] = null;
        });

        return clearedCount;
    }

    findGroup(startX, startY, color, visited) {
        const group = [];
        const queue = [{ x: startX, y: startY }];
        visited[startY][startX] = true;

        while (queue.length > 0) {
            const { x, y } = queue.shift();
            group.push({ x, y });

            const neighbors = [
                { x: x + 1, y }, { x: x - 1, y },
                { x, y: y + 1 }, { x, y: y - 1 }
            ];

            for (const n of neighbors) {
                if (this.isInside(n.x, n.y) && n.y >= 0 &&
                    !visited[n.y][n.x] && this.grid[n.y][n.x] === color) {
                    visited[n.y][n.x] = true;
                    queue.push(n);
                }
            }
        }
        return group;
    }
}
