import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';
import { ShogiLogic } from '../Systems/ShogiLogic.js';
import { SimpleAI } from '../Systems/SimpleAI.js';

export class GameScene {
    constructor() {
        this.container = document.getElementById('scene-container');
        this.logic = new ShogiLogic();
        this.ai = null;
        this.selected = null; // { type: 'board', r, c } または { type: 'hand', pieceType }
        this.highlightedMoves = [];
        this.mode = 'pvp';
        this.isAILinking = false; // AIが考え中の間、操作をロックする
    }

    async enter(data) {
        this.mode = data.mode || 'pvp';
        this.logic.reset();
        this.ai = this.mode === 'pva' ? new SimpleAI('gote') : null;
        this.selected = null;
        this.highlightedMoves = [];
        this.isAILinking = false;

        this.initUI();
        this.render();
    }

    initUI() {
        this.container.innerHTML = `
            <div class="scene game-scene">
                <!-- 後手情報 -->
                <div class="player-panel gote-panel">
                    <div class="player-info">
                        <div class="turn-indicator gote-indicator"></div>
                        <span class="player-name">${this.mode === 'pva' ? 'AI (Gote)' : '後手 (Gote)'}</span>
                    </div>
                    <div class="hand-container" id="gote-hand"></div>
                </div>

                <!-- 将棋盤 -->
                <div class="board-container">
                    <div class="shogi-board" id="shogi-board"></div>
                </div>

                <!-- 先手情報 -->
                <div class="player-panel sente-panel">
                    <div class="player-info">
                        <div class="turn-indicator sente-indicator"></div>
                        <span class="player-name">${this.mode === 'pva' ? 'あなた (Sente)' : '先手 (Sente)'}</span>
                    </div>
                    <div class="hand-container" id="sente-hand"></div>
                </div>

                <!-- 成り選択モーダル -->
                <div id="promote-modal" class="modal hidden">
                    <div class="modal-content">
                        <h3>成りますか？</h3>
                        <div class="modal-buttons">
                            <button id="promote-yes-btn">成る</button>
                            <button id="promote-no-btn">成らず</button>
                        </div>
                    </div>
                </div>

                <!-- 王手表示エフェクト -->
                <div id="check-alert" class="check-alert hidden">王手！</div>
            </div>
        `;

        document.getElementById('promote-yes-btn').addEventListener('click', () => this.handlePromoteChoice(true));
        document.getElementById('promote-no-btn').addEventListener('click', () => this.handlePromoteChoice(false));
    }

    render() {
        this.renderBoard();
        this.renderHands();
        this.updateIndicators();
        this.checkCheckAlert();
    }

