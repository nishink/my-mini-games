import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';
import { input } from '../Core/Input.js';

export class GameScene {
    constructor() {
        this.container = document.getElementById('scene-container');
        this.rows = 9;
        this.cols = 9;
        this.totalMines = 10;
    }

    async enter() {
        this.board = [];
        this.firstClick = true;
        this.status = 'playing'; // 'playing' | 'win' | 'lose'
        this.mode = 'dig'; // 'dig' | 'flag'
        this.elapsedTime = 0;
        this.timerId = null;
        this.remainingMines = this.totalMines;

        this.initBoard();
        this.renderLayout();
        this.setupEventListeners();
        this.updateCounters();
    }

    initBoard() {
        this.board = [];
        for (let r = 0; r < this.rows; r++) {
            const row = [];
            for (let c = 0; c < this.cols; c++) {
                row.push({
                    r,
                    c,
                    isMine: false,
                    isOpened: false,
                    isFlagged: false,
                    neighborMines: 0
                });
            }
            this.board.push(row);
        }
    }

    renderLayout() {
        this.container.innerHTML = `
            <div class="scene game-scene">
                <header class="game-header">
                    <button id="game-back-btn" class="icon-btn">◀</button>
                    <div class="header-counters">
                        <div class="counter-box">
                            <span class="emoji">🚩</span>
                            <span id="mine-counter">${this.remainingMines}</span>
                        </div>
                        <div class="counter-box">
                            <span class="emoji">⏱️</span>
                            <span id="timer-counter">000</span>
                        </div>
                    </div>
                    <button id="game-reset-btn" class="icon-btn">🔄</button>
                </header>

                <div class="board-outer">
                    <div id="mines-grid" class="mines-grid"></div>
                </div>

                <div class="control-panel">
                    <button id="mode-dig-btn" class="mode-btn active">
                        <span class="mode-icon">⛏️</span> 掘る (Dig)
                    </button>
                    <button id="mode-flag-btn" class="mode-btn">
                        <span class="mode-icon">🚩</span> 旗 (Flag)
                    </button>
                </div>
            </div>
        `;

        this.gridElement = document.getElementById('mines-grid');
        this.drawGrid();
    }

