import { Tile } from './Tile.js';

export class Grid {
    constructor(size) {
        this.size = size;
        this.cells = Array.from({ length: size }, () => Array(size).fill(null));
        this.tileContainer = document.getElementById('tile-container');
    }

    reset() {
        this.cells.forEach(row => row.forEach(tile => tile && tile.remove()));
        this.cells = Array.from({ length: this.size }, () => Array(this.size).fill(null));
    }

    addRandomTile() {
        const emptyCells = [];
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (!this.cells[y][x]) emptyCells.push({ x, y });
            }
        }

        if (emptyCells.length > 0) {
            const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            const tile = new Tile(x, y, value);
            this.cells[y][x] = tile;
            this.tileContainer.appendChild(tile.element);
        }
    }

    move(direction) {
        // direction: {x: 0, y: -1} (Up), {x: 0, y: 1} (Down), etc.
        const vector = this.getVector(direction);
        const traversals = this.buildTraversals(vector);
        let moved = false;
        let score = 0;

        // タイルの合体フラグをリセット
        this.cells.flat().forEach(tile => { if (tile) tile.mergedFrom = null; });

        traversals.y.forEach(y => {
            traversals.x.forEach(x => {
                const tile = this.cells[y][x];
                if (tile) {
                    const positions = this.findFarthestPosition(x, y, vector);
                    const next = this.cells[positions.next.y]?.[positions.next.x];

                    // 合体判定
                    if (next && next.value === tile.value && !next.mergedFrom) {
                        const merged = new Tile(positions.next.x, positions.next.y, tile.value * 2);
                        merged.mergedFrom = [tile, next];

                        this.cells[positions.next.y][positions.next.x] = merged;
                        this.cells[y][x] = null;

                        tile.x = positions.next.x;
                        tile.y = positions.next.y;
                        tile.updatePosition();
                        
                        // アニメーション後に古いタイルを消す
                        setTimeout(() => {
                            tile.remove();
                            next.remove();
                            this.tileContainer.appendChild(merged.element);
                        }, 100);

                        score += merged.value;
                        moved = true;
                    } else if (positions.farthest.x !== x || positions.farthest.y !== y) {
                        // 単なる移動
                        this.cells[positions.farthest.y][positions.farthest.x] = tile;
                        this.cells[y][x] = null;
                        tile.x = positions.farthest.x;
                        tile.y = positions.farthest.y;
                        tile.updatePosition();
                        moved = true;
                    }
                }
            });
        });

        return { moved, score };
    }

    getVector(direction) {
        const vectors = {
            'Up': { x: 0, y: -1 },
            'Down': { x: 0, y: 1 },
            'Left': { x: -1, y: 0 },
            'Right': { x: 1, y: 0 }
        };
        return vectors[direction];
    }

    buildTraversals(vector) {
        const traversals = { x: [0, 1, 2, 3], y: [0, 1, 2, 3] };
        if (vector.x === 1) traversals.x.reverse();
        if (vector.y === 1) traversals.y.reverse();
        return traversals;
    }

    findFarthestPosition(x, y, vector) {
        let previous;
        do {
            previous = { x, y };
            x += vector.x;
            y += vector.y;
        } while (this.withinBounds(x, y) && !this.cells[y][x]);

        return {
            farthest: previous,
            next: { x, y }
        };
    }

    withinBounds(x, y) {
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }

    movesAvailable() {
        // 空きマスがあるか
        if (this.cells.flat().some(cell => !cell)) return true;

        // 隣接する同じ数字があるか
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const tile = this.cells[y][x];
                if (tile) {
                    const neighbors = [
                        { x: x + 1, y }, { x: x - 1, y },
                        { x, y: y + 1 }, { x, y: y - 1 }
                    ];
                    for (const n of neighbors) {
                        const other = this.cells[n.y]?.[n.x];
                        if (other && other.value === tile.value) return true;
                    }
                }
            }
        }
        return false;
    }
}
