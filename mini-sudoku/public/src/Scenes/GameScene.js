import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';

export class GameScene {
    constructor() {
        this.puzzle = null;
        this.difficulty = 'easy';
        this.initialGrid = [];
        this.currentGrid = [];
        this.notesGrid = [];
        this.selectedCell = null; // { r, c }
        this.isNoteMode = false;
        this.history = [];
        this.timer = 0;
        this.timerInterval = null;
        this.mistakes = 0;
        this.isCleared = false;
    }

    async enter(data = {}) {
        this.puzzle = data.puzzle;
        this.difficulty = data.difficulty || 'easy';

        // Deep copy grid data
        this.initialGrid = this.puzzle.puzzle.map(row => [...row]);
        this.currentGrid = this.puzzle.puzzle.map(row => [...row]);
        this.notesGrid = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));
        
        this.selectedCell = null;
        this.isNoteMode = false;
        this.history = [];
        this.timer = 0;
        this.mistakes = 0;
        this.isCleared = false;

        this.renderLayout();
        this.startTimer();
        this.setupEventListeners();
    }

    renderLayout() {
        const container = document.getElementById('scene-container');
        container.innerHTML = `
            <div class="game-scene">
                <header class="game-header">
                    <button id="stage-back-btn" class="btn btn-secondary btn-sm">
                        ⬅️ 選択画面へ
                    </button>

                    <div class="game-status">
                        <span class="status-item">⏱️ <span id="timer-display">00:00</span></span>
                        <span class="status-item">⚠️ ミス: <span id="mistake-display">0</span></span>
                    </div>

                    <div class="header-actions">
                        <button id="undo-btn" class="btn btn-secondary btn-sm" title="1手戻す [U]">
                            ↩️ 戻す
                        </button>
                        <button id="hint-btn" class="btn btn-gold btn-sm" title="ヒント [H]">
                            💡 ヒント
                        </button>
                    </div>
                </header>

                <div class="puzzle-title-bar">
                    <h3>${this.puzzle.title}</h3>
                </div>

                <!-- 数独 9x9 盤面 -->
                <div class="sudoku-board-wrapper">
                    <div class="sudoku-board" id="sudoku-board">
                        ${this.renderBoardHTML()}
                    </div>
                </div>

                <!-- 操作キーパッド -->
                <div class="keypad-container">
                    <div class="action-bar">
                        <button id="note-toggle-btn" class="action-btn">
                            ✏️ メモ (OFF)
                        </button>
                        <button id="erase-btn" class="action-btn">
                            🧹 消去
                        </button>
                    </div>

                    <div class="numpad">
                        ${[1,2,3,4,5,6,7,8,9].map(n => `
                            <button class="num-btn" data-num="${n}">${n}</button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderBoardHTML() {
        let html = '';
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const isInitial = this.initialGrid[r][c] !== 0;
                const val = this.currentGrid[r][c];

                let classes = 'sudoku-cell';
                if (isInitial) classes += ' initial';
                if ((c + 1) % 3 === 0 && c < 8) classes += ' border-right-bold';
                if ((r + 1) % 3 === 0 && r < 8) classes += ' border-bottom-bold';

                html += `
                    <div class="${classes}" data-r="${r}" data-c="${c}" id="cell-${r}-${c}">
                        ${this.getCellInnerContent(r, c)}
                    </div>
                `;
            }
        }
        return html;
    }

    getCellInnerContent(r, c) {
        const val = this.currentGrid[r][c];
        if (val !== 0) {
            return `<span class="cell-value">${val}</span>`;
        }

        const notes = this.notesGrid[r][c];
        if (notes.size > 0) {
            let noteHtml = '<div class="notes-grid">';
            for (let i = 1; i <= 9; i++) {
                noteHtml += `<span class="note-num">${notes.has(i) ? i : ''}</span>`;
            }
            noteHtml += '</div>';
            return noteHtml;
        }

        return '';
    }

    setupEventListeners() {
        // Top Buttons
        document.getElementById('stage-back-btn').addEventListener('click', () => {
            soundManager.playCancel();
            sceneManager.switchScene('DifficultySelect', { difficulty: this.difficulty });
        });

        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('hint-btn').addEventListener('click', () => this.useHint());

        // Note Toggle & Erase
        const noteBtn = document.getElementById('note-toggle-btn');
        noteBtn.addEventListener('click', () => {
            this.isNoteMode = !this.isNoteMode;
            soundManager.playClick();
            noteBtn.innerHTML = this.isNoteMode ? '✏️ メモ (ON)' : '✏️ メモ (OFF)';
            noteBtn.classList.toggle('active', this.isNoteMode);
        });

        document.getElementById('erase-btn').addEventListener('click', () => {
            this.eraseSelectedCell();
        });

        // Numpad Buttons
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const num = parseInt(e.currentTarget.getAttribute('data-num'));
                this.inputNumber(num);
            });
        });

        // Board Cell Click
        const board = document.getElementById('sudoku-board');
        board.addEventListener('click', (e) => {
            const cell = e.target.closest('.sudoku-cell');
            if (!cell || this.isCleared) return;

            const r = parseInt(cell.getAttribute('data-r'));
            const c = parseInt(cell.getAttribute('data-c'));
            this.selectCell(r, c);
        });

        // Keyboard Controls
        this.keyListener = (e) => {
            if (this.isCleared) return;
            const key = e.key;

            if (key >= '1' && key <= '9') {
                this.inputNumber(parseInt(key));
            } else if (key === 'Backspace' || key === 'Delete') {
                this.eraseSelectedCell();
            } else if (key === 'n' || key === 'N') {
                noteBtn.click();
            } else if (key === 'u' || key === 'U') {
                this.undo();
            } else if (key === 'h' || key === 'H') {
                this.useHint();
            } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
                this.handleArrowKey(key);
            }
        };
        window.addEventListener('keydown', this.keyListener);
    }

    selectCell(r, c) {
        this.selectedCell = { r, c };
        soundManager.playClick();
        this.updateHighlights();
    }

    handleArrowKey(key) {
        if (!this.selectedCell) {
            this.selectCell(0, 0);
            return;
        }

        let { r, c } = this.selectedCell;
        if (key === 'ArrowUp') r = Math.max(0, r - 1);
        if (key === 'ArrowDown') r = Math.min(8, r + 1);
        if (key === 'ArrowLeft') c = Math.max(0, c - 1);
        if (key === 'ArrowRight') c = Math.min(8, c + 1);

        this.selectCell(r, c);
    }

    inputNumber(num) {
        if (!this.selectedCell || this.isCleared) return;
        const { r, c } = this.selectedCell;

        // Cannot change initial puzzle numbers
        if (this.initialGrid[r][c] !== 0) return;

        if (this.isNoteMode) {
            // Toggle candidate note
            const notes = this.notesGrid[r][c];
            if (notes.has(num)) {
                notes.delete(num);
            } else {
                notes.add(num);
            }
            soundManager.playNote();
            this.updateCellDOM(r, c);
        } else {
            // Main number input
            const oldVal = this.currentGrid[r][c];
            if (oldVal === num) return; // Same value

            // Push state to history
            this.history.push({
                r, c,
                oldVal,
                newVal: num,
                oldNotes: new Set(this.notesGrid[r][c])
            });

            this.currentGrid[r][c] = num;
            this.notesGrid[r][c].clear();

            // Check if correct against solution
            if (num !== this.puzzle.solution[r][c]) {
                this.mistakes++;
                soundManager.playError();
                document.getElementById('mistake-display').textContent = this.mistakes;
            } else {
                soundManager.playNumber(num);
                // Clear this number from notes in same row, col, and 3x3 block!
                this.clearNotesInRelated(r, c, num);
            }

            this.updateCellDOM(r, c);
            this.updateHighlights();
            this.checkWinCondition();
        }
    }

    eraseSelectedCell() {
        if (!this.selectedCell || this.isCleared) return;
        const { r, c } = this.selectedCell;

        if (this.initialGrid[r][c] !== 0) return;

        const oldVal = this.currentGrid[r][c];
        const oldNotes = new Set(this.notesGrid[r][c]);

        if (oldVal !== 0 || oldNotes.size > 0) {
            this.history.push({ r, c, oldVal, newVal: 0, oldNotes });
            this.currentGrid[r][c] = 0;
            this.notesGrid[r][c].clear();
            soundManager.playErase();
            this.updateCellDOM(r, c);
            this.updateHighlights();
        }
    }

    undo() {
        if (this.history.length === 0 || this.isCleared) return;
        const lastAction = this.history.pop();
        const { r, c, oldVal, oldNotes } = lastAction;

        this.currentGrid[r][c] = oldVal;
        this.notesGrid[r][c] = new Set(oldNotes);

        soundManager.playClick();
        this.selectCell(r, c);
        this.updateCellDOM(r, c);
        this.updateHighlights();
    }

    useHint() {
        if (this.isCleared) return;

        // Find empty cells
        const emptyCells = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.currentGrid[r][c] !== this.puzzle.solution[r][c]) {
                    emptyCells.push({ r, c });
                }
            }
        }

        if (emptyCells.length === 0) return;

        const target = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const correctNum = this.puzzle.solution[target.r][target.c];

        this.currentGrid[target.r][target.c] = correctNum;
        this.notesGrid[target.r][target.c].clear();

        soundManager.playHint();
        this.clearNotesInRelated(target.r, target.c, correctNum);
        this.selectCell(target.r, target.c);
        this.updateCellDOM(target.r, target.c);
        this.updateHighlights();
        this.checkWinCondition();
    }

    clearNotesInRelated(row, col, num) {
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;

        for (let i = 0; i < 9; i++) {
            this.notesGrid[row][i].delete(num);
            this.updateCellDOM(row, i);

            this.notesGrid[i][col].delete(num);
            this.updateCellDOM(i, col);
        }

        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                this.notesGrid[r][c].delete(num);
                this.updateCellDOM(r, c);
            }
        }
    }

    updateCellDOM(r, c) {
        const el = document.getElementById(`cell-${r}-${c}`);
        if (!el) return;

        el.innerHTML = this.getCellInnerContent(r, c);

        // Check if value is incorrect
        const val = this.currentGrid[r][c];
        if (val !== 0 && val !== this.puzzle.solution[r][c]) {
            el.classList.add('error-val');
        } else {
            el.classList.remove('error-val');
        }
    }

    updateHighlights() {
        // Clear all highlight classes
        document.querySelectorAll('.sudoku-cell').forEach(el => {
            el.classList.remove('selected', 'related', 'same-number');
        });

        if (!this.selectedCell) return;
        const { r, c } = this.selectedCell;
        const selectedVal = this.currentGrid[r][c];

        // 1. Highlight selected cell
        const selectedEl = document.getElementById(`cell-${r}-${c}`);
        if (selectedEl) selectedEl.classList.add('selected');

        // 2. Highlight related row, col, and 3x3 box
        const startRow = Math.floor(r / 3) * 3;
        const startCol = Math.floor(c / 3) * 3;

        for (let i = 0; i < 9; i++) {
            const rowCell = document.getElementById(`cell-${r}-${i}`);
            const colCell = document.getElementById(`cell-${i}-${c}`);
            if (rowCell) rowCell.classList.add('related');
            if (colCell) colCell.classList.add('related');
        }

        for (let br = startRow; br < startRow + 3; br++) {
            for (let bc = startCol; bc < startCol + 3; bc++) {
                const boxCell = document.getElementById(`cell-${br}-${bc}`);
                if (boxCell) boxCell.classList.add('related');
            }
        }

        // 3. Highlight matching numbers across the board
        if (selectedVal !== 0) {
            for (let tr = 0; tr < 9; tr++) {
                for (let tc = 0; tc < 9; tc++) {
                    if (this.currentGrid[tr][tc] === selectedVal) {
                        const cell = document.getElementById(`cell-${tr}-${tc}`);
                        if (cell) cell.classList.add('same-number');
                    }
                }
            }
        }
    }

    checkWinCondition() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.currentGrid[r][c] !== this.puzzle.solution[r][c]) {
                    return false;
                }
            }
        }

        this.handleWin();
        return true;
    }

    handleWin() {
        if (this.isCleared) return;
        this.isCleared = true;
        this.stopTimer();

        soundManager.playWin();

        // Save Record
        const stars = this.calculateStars();
        this.saveRecord(this.puzzle.id, this.timer, stars);

        setTimeout(() => {
            sceneManager.switchScene('Result', {
                puzzle: this.puzzle,
                difficulty: this.difficulty,
                time: this.timer,
                mistakes: this.mistakes,
                stars: stars
            });
        }, 1200);
    }

    calculateStars() {
        if (this.mistakes === 0) return 3;
        if (this.mistakes <= 3) return 2;
        return 1;
    }

    saveRecord(id, time, stars) {
        try {
            const recs = JSON.parse(localStorage.getItem('mini_sudoku_records') || '{}');
            if (!recs[id] || recs[id].time > time) {
                recs[id] = { time, stars };
                localStorage.setItem('mini_sudoku_records', JSON.stringify(recs));
            }
        } catch (e) {
            console.error('Failed to save record', e);
        }
    }

    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            this.timer++;
            const minutes = Math.floor(this.timer / 60);
            const seconds = this.timer % 60;
            const timerEl = document.getElementById('timer-display');
            if (timerEl) {
                timerEl.textContent = `${('0' + minutes).slice(-2)}:${('0' + seconds).slice(-2)}`;
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    async exit() {
        this.stopTimer();
        if (this.keyListener) window.removeEventListener('keydown', this.keyListener);
    }

    update(deltaTime) {}
}
