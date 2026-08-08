/**
 * PipeEngine - パイプパズルのコアロジック
 *
 * パイプの種類:
 *  - straight: 直線 (上-下 or 左-右)
 *  - elbow:    直角 (上-右, 右-下, 下-左, 左-上)
 *  - tee:      T字 (3方向)
 *  - cross:    十字 (4方向)
 *  - dead:     行き止まり (1方向のみ: source/sinkに使用)
 *
 * 方向: 0=上, 1=右, 2=下, 3=左
 */

export const PIPE_TYPES = {
    STRAIGHT: 'straight',
    ELBOW:    'elbow',
    TEE:      'tee',
    CROSS:    'cross',
    DEAD:     'dead',
};

// 各パイプタイプと回転に応じた接続方向のセット
// connectionsMap[type][rotation] = [directions...]
export const connectionsMap = {
    straight: [
        [0, 2], // rot 0: 上-下
        [1, 3], // rot 1: 右-左
        [0, 2], // rot 2: 上-下 (同じ)
        [1, 3], // rot 3: 右-左 (同じ)
    ],
    elbow: [
        [0, 1], // rot 0: 上-右
        [1, 2], // rot 1: 右-下
        [2, 3], // rot 2: 下-左
        [3, 0], // rot 3: 左-上
    ],
    tee: [
        [0, 1, 2], // rot 0: 上-右-下 (左が閉)
        [1, 2, 3], // rot 1: 右-下-左 (上が閉)
        [2, 3, 0], // rot 2: 下-左-上 (右が閉)
        [3, 0, 1], // rot 3: 左-上-右 (下が閉)
    ],
    cross: [
        [0, 1, 2, 3], // rot 0: 全方向
        [0, 1, 2, 3],
        [0, 1, 2, 3],
        [0, 1, 2, 3],
    ],
    dead: [
        [0], // rot 0: 上のみ
        [1], // rot 1: 右のみ
        [2], // rot 2: 下のみ
        [3], // rot 3: 左のみ
    ],
};

const DIR_VECTORS = [
    [-1, 0], // 0: 上
    [0, 1],  // 1: 右
    [1, 0],  // 2: 下
    [0, -1], // 3: 左
];
const OPPOSITE = [2, 3, 0, 1];

export class Cell {
    constructor(type, rotation = 0, isSource = false, isSink = false) {
        this.type = type;
        this.rotation = rotation;
        this.isSource = isSource;
        this.isSink = isSink;
        this.filled = false; // 水が流れているか
    }

    getConnections() {
        return connectionsMap[this.type][this.rotation % 4];
    }

    rotate() {
        this.rotation = (this.rotation + 1) % 4;
    }

    connects(dir) {
        return this.getConnections().includes(dir);
    }
}

export class PipeEngine {
    constructor(grid) {
        this.grid = grid; // Cell[][]
        this.rows = grid.length;
        this.cols = grid[0].length;
    }

    // 水の流れをシミュレート (BFS)
    simulate() {
        // まず全セルの filled をリセット
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c].filled = false;
            }
        }

        // ソースを探してBFS
        const queue = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c].isSource) {
                    this.grid[r][c].filled = true;
                    queue.push([r, c]);
                }
            }
        }

        const visited = new Set();
        while (queue.length > 0) {
            const [r, c] = queue.shift();
            const key = `${r},${c}`;
            if (visited.has(key)) continue;
            visited.add(key);

            const cell = this.grid[r][c];
            const conns = cell.getConnections();

            for (const dir of conns) {
                const [dr, dc] = DIR_VECTORS[dir];
                const nr = r + dr;
                const nc = c + dc;
                if (nr < 0 || nr >= this.rows || nc < 0 || nc >= this.cols) continue;

                const neighbor = this.grid[nr][nc];
                const neighborKey = `${nr},${nc}`;
                if (visited.has(neighborKey)) continue;

                // 隣のセルが反対方向に接続しているか確認
                if (neighbor.connects(OPPOSITE[dir])) {
                    neighbor.filled = true;
                    queue.push([nr, nc]);
                }
            }
        }

        return this._getFlowStats();
    }

    _getFlowStats() {
        let totalCells = 0;
        let filledCells = 0;
        let sinkFilled = false;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.grid[r][c];
                totalCells++;
                if (cell.filled) filledCells++;
                if (cell.isSink && cell.filled) sinkFilled = true;
            }
        }

        return {
            totalCells,
            filledCells,
            percentage: Math.round((filledCells / totalCells) * 100),
            sinkFilled,
            complete: sinkFilled,
        };
    }

    getCell(r, c) {
        return this.grid[r][c];
    }

    rotateCell(r, c) {
        const cell = this.grid[r][c];
        if (cell.isSource || cell.isSink) return false;
        cell.rotate();
        return true;
    }
}
