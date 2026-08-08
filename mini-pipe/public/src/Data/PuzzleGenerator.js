/**
 * PuzzleGenerator - パイプパズルのランダム生成
 *
 * アルゴリズム:
 * 1. ソースとシンクを配置
 * 2. ソースからシンクへのランダムなパスを生成
 * 3. パス上のセルにはパスの方向に合ったパイプを配置
 * 4. 残りのセルにランダムなパイプを配置
 * 5. 全てのパイプをランダムに回転させてシャッフル（ソース・シンク以外）
 */

import { Cell, PIPE_TYPES } from './PipeEngine.js';

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const DIR_VECTORS = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const OPPOSITE = [2, 3, 0, 1];

/**
 * グリッドを生成する
 * @param {number} rows
 * @param {number} cols
 * @returns {{ grid: Cell[][], solution: number[][] }} - solutionは各セルの正解回転
 */
export function generatePuzzle(rows, cols) {
    // ===== 1. ソースとシンクを配置 =====
    // ソースは左辺 or 上辺、シンクは右辺 or 下辺 (対角線的に離す)
    let srcR, srcC, snkR, snkC;
    const side = Math.random() < 0.5;
    if (side) {
        srcR = 0; srcC = rand(0, Math.floor(cols / 2));
        snkR = rows - 1; snkC = rand(Math.ceil(cols / 2), cols - 1);
    } else {
        srcR = rand(0, Math.floor(rows / 2)); srcC = 0;
        snkR = rand(Math.ceil(rows / 2), rows - 1); snkC = cols - 1;
    }

    // ===== 2. A*に近いランダムBFSでパスを生成 =====
    const path = _generatePath(rows, cols, srcR, srcC, snkR, snkC);

    // ===== 3. グリッドを初期化 =====
    const grid = [];
    for (let r = 0; r < rows; r++) {
        grid.push([]);
        for (let c = 0; c < cols; c++) {
            grid[r].push(null);
        }
    }

    // ===== 4. パス上のセルにパイプを配置 =====
    const pathSet = new Set(path.map(([r, c]) => `${r},${c}`));

    for (let i = 0; i < path.length; i++) {
        const [r, c] = path[i];
        const isSource = (r === srcR && c === srcC);
        const isSink = (r === snkR && c === snkC);

        const prevDir = i > 0 ? _getDir(path[i - 1], path[i]) : null;
        const nextDir = i < path.length - 1 ? _getDir(path[i], path[i + 1]) : null;

        let type, rotation;

        if (isSource) {
            // ソース: deadエンド、シンクへ向かう方向
            type = PIPE_TYPES.DEAD;
            rotation = nextDir;
        } else if (isSink) {
            // シンク: deadエンド、水が来る方向に開口を向ける (OPPOSITE[prevDir])
            type = PIPE_TYPES.DEAD;
            rotation = OPPOSITE[prevDir];
        } else {
            // 中間セル
            const fromDir = OPPOSITE[prevDir]; // どこから来たか
            const toDir = nextDir;             // どこへ行くか

            if (fromDir === toDir) {
                // ありえないが念のため直線
                type = PIPE_TYPES.STRAIGHT;
                rotation = (fromDir === 0 || fromDir === 2) ? 0 : 1;
            } else {
                // 曲がるかどうか
                const straightPair = [[0, 2], [2, 0], [1, 3], [3, 1]];
                const isStraight = straightPair.some(([a, b]) => a === fromDir && b === toDir);

                if (isStraight) {
                    type = PIPE_TYPES.STRAIGHT;
                    rotation = (fromDir === 0 || fromDir === 2) ? 0 : 1;
                } else {
                    // elbow: どの向きか
                    type = PIPE_TYPES.ELBOW;
                    rotation = _getElbowRotation(fromDir, toDir);
                }
            }
        }

        grid[r][c] = new Cell(type, rotation, isSource, isSink);
    }

    // ===== 5. 残りのセルをランダムに埋める =====
    const availableTypes = [PIPE_TYPES.STRAIGHT, PIPE_TYPES.ELBOW, PIPE_TYPES.TEE, PIPE_TYPES.CROSS];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === null) {
                const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
                const rotation = Math.floor(Math.random() * 4);
                grid[r][c] = new Cell(type, rotation);
            }
        }
    }

    // ===== 6. 正解の回転を記録 =====
    const solution = grid.map(row => row.map(cell => cell.rotation));

    // ===== 7. ソース・シンク以外をランダムに回転させて問題を作る =====
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = grid[r][c];
            if (!cell.isSource && !cell.isSink) {
                const extraRots = Math.floor(Math.random() * 4);
                for (let i = 0; i < extraRots; i++) {
                    cell.rotate();
                }
            }
        }
    }

    return { grid, solution, srcR, srcC, snkR, snkC };
}

function _generatePath(rows, cols, srcR, srcC, snkR, snkC) {
    // ランダム化されたBFS/DFSでパスを生成
    const visited = new Set();
    visited.add(`${srcR},${srcC}`);

    const stack = [[[srcR, srcC]]];

    while (stack.length > 0) {
        const path = stack.pop();
        const [cr, cc] = path[path.length - 1];

        if (cr === snkR && cc === snkC) {
            return path;
        }

        // ランダムな順序で隣接セルを探索
        const dirs = shuffle([0, 1, 2, 3]);
        for (const dir of dirs) {
            const [dr, dc] = DIR_VECTORS[dir];
            const nr = cr + dr;
            const nc = cc + dc;
            const key = `${nr},${nc}`;

            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (visited.has(key)) continue;

            visited.add(key);
            stack.push([...path, [nr, nc]]);
        }
    }

    // フォールバック: 直線パス
    const path = [];
    let r = srcR, c = srcC;
    while (r !== snkR || c !== snkC) {
        path.push([r, c]);
        if (r < snkR) r++;
        else if (r > snkR) r--;
        else if (c < snkC) c++;
        else c--;
    }
    path.push([snkR, snkC]);
    return path;
}

function _getDir(from, to) {
    const [r1, c1] = from;
    const [r2, c2] = to;
    if (r2 < r1) return 0; // 上
    if (c2 > c1) return 1; // 右
    if (r2 > r1) return 2; // 下
    if (c2 < c1) return 3; // 左
    return 0;
}

function _getElbowRotation(fromDir, toDir) {
    // elbow の接続: rot0=[0,1], rot1=[1,2], rot2=[2,3], rot3=[3,0]
    // fromDir はどこから来た方向(OPPOSITE[prevDir]), toDir は次へ行く方向
    const pairs = {
        '0,1': 0, '1,0': 0,
        '1,2': 1, '2,1': 1,
        '2,3': 2, '3,2': 2,
        '3,0': 3, '0,3': 3,
    };
    return pairs[`${fromDir},${toDir}`] ?? 0;
}
