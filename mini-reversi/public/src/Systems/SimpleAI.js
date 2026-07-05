/**
 * SimpleAI.js
 * 重み付け評価関数を用いた簡単なAI
 */

export class SimpleAI {
    constructor() {
        // 盤面の重み付けテーブル
        this.weights = [
            [100, -20, 10,  5,  5, 10, -20, 100],
            [-20, -50, -2, -2, -2, -2, -50, -20],
            [ 10,  -2,  5,  1,  1,  5,  -2,  10],
            [  5,  -2,  1,  0,  0,  1,  -2,   5],
            [  5,  -2,  1,  0,  0,  1,  -2,   5],
            [ 10,  -2,  5,  1,  1,  5,  -2,  10],
            [-20, -50, -2, -2, -2, -2, -50, -20],
            [100, -20, 10,  5,  5, 10, -20, 100]
        ];
    }

    /**
     * 最善手を取得する
     * @param {ReversiLogic} logic 
     * @param {number} color 
     */
    getMove(logic, color) {
        const moves = logic.getValidMoves(color);
        if (moves.length === 0) return null;

        // 重み付けに基づいてスコア計算
        let bestMove = null;
        let maxWeight = -Infinity;

        // 同じ重みの手がある場合にばらつかせるためシャッフル
        const shuffledMoves = moves.sort(() => Math.random() - 0.5);

        for (const move of shuffledMoves) {
            const weight = this.weights[move.y][move.x];
            if (weight > maxWeight) {
                maxWeight = weight;
                bestMove = move;
            }
        }

        return bestMove;
    }
}
