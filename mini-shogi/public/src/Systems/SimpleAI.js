export class SimpleAI {
    constructor(playerType = 'gote') {
        this.playerType = playerType; // AIが操作する側 ('gote')
        this.enemyType = playerType === 'sente' ? 'gote' : 'sente';

        // 駒の評価値
        this.pieceValues = {
            'K': 10000,
            'R': 600,
            'B': 500,
            'G': 400,
            'S': 350,
            'P': 100
        };
        // 成った時の価値加算
        this.promotionBonus = {
            'R': 200, // 800
            'B': 200, // 700
            'S': 50,  // 400 (金と同等)
            'P': 300  // 400 (金と同等)
        };
        // 持ち駒の評価値 (盤上より少し控えめにする)
        this.handPieceValues = {
            'R': 550,
            'B': 450,
            'G': 380,
            'S': 330,
            'P': 90
        };
    }

    // 局面の評価関数 (AIの持ち点 - 敵の持ち点)
    evaluateBoard(logic, board = logic.board, hands = logic.hands) {
        let score = 0;

        // 盤上の評価
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const p = board[r][c];
                if (p) {
                    let val = this.pieceValues[p.type] || 0;
                    if (p.promoted && this.promotionBonus[p.type]) {
                        val += this.promotionBonus[p.type];
                    }
                    
                    if (p.player === this.playerType) {
                        score += val;
                    } else {
                        score -= val;
                    }
                }
            }
        }

        // 持ち駒の評価
        hands[this.playerType].forEach(p => {
            score += this.handPieceValues[p.type] || 0;
        });
        hands[this.enemyType].forEach(p => {
            score -= this.handPieceValues[p.type] || 0;
        });

        // 簡易：王手されている場合は減点
        if (logic.isKingUnderAttack(this.playerType, board)) {
            score -= 500;
        }
        if (logic.isKingUnderAttack(this.enemyType, board)) {
            score += 500;
        }

        return score;
    }

    // AIの次の手を決定する (1手読みの最善手)
    selectBestMove(logic) {
        const moves = [];

        // 1. 盤上の移動手をリストアップ
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const p = logic.board[r][c];
                if (p && p.player === this.playerType) {
                    const legalMoves = logic.getLegalMoves(r, c);
                    for (const m of legalMoves) {
                        const canPromo = logic.canPromote(r, m.r, p.type, this.playerType);
                        const mustPromo = logic.mustPromote(m.r, p.type, this.playerType);

                        if (mustPromo) {
                            moves.push({ type: 'move', from: { r, c }, to: m, promote: true });
                        } else if (canPromo) {
                            // 成る手と成らない手の両方を候補にする
                            moves.push({ type: 'move', from: { r, c }, to: m, promote: true });
                            moves.push({ type: 'move', from: { r, c }, to: m, promote: false });
                        } else {
                            moves.push({ type: 'move', from: { r, c }, to: m, promote: false });
                        }
                    }
                }
            }
        }

        // 2. 持ち駒を打つ手をリストアップ
        const uniqueHandTypes = [...new Set(logic.hands[this.playerType].map(p => p.type))];
        for (const type of uniqueHandTypes) {
            const legalDrops = logic.getLegalDrops(this.playerType, type);
            for (const d of legalDrops) {
                moves.push({ type: 'drop', pieceType: type, to: d });
            }
        }

        // 指せる手がない場合
        if (moves.length === 0) return null;

        // 全ての手をシミュレーションして評価
        let bestScore = -Infinity;
        let bestMoves = [];

        for (const move of moves) {
            // 仮の状態で盤面と持ち駒をクローン
            const tempBoard = logic.cloneBoard(logic.board);
            const tempHands = {
                sente: [...logic.hands.sente],
                gote: [...logic.hands.gote]
            };

            if (move.type === 'move') {
                const p = tempBoard[move.from.r][move.from.c];
                const target = tempBoard[move.to.r][move.to.c];
                if (target) {
                    tempHands[this.playerType].push({ type: target.type, player: this.playerType, promoted: false });
                }
                tempBoard[move.to.r][move.to.c] = p;
                tempBoard[move.from.r][move.from.c] = null;
                if (move.promote) {
                    p.promoted = true;
                }
            } else {
                // ドロップ
                tempBoard[move.to.r][move.to.c] = { type: move.pieceType, player: this.playerType, promoted: false };
                const idx = tempHands[this.playerType].findIndex(p => p.type === move.pieceType);
                if (idx !== -1) tempHands[this.playerType].splice(idx, 1);
            }

            const score = this.evaluateBoard(logic, tempBoard, tempHands);

            if (score > bestScore) {
                bestScore = score;
                bestMoves = [move];
            } else if (score === bestScore) {
                bestMoves.push(move);
            }
        }

        // 最良手の中からランダムに選択
        const randomIndex = Math.floor(Math.random() * bestMoves.length);
        return bestMoves[randomIndex];
    }
}