    drawGrid() {
        this.gridElement.innerHTML = '';
        
        // CSS Gridのテンプレートを設定
        this.gridElement.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;
        this.gridElement.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.board[r][c];
                const cellElement = document.createElement('div');
                cellElement.className = 'grid-cell';
                cellElement.dataset.row = r;
                cellElement.dataset.col = c;

                if (cell.isOpened) {
                    cellElement.classList.add('opened');
                    if (cell.isMine) {
                        cellElement.classList.add('mine');
                        cellElement.innerHTML = '💥';
                    } else if (cell.neighborMines > 0) {
                        cellElement.classList.add(`num-${cell.neighborMines}`);
                        cellElement.textContent = cell.neighborMines;
                    }
                } else {
                    if (cell.isFlagged) {
                        cellElement.classList.add('flagged');
                        cellElement.innerHTML = '🚩';
                    }
                }

                cellElement.onclick = () => this.handleCellClick(r, c);
                // スマホ・PCの両対応として右クリックや長押しにも対応（オプショナル）
                cellElement.oncontextmenu = (e) => {
                    e.preventDefault();
                    this.toggleFlag(r, c);
                };

                this.gridElement.appendChild(cellElement);
            }
        }
    }

    setupEventListeners() {
        document.getElementById('game-back-btn').onclick = () => {
            soundManager.playCancel();
            this.stopTimer();
            sceneManager.switchScene('Title');
        };

        document.getElementById('game-reset-btn').onclick = () => {
            soundManager.playOk();
            this.stopTimer();
            this.enter();
        };

        const digBtn = document.getElementById('mode-dig-btn');
        const flagBtn = document.getElementById('mode-flag-btn');

        digBtn.onclick = () => {
            soundManager.playSelect();
            this.setMode('dig');
        };

        flagBtn.onclick = () => {
            soundManager.playSelect();
            this.setMode('flag');
        };
    }

    setMode(newMode) {
        this.mode = newMode;
        const digBtn = document.getElementById('mode-dig-btn');
        const flagBtn = document.getElementById('mode-flag-btn');

        if (this.mode === 'dig') {
            digBtn.classList.add('active');
            flagBtn.classList.remove('active');
        } else {
            flagBtn.classList.add('active');
            digBtn.classList.remove('active');
        }
    }

    handleCellClick(r, c) {
        if (this.status !== 'playing') return;

        if (this.mode === 'dig') {
            this.openCell(r, c);
        } else {
            this.toggleFlag(r, c);
        }
    }

    toggleFlag(r, c) {
        if (this.status !== 'playing') return;
        const cell = this.board[r][c];
        if (cell.isOpened) return;

        cell.isFlagged = !cell.isFlagged;
        soundManager.playFlag();

        // 残り地雷数カウントの調整
        if (cell.isFlagged) {
            this.remainingMines--;
        } else {
            this.remainingMines++;
        }

        this.updateCounters();
        this.drawGrid();
    }

    openCell(r, c) {
        const cell = this.board[r][c];
        if (cell.isOpened || cell.isFlagged) return;

        // 1. 初回クリック時の地雷配置（ファーストクリック安全保証）
        if (this.firstClick) {
            this.firstClick = false;
            this.generateMines(r, c);
            this.calculateNeighbors();
            this.startTimer();
        }

        cell.isOpened = true;
        soundManager.playClick();

        // 2. 地雷を踏んだ場合
        if (cell.isMine) {
            this.gameOver();
            return;
        }

        // 3. 周囲の地雷数が0の場合、自動で隣接マスを開ける（洪水埋め）
        if (cell.neighborMines === 0) {
            this.floodFill(r, c);
        }

        this.drawGrid();

        // 4. 勝利判定
        if (this.checkWin()) {
            this.gameWin();
        }
    }

    floodFill(r, c) {
        const queue = [{ r, c }];
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = current.r + dr;
                    const nc = current.c + dc;
                    
                    if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                        const neighbor = this.board[nr][nc];
                        if (!neighbor.isOpened && !neighbor.isMine && !neighbor.isFlagged) {
                            neighbor.isOpened = true;
                            if (neighbor.neighborMines === 0) {
                                queue.push({ r: nr, c: nc });
                            }
                        }
                    }
                }
            }
        }
    }

    generateMines(startRow, startCol) {
        let placedMines = 0;
        
        while (placedMines < this.totalMines) {
            const r = Math.floor(Math.random() * this.rows);
            const c = Math.floor(Math.random() * this.cols);

            // スタート位置およびその周囲8マスには配置しない
            const isStartArea = Math.abs(r - startRow) <= 1 && Math.abs(c - startCol) <= 1;

            if (!this.board[r][c].isMine && !isStartArea) {
                this.board[r][c].isMine = true;
                placedMines++;
            }
        }
    }

    calculateNeighbors() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c].isMine) continue;

                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                            if (this.board[nr][nc].isMine) count++;
                        }
                    }
                }
                this.board[r][c].neighborMines = count;
            }
        }
    }

    checkWin() {
        let openedCount = 0;
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c].isOpened) openedCount++;
            }
        }
        // 地雷以外のすべてのマスが開いていれば勝利
        return openedCount === (this.rows * this.cols) - this.totalMines;
    }

    gameOver() {
        this.status = 'lose';
        this.stopTimer();
        soundManager.playExplosion();

        // 全ての地雷をオープンにする
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.board[r][c];
                if (cell.isMine) {
                    cell.isOpened = true;
                }
            }
        }
        this.drawGrid();

        // 爆発演出を見せるための猶予
        setTimeout(() => {
            let openedCount = 0;
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    if (this.board[r][c].isOpened && !this.board[r][c].isMine) openedCount++;
                }
            }
            sceneManager.switchScene('Result', {
                status: 'lose',
                time: this.elapsedTime,
                openedCells: openedCount
            });
        }, 1500);
    }

    gameWin() {
        this.status = 'win';
        this.stopTimer();

        // 未オープンの地雷マスすべてに自動で旗を立てる
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.board[r][c];
                if (cell.isMine) {
                    cell.isFlagged = true;
                }
            }
        }
        this.remainingMines = 0;
        this.updateCounters();
        this.drawGrid();

        setTimeout(() => {
            sceneManager.switchScene('Result', {
                status: 'win',
                time: this.elapsedTime,
                openedCells: (this.rows * this.cols) - this.totalMines
            });
        }, 1000);
    }

    startTimer() {
        this.elapsedTime = 0;
        const timerCounter = document.getElementById('timer-counter');
        this.timerId = setInterval(() => {
            this.elapsedTime++;
            if (this.elapsedTime > 999) {
                this.elapsedTime = 999;
                this.stopTimer();
            }
            timerCounter.textContent = String(this.elapsedTime).padStart(3, '0');
        }, 1000);
    }

    stopTimer() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }

    updateCounters() {
        const mineCounter = document.getElementById('mine-counter');
        if (mineCounter) {
            // マイナス表記も許容（旗の立てすぎ）
            mineCounter.textContent = this.remainingMines;
        }
    }

    update(dt) {
        // キーボードでのモード切り替えチェック (Fキー または Space)
        if (input.isPressed('f') || input.isPressed(' ')) {
            input.reset(); // トグルを繰り返さないために入力をクリア
            const newMode = this.mode === 'dig' ? 'flag' : 'dig';
            soundManager.playSelect();
            this.setMode(newMode);
        }
    }

    exit() {
        this.stopTimer();
    }
}
