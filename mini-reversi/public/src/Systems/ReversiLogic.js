/**
 * ReversiLogic.js
 * リバーシのゲームロジック（盤面管理、合法手判定、石の反転）
 */

export const EMPTY = 0;
export const BLACK = 1;
export const WHITE = 2;

export class ReversiLogic {
    constructor() {
        this.board = Array(8).fill(null).map(() => Array(8).fill(EMPTY));
        this.turn = BLACK;
        this.reset();
    }

    reset() {
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                this.board[y][x] = EMPTY;
            }
        }
        // 初期配置
        this.board[3][3] = WHITE;
        this.board[3][4] = BLACK;
        this.board[4][3] = BLACK;
        this.board[4][4] = WHITE;
        this.turn = BLACK;
    }

    /**
     * 指定した位置に石を置けるかチェックし、置ける場合は挟んだ石をリストで返す
     * @param {number} x 
     * @param {number} y 
     * @param {number} color 
     * @returns {Array} 挟んだ石の座標 [{x, y}, ...]
     */
    getFlippablePieces(x, y, color) {
        if (this.board[y][x] !== EMPTY) return [];

        const opponent = color === BLACK ? WHITE : BLACK;
        const flippable = [];

        // 8方向をチェック
        const directions = [
            [0, 1], [0, -1], [1, 0], [-1, 0],
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];

        for (const [dx, dy] of directions) {
            let tempFlippable = [];
            let currX = x + dx;
            let currY = y + dy;

            while (currX >= 0 && currX < 8 && currY >= 0 && currY < 8) {
                if (this.board[currY][currX] === opponent) {
                    tempFlippable.push({ x: currX, y: currY });
                } else if (this.board[currY][currX] === color) {
                    // 自分の石で終わった場合、リストに追加
                    if (tempFlippable.length > 0) {
                        flippable.push(...tempFlippable);
                    }
                    break;
                } else {
                    // 空白だった場合、この方向は失敗
                    break;
                }
                currX += dx;
                currY += dy;
            }
        }

        return flippable;
    }

    /**
     * 指定した位置に石を置く
     * @returns {boolean} 成功したかどうか
     */
    placePiece(x, y) {
        const flippable = this.getFlippablePieces(x, y, this.turn);
        if (flippable.length === 0) return false;

        this.board[y][x] = this.turn;
        for (const piece of flippable) {
            this.board[piece.y][piece.x] = this.turn;
        }

        return true;
    }

    /**
     * 有効な手のリストを取得
     */
    getValidMoves(color) {
        const moves = [];
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (this.getFlippablePieces(x, y, color).length > 0) {
                    moves.push({ x, y });
                }
            }
        }
        return moves;
    }

    /**
     * スコア（石の数）を集計
     */
    getScore() {
        let black = 0;
        let white = 0;
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (this.board[y][x] === BLACK) black++;
                if (this.board[y][x] === WHITE) white++;
            }
        }
        return { black, white };
    }

    /**
     * 次の手番へ。パスが必要な場合は自動でスキップ。
     * @returns {string|null} 'pass' if pass occurred, 'end' if game over, null otherwise
     */
    nextTurn() {
        const nextColor = this.turn === BLACK ? WHITE : BLACK;
        if (this.getValidMoves(nextColor).length > 0) {
            this.turn = nextColor;
            return null;
        } else {
            // パス
            if (this.getValidMoves(this.turn).length > 0) {
                // 自分はまだ打てる場合、相手をパス
                return 'pass';
            } else {
                // 両方打てない場合、終了
                return 'end';
            }
        }
    }
}