    // 盤面の描画
    renderBoard() {
        const boardElem = document.getElementById('shogi-board');
        boardElem.innerHTML = '';

        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const cell = document.createElement('div');
                cell.className = 'board-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;

                // ハイライト表示
                const isHighlighted = this.highlightedMoves.some(m => m.r === r && m.c === c);
                if (isHighlighted) {
                    cell.classList.add('highlighted');
                }

                // 駒の描画
                const p = this.logic.board[r][c];
                if (p) {
                    const pieceElem = document.createElement('div');
                    pieceElem.className = `shogi-piece ${p.player}`;
                    if (p.promoted) pieceElem.classList.add('promoted');
                    
                    // 選択中ならクラス付与
                    if (this.selected && this.selected.type === 'board' && this.selected.r === r && this.selected.col === c) {
                        pieceElem.classList.add('selected');
                    }

                    pieceElem.textContent = this.getPieceChar(p.type, p.promoted, p.player);
                    cell.appendChild(pieceElem);
                }

                cell.addEventListener('click', () => this.handleCellClick(r, c));
                boardElem.appendChild(cell);
            }
        }
    }

    // 持ち駒の描画
    renderHands() {
        this.renderHandForPlayer('sente', document.getElementById('sente-hand'));
        this.renderHandForPlayer('gote', document.getElementById('gote-hand'));
    }

    renderHandForPlayer(player, container) {
        container.innerHTML = '';
        const hand = this.logic.hands[player];

        // 持ち駒を種類ごとにグループ化して個数を出すと綺麗だが、ミニ将棋なので並べるだけでも十分
        // ただし選択しやすさのために並べて描画する
        hand.forEach((p, index) => {
            const pieceElem = document.createElement('div');
            pieceElem.className = `shogi-piece hand-piece ${player}`;
            
            if (this.selected && this.selected.type === 'hand' && this.selected.player === player && this.selected.index === index) {
                pieceElem.classList.add('selected');
            }

            pieceElem.textContent = this.getPieceChar(p.type, false, player);
            pieceElem.addEventListener('click', (e) => {
                e.stopPropagation(); // 盤面クリックイベントへの伝播を防ぐ
                this.handleHandClick(player, index);
            });
            container.appendChild(pieceElem);
        });
    }

    // 手番・状況インジケータの更新
    updateIndicators() {
        const isSenteTurn = this.logic.turn === 'sente';
        document.querySelector('.sente-indicator').classList.toggle('active', isSenteTurn);
        document.querySelector('.gote-indicator').classList.toggle('active', !isSenteTurn);
    }

    // 王手警告の表示チェック
    checkCheckAlert() {
        const alertElem = document.getElementById('check-alert');
        const underAttack = this.logic.isKingUnderAttack(this.logic.turn, this.logic.board);
        
        if (underAttack && !this.logic.winner) {
            alertElem.classList.remove('hidden');
            // 玉の背景を赤く明滅させるために、王手されている玉のセルに警告クラスをつける
            const cells = document.querySelectorAll('.board-cell');
            cells.forEach(cell => {
                const r = parseInt(cell.dataset.row);
                const c = parseInt(cell.dataset.col);
                const p = this.logic.board[r][c];
                if (p && p.type === 'K' && p.player === this.logic.turn) {
                    cell.classList.add('check-warning');
                }
            });
        } else {
            alertElem.classList.add('hidden');
        }
    }

    // 駒の文字表現を取得
    getPieceChar(type, promoted, player) {
        if (promoted) {
            switch (type) {
                case 'R': return '竜';
                case 'B': return '馬';
                case 'S': return '全';
                case 'P': return 'と';
            }
        } else {
            switch (type) {
                case 'K': return player === 'gote' ? '王' : '玉';
                case 'R': return '飛';
                case 'B': return '角';
                case 'G': return '金';
                case 'S': return '銀';
                case 'P': return '歩';
            }
        }
        return '';
    }

    // 盤面セルのクリック処理
    handleCellClick(r, c) {
        if (this.isAILinking || this.logic.winner) return;

        const isHighlighted = this.highlightedMoves.some(m => m.r === r && m.c === c);

        if (isHighlighted && this.selected) {
            // 移動/打つを実行
            if (this.selected.type === 'board') {
                const fromR = this.selected.r;
                const fromC = this.selected.col;
                const piece = this.logic.board[fromR][fromC];

                // 成り判定の確認
                if (this.logic.canPromote(fromR, r, piece.type, this.logic.turn)) {
                    if (this.logic.mustPromote(r, piece.type, this.logic.turn)) {
                        // 強制成り
                        this.executeMove(fromR, fromC, r, c, true);
                    } else {
                        // ユーザーに選択させるモーダルを表示
                        this.pendingMove = { fromR, fromC, toR: r, toC: c };
                        this.showPromoteModal();
                    }
                } else {
                    this.executeMove(fromR, fromC, r, c, false);
                }
            } else if (this.selected.type === 'hand') {
                this.executeDrop(this.selected.pieceType, r, c);
            }
        } else {
            // 選択の変更
            const p = this.logic.board[r][c];
            if (p && p.player === this.logic.turn) {
                soundManager.playSelect();
                this.selected = { type: 'board', r, col: c };
                this.highlightedMoves = this.logic.getLegalMoves(r, c);
            } else {
                // 選択解除
                this.selected = null;
                this.highlightedMoves = [];
            }
            this.render();
        }
    }

    // 持ち駒のクリック処理
    handleHandClick(player, index) {
        if (this.isAILinking || this.logic.winner) return;
        if (player !== this.logic.turn) return;

        soundManager.playSelect();
        const p = this.logic.hands[player][index];
        this.selected = { type: 'hand', player, index, pieceType: p.type };
        this.highlightedMoves = this.logic.getLegalDrops(player, p.type);
        this.render();
    }

    showPromoteModal() {
        document.getElementById('promote-modal').classList.remove('hidden');
    }

    hidePromoteModal() {
        document.getElementById('promote-modal').classList.add('hidden');
    }

    handlePromoteChoice(promote) {
        this.hidePromoteModal();
        if (this.pendingMove) {
            const { fromR, fromC, toR, toC } = this.pendingMove;
            this.executeMove(fromR, fromC, toR, toC, promote);
            this.pendingMove = null;
        }
    }

    // 移動実行
    executeMove(fromR, fromC, toR, toC, promote) {
        const success = this.logic.movePiece(fromR, fromC, toR, toC, promote);
        if (success) {
            soundManager.playHit();
            this.selected = null;
            this.highlightedMoves = [];
            this.render();
            this.checkGameStatus();
        }
    }

    // ドロップ実行
    executeDrop(pieceType, toR, toC) {
        const success = this.logic.dropPiece(pieceType, toR, toC);
        if (success) {
            soundManager.playHit();
            this.selected = null;
            this.highlightedMoves = [];
            this.render();
            this.checkGameStatus();
        }
    }

    // ゲームオーバー判定およびAIへのトス
    checkGameStatus() {
        if (this.logic.winner) {
            soundManager.playHeal(); // 勝利時SEの代わり
            setTimeout(() => {
                sceneManager.switchScene('Result', {
                    winner: this.logic.winner === 'sente' ? (this.mode === 'pva' ? 'player' : 'sente') : 'gote',
                    mode: this.mode,
                    reason: this.logic.reason
                });
            }, 2000);
            return;
        }

        // AIターンならAIを実行
        if (this.mode === 'pva' && this.logic.turn === 'gote') {
            this.triggerAIMove();
        }
    }

    // AIの指し手実行
    triggerAIMove() {
        this.isAILinking = true;

        // 思考演出（1秒待機）
        setTimeout(() => {
            const bestMove = this.ai.selectBestMove(this.logic);
            if (bestMove) {
                if (bestMove.type === 'move') {
                    this.logic.movePiece(bestMove.from.r, bestMove.from.c, bestMove.to.r, bestMove.to.c, bestMove.promote);
                } else {
                    this.logic.dropPiece(bestMove.pieceType, bestMove.to.r, bestMove.to.c);
                }
                soundManager.playHit();
            }

            this.isAILinking = false;
            this.render();
            
            // AIの手の後にゲーム終了チェック
            if (this.logic.winner) {
                soundManager.playCancel(); // 敗北時SE代わり
                setTimeout(() => {
                    sceneManager.switchScene('Result', {
                        winner: this.logic.winner === 'sente' ? 'player' : 'gote',
                        mode: this.mode,
                        reason: this.logic.reason
                    });
                }, 2000);
            }
        }, 1000);
    }

    update(dt) {}
    exit() {}
}
