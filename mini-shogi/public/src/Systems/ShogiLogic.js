export class ShogiLogic {
    constructor() {
        this.reset();
    }

    reset() {
        this.board = Array(5).fill(null).map(() => Array(5).fill(null));
        this.hands = { sente: [], gote: [] };
        this.turn = 'sente';
        this.winner = null;
        this.reason = '';

        // 初期配置 (点対称)
        // 後手 (gote) - 上側(row 0, 1)
        this.board[0][0] = { type: 'K', player: 'gote', promoted: false };
        this.board[0][1] = { type: 'G', player: 'gote', promoted: false };
        this.board[0][2] = { type: 'S', player: 'gote', promoted: false };
        this.board[0][3] = { type: 'B', player: 'gote', promoted: false };
        this.board[0][4] = { type: 'R', player: 'gote', promoted: false };
        this.board[1][4] = { type: 'P', player: 'gote', promoted: false };

        // 先手 (sente) - 下側(row 3, 4)
        this.board[4][0] = { type: 'R', player: 'sente', promoted: false };
        this.board[4][1] = { type: 'B', player: 'sente', promoted: false };
        this.board[4][2] = { type: 'S', player: 'sente', promoted: false };
        this.board[4][3] = { type: 'G', player: 'sente', promoted: false };
        this.board[4][4] = { type: 'K', player: 'sente', promoted: false };
        this.board[3][0] = { type: 'P', player: 'sente', promoted: false };
    }

    cloneBoard(board) {
        return board.map(row => row.map(cell => cell ? { ...cell } : null));
    }

    // 駒の基本的な移動可能範囲（盤外や味方への移動は除外、自殺手判定は含まず）
    getRawMoves(row, col, board = this.board) {
        const piece = board[row][col];
        if (!piece) return [];
        
        const moves = [];
        const player = piece.player;
        const isSente = player === 'sente';
        const forward = isSente ? -1 : 1;

        const addMove = (r, c) => {
            if (r >= 0 && r < 5 && c >= 0 && c < 5) {
                const target = board[r][c];
                if (!target || target.player !== player) {
                    moves.push({ r, c });
                    return !target; // 空マスならtrue（スライド移動は続けられる）、敵駒ならfalse（そこで止まる）
                }
            }
            return false;
        };

        const addLineMoves = (directions) => {
            for (const [dr, dc] of directions) {
                let r = row + dr;
                let c = col + dc;
                while (r >= 0 && r < 5 && c >= 0 && c < 5) {
                    const target = board[r][c];
                    if (!target) {
                        moves.push({ r, c });
                    } else {
                        if (target.player !== player) {
                            moves.push({ r, c });
                        }
                        break; // 駒に当たったらそこでスライド終了
                    }
                    r += dr;
                    c += dc;
                }
            }
        };

        if (piece.type === 'K') {
            // 周囲8マスに1マス
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr !== 0 || dc !== 0) addMove(row + dr, col + dc);
                }
            }
        } else if (piece.type === 'G' || (piece.type === 'S' && piece.promoted) || (piece.type === 'P' && piece.promoted)) {
            // 金・成銀・と金の動き (前後左右、斜め前1マス)
            addMove(row + forward, col);     // 前
            addMove(row + forward, col - 1); // 左前
            addMove(row + forward, col + 1); // 右前
            addMove(row, col - 1);           // 左
            addMove(row, col + 1);           // 右
            addMove(row - forward, col);     // 後
        } else if (piece.type === 'S' && !piece.promoted) {
            // 銀の動き (前、斜め4方向)
            addMove(row + forward, col);     // 前
            addMove(row + forward, col - 1); // 左前
            addMove(row + forward, col + 1); // 右前
            addMove(row - forward, col - 1); // 左後
            addMove(row - forward, col + 1); // 右後
        } else if (piece.type === 'P' && !piece.promoted) {
            // 歩の動き (前1マス)
            addMove(row + forward, col);
        } else if (piece.type === 'R') {
            // 飛車
            addLineMoves([[1, 0], [-1, 0], [0, 1], [0, -1]]);
            if (piece.promoted) {
                // 竜の追加の動き (斜め1マス)
                addMove(row - 1, col - 1);
                addMove(row - 1, col + 1);
                addMove(row + 1, col - 1);
                addMove(row + 1, col + 1);
            }
        } else if (piece.type === 'B') {
            // 角
            addLineMoves([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
            if (piece.promoted) {
                // 馬の追加の動き (上下左右1マス)
                addMove(row - 1, col);
                addMove(row + 1, col);
                addMove(row, col - 1);
                addMove(row, col + 1);
            }
        }

        return moves;
    }

    // 自殺手（指した結果、自玉が王手される状態になる手）を排除した合法手
    getLegalMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece || piece.player !== this.turn) return [];

        const rawMoves = this.getRawMoves(row, col);
        const legalMoves = [];

        for (const move of rawMoves) {
            // 仮移動
            const tempBoard = this.cloneBoard(this.board);
            tempBoard[move.r][move.c] = tempBoard[row][col];
            tempBoard[row][col] = null;

            if (!this.isKingUnderAttack(this.turn, tempBoard)) {
                legalMoves.push(move);
            }
        }

        return legalMoves;
    }

    // 指定されたプレイヤーの玉が攻撃されている（王手されている）か
    isKingUnderAttack(player, board) {
        let kingRow = -1;
        let kingCol = -1;
        
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const p = board[r][c];
                if (p && p.type === 'K' && p.player === player) {
                    kingRow = r;
                    kingCol = c;
                    break;
                }
            }
            if (kingRow !== -1) break;
        }

        if (kingRow === -1) return false; // 玉不在（シミュレーション時など）

        const enemyPlayer = player === 'sente' ? 'gote' : 'sente';
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const p = board[r][c];
                if (p && p.player === enemyPlayer) {
                    const moves = this.getRawMoves(r, c, board);
                    if (moves.some(m => m.r === kingRow && m.c === kingCol)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // 持ち駒を打てる合法マス
    getLegalDrops(player, pieceType) {
        if (player !== this.turn) return [];
        const drops = [];
        const isSente = player === 'sente';

        // 二歩判定用の列取得
        const pawnCols = [];
        if (pieceType === 'P') {
            for (let c = 0; c < 5; c++) {
                let hasPawn = false;
                for (let r = 0; r < 5; r++) {
                    const p = this.board[r][c];
                    if (p && p.player === player && p.type === 'P' && !p.promoted) {
                        hasPawn = true;
                        break;
                    }
                }
                if (hasPawn) pawnCols.push(c);
            }
        }

        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (!this.board[r][c]) {
                    // 行き所のない駒のチェック
                    if (pieceType === 'P') {
                        if (isSente && r === 0) continue; // 最奥に歩は打てない
                        if (!isSente && r === 4) continue;
                        if (pawnCols.includes(c)) continue; // 二歩禁止
                    }

                    // 自殺手シミュレーション
                    const tempBoard = this.cloneBoard(this.board);
                    tempBoard[r][c] = { type: pieceType, player: player, promoted: false };

                    if (!this.isKingUnderAttack(player, tempBoard)) {
                        drops.push({ r, c });
                    }
                }
            }
        }
        return drops;
    }

    // 移動の実行
    movePiece(fromR, fromC, toR, toC, promote = false) {
        if (this.winner) return false;

        const piece = this.board[fromR][fromC];
        if (!piece || piece.player !== this.turn) return false;

        // 移動先に敵の駒がある場合は持ち駒にする
        const target = this.board[toR][toC];
        if (target) {
            // 成っている駒は元に戻して持ち駒にする
            const newHandPiece = { type: target.type, player: this.turn, promoted: false };
            this.hands[this.turn].push(newHandPiece);
        }

        // 駒の移動
        this.board[toR][toC] = piece;
        this.board[fromR][fromC] = null;

        // 成りの処理
        if (promote || this.mustPromote(toR, piece.type, this.turn)) {
            piece.promoted = true;
        }

        this.postTurnCheck();
        return true;
    }

    // 持ち駒を打つ実行
    dropPiece(pieceType, toR, toC) {
        if (this.winner) return false;

        const hand = this.hands[this.turn];
        const index = hand.findIndex(p => p.type === pieceType);
        if (index === -1) return false;

        // 盤面に配置
        this.board[toR][toC] = { type: pieceType, player: this.turn, promoted: false };
        // 持ち駒から削除
        hand.splice(index, 1);

        this.postTurnCheck();
        return true;
    }

    // 成ることが可能か
    canPromote(fromR, toR, pieceType, player) {
        if (['K', 'G'].includes(pieceType)) return false; // 王・金は成れない
        const isSente = player === 'sente';
        const enemyZone = isSente ? 0 : 4;
        
        // 移動前か移動後が敵陣ゾーンにあるか
        return fromR === enemyZone || toR === enemyZone;
    }

    // 強制的に成る必要があるか (歩が最奥に達した時)
    mustPromote(toR, pieceType, player) {
        if (pieceType === 'P') {
            const isSente = player === 'sente';
            return toR === (isSente ? 0 : 4);
        }
        return false;
    }

    // ターン終了後の状態チェックと手番切り替え
    postTurnCheck() {
        const lastPlayer = this.turn;
        // 先に手番を切り替える
        this.turn = this.turn === 'sente' ? 'gote' : 'sente';
        
        // 切り替え後の手番（手番が移ったプレイヤー）に合法手があるかチェック
        if (!this.hasAnyLegalMoves(this.turn)) {
            // 合法手がなく、かつ王手がかかっているなら「詰み」で勝者確定
            if (this.isKingUnderAttack(this.turn, this.board)) {
                this.winner = lastPlayer;
                this.reason = `${lastPlayer === 'sente' ? '先手' : '後手'}の勝利（詰み）`;
            } else {
                // 王手ではないのに動かせない（ステイルメイト）場合も、将棋ルール上動かせない側の負け
                this.winner = lastPlayer;
                this.reason = `${lastPlayer === 'sente' ? '先手' : '後手'}の勝利（手詰まり）`;
            }
            return;
        }
    }

    // 指定プレイヤーが何かしら指せる手があるか
    hasAnyLegalMoves(player) {
        // 盤上の移動
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const p = this.board[r][c];
                if (p && p.player === player) {
                    if (this.getLegalMoves(r, c).length > 0) return true;
                }
            }
        }
        // 持ち駒を打つ
        const hand = this.hands[player];
        const uniqueTypes = [...new Set(hand.map(p => p.type))];
        for (const type of uniqueTypes) {
            if (this.getLegalDrops(player, type).length > 0) return true;
        }

        return false;
    }
}
