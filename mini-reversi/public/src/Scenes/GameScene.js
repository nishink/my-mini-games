import { sceneManager } from '../Core/SceneManager.js';
import { ReversiLogic, BLACK, WHITE, EMPTY } from '../Systems/ReversiLogic.js';
import { SimpleAI } from '../Systems/SimpleAI.js';

export class GameScene {
    constructor() {
        this.container = document.getElementById('scene-container');
        this.logic = new ReversiLogic();
        this.ai = new SimpleAI();
        this.mode = 'pvp';
        this.isProcessing = false;
    }

    async enter(data) {
        this.mode = data.mode || 'pvp';
        console.log('GameScene entered. Mode:', this.mode);
        this.logic.reset();
        this.isProcessing = false;
        this.renderBase();
        this.updateUI();
        
        // 初回AIチェック（黒がAIの場合や、特殊な開始状態に対応）
        this.checkAI();
    }

    renderBase() {
        this.container.innerHTML = `
            <div class="scene game-scene">
                <div class="game-info">
                    <div class="score-item">
                        <div class="piece-preview black"></div>
                        <span id="black-score">2</span>
                    </div>
                    <div class="score-item">
                        <div class="piece-preview white"></div>
                        <span id="white-score">2</span>
                    </div>
                </div>
                <div id="board" class="board"></div>
                <div id="status-container" class="current-turn">
                    <div id="turn-indicator" class="turn-indicator"></div>
                    <span id="status-text">BLACK's Turn</span>
                </div>
                <div id="message" style="margin-top:10px; color:#f1c40f; min-height:1.2em;"></div>
                <button id="giveup-btn" style="margin-top:20px; width:auto; padding:10px 20px; font-size:1rem;">Give Up</button>
            </div>
        `;

        const boardEl = document.getElementById('board');
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                cell.onclick = () => this.handleCellClick(x, y);
                boardEl.appendChild(cell);
            }
        }

        document.getElementById('giveup-btn').onclick = () => {
            sceneManager.switchScene('Title');
        };
    }

    async handleCellClick(x, y) {
        if (this.isProcessing) return;
        if (this.mode === 'pva' && this.logic.turn === WHITE) {
            console.log('Ignore click: AI turn');
            return;
        }

        const flippable = this.logic.getFlippablePieces(x, y, this.logic.turn);
        if (flippable.length === 0) {
            console.log('Invalid move at', x, y);
            return;
        }

        await this.makeMove(x, y, flippable);
    }

    async makeMove(x, y, flippable) {
        console.log(`Move: ${this.logic.turn === BLACK ? 'BLACK' : 'WHITE'} at (${x}, ${y})`);
        this.isProcessing = true;
        
        // 石を置く
        this.logic.board[y][x] = this.logic.turn;
        this.updateUI();

        // 少し待ってから反転（演出用）
        await new Promise(r => setTimeout(r, 100));

        // 反転
        for (const piece of flippable) {
            this.logic.board[piece.y][piece.x] = this.logic.turn;
        }
        
        this.updateUI();
        await new Promise(r => setTimeout(r, 300));

        const result = this.logic.nextTurn();
        console.log('Next turn result:', result, 'Current logic.turn:', this.logic.turn);
        
        this.isProcessing = false; 
        this.updateUI();

        if (result === 'end') {
            this.endGame();
        } else {
            if (result === 'pass') {
                this.showMessage('PASS!');
                await new Promise(r => setTimeout(r, 1000));
            }
            // AIの手番かチェック
            this.checkAI();
        }
    }

    async checkAI() {
        if (this.mode === 'pva' && this.logic.turn === WHITE && !this.isProcessing) {
            console.log('AI is thinking...');
            this.isProcessing = true;
            await new Promise(r => setTimeout(r, 600)); // AI思考時間

            const move = this.ai.getMove(this.logic, WHITE);
            console.log('AI move:', move);
            if (move) {
                const flippable = this.logic.getFlippablePieces(move.x, move.y, WHITE);
                await this.makeMove(move.x, move.y, flippable);
            } else {
                console.warn('AI has no moves but it is its turn?');
                this.isProcessing = false;
            }
        }
    }

    updateUI() {
        const score = this.logic.getScore();
        const bScoreEl = document.getElementById('black-score');
        const wScoreEl = document.getElementById('white-score');
        if (bScoreEl) bScoreEl.textContent = score.black;
        if (wScoreEl) wScoreEl.textContent = score.white;

        const statusText = document.getElementById('status-text');
        const turnIndicator = document.getElementById('turn-indicator');
        
        if (statusText) {
            statusText.textContent = `${this.logic.turn === BLACK ? 'BLACK' : 'WHITE'}'s Turn`;
            statusText.style.color = '#ecf0f1';
        }
        
        if (turnIndicator) {
            turnIndicator.className = `turn-indicator ${this.logic.turn === BLACK ? 'black' : 'white'}`;
        }

        const cells = document.querySelectorAll('.cell');
        const validMoves = this.logic.getValidMoves(this.logic.turn);

        cells.forEach(cell => {
            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            const pieceType = this.logic.board[y][x];

            cell.innerHTML = '';
            if (pieceType !== EMPTY) {
                const piece = document.createElement('div');
                piece.className = `piece ${pieceType === BLACK ? 'black' : 'white'}`;
                cell.appendChild(piece);
            }

            // 有効な手のハイライト（プレイヤーの手番のみ）
            const isPlayerTurn = (this.mode === 'pvp') || (this.mode === 'pva' && this.logic.turn === BLACK);
            cell.classList.toggle('valid', !this.isProcessing && isPlayerTurn && validMoves.some(m => m.x === x && m.y === y));
        });
    }

    showMessage(text) {
        const msgEl = document.getElementById('message');
        if (msgEl) {
            msgEl.textContent = text;
            setTimeout(() => { msgEl.textContent = ''; }, 2000);
        }
    }

    endGame() {
        const score = this.logic.getScore();
        let winner = 'Draw';
        if (score.black > score.white) winner = 'Black';
        if (score.white > score.black) winner = 'White';

        sceneManager.switchScene('Result', {
            winner,
            black: score.black,
            white: score.white
        });
    }

    update(dt) {}
    exit() {}
}
