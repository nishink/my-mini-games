import { sceneManager } from '../Core/SceneManager.js';
import { soundManager } from '../Core/SoundManager.js';
import { calculateHints } from '../Data/Puzzles.js';

export class GameScene {
    constructor() {
        this.puzzle = null;
        this.category = '5x5';
        this.grid = [];
        this.currentTool = 1; // 1: Fill (塗る), 2: Cross (バツ)
        this.isMouseDown = false;
        this.dragMode = null; // 'fill', 'unfill', 'x', 'unx'
        this.timer = 0;
        this.timerInterval = null;
        this.mistakes = 0;
        this.isCleared = false;
    }

    async enter(data = {}) {
        this.puzzle = data.puzzle;
        this.category = data.category || '5x5';
        this.size = this.puzzle.solution.length;

        const { rowHints, colHints } = calculateHints(this.puzzle.solution);
        this.rowHints = rowHints;
        this.colHints = colHints;

        // Initialize grid (0: empty, 1: fill, 2: cross)
        this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(0));
        
        this.currentTool = 1;
        this.timer = 0;
        this.mistakes = 0;
        this.isCleared = false;

        this.renderLayout();
        this.startTimer();
        this.setupEventListeners();
    }

    renderLayout() {
        const container = document.getElementById('scene-container');
        const sizeClass = `grid-size-${this.size}`;

        container.innerHTML = `
            <div class="game-scene">
                <header class="game-header">
                    <button id="stage-back-btn" class="btn btn-secondary btn-sm">
                        ⬅️ ステージ選択
                    </button>

                    <div class="game-status">
                        <span class="status-item">⏱️ <span id="timer-display">00:00</span></span>
                        <span class="status-item">⚠️ ミス: <span id="mistake-display">0</span></span>
                    </div>

                    <div class="header-actions">
                        <button id="hint-btn" class="btn btn-gold btn-sm" title="ヒントを使う [H]">
                            💡 ヒント
                        </button>
                        <button id="reset-btn" class="btn btn-danger btn-sm" title="盤面をリセット [R]">
                            🔄 リセット
                        </button>
                    </div>
                </header>

                <div class="puzzle-title-bar">
                    <h3>${this.puzzle.title} (${this.size}×${this.size})</h3>
                </div>

                <!-- ツール切り替えバー -->
                <div class="tool-bar">
                    <button id="tool-fill-btn" class="tool-btn active" data-tool="1">
                        <span class="tool-icon">🟦</span>
                        <span class="tool-label">塗る [F]</span>
                    </button>
                    <button id="tool-x-btn" class="tool-btn" data-tool="2">
                        <span class="tool-icon">❌</span>
                        <span class="tool-label">バツ [X]</span>
                    </button>
                </div>

                <!-- ピクロス盤面コンテナ -->
                <div class="board-wrapper">
                    <div class="nonogram-board ${sizeClass}" id="nonogram-board">
                        <!-- Top-Left empty cell -->
                        <div class="corner-cell"></div>

                        <!-- Column Hints (Top) -->
                        <div class="col-hints-container" id="col-hints">
                            ${this.colHints.map((hints, colIdx) => `
                                <div class="col-hint-column" data-col="${colIdx}">
                                    ${hints.map(h => `<span class="hint-num">${h}</span>`).join('')}
                                </div>
                            `).join('')}
                        </div>

                        <!-- Row Hints (Left) -->
                        <div class="row-hints-container" id="row-hints">
                            ${this.rowHints.map((hints, rowIdx) => `
                                <div class="row-hint-row" data-row="${rowIdx}">
                                    ${hints.map(h => `<span class="hint-num">${h}</span>`).join('<span class="hint-comma">,</span>')}
                                </div>
                            `).join('')}
                        </div>

                        <!-- Grid Cells -->
                        <div class="grid-cells-container" id="grid-cells" style="grid-template-columns: repeat(${this.size}, 1fr);">
                            ${this.renderCellsHTML()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderCellsHTML() {
        let html = '';
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const isBorderRight = (c + 1) % 5 === 0 && c < this.size - 1;
                const isBorderBottom = (r + 1) % 5 === 0 && r < this.size - 1;

                let cellClass = 'grid-cell';
                if (isBorderRight) cellClass += ' border-right';
                if (isBorderBottom) cellClass += ' border-bottom';

                html += `<div class="${cellClass}" data-r="${r}" data-c="${c}" id="cell-${r}-${c}"></div>`;
            }
        }
        return html;
    }

    setupEventListeners() {
        // Navigation & Actions
        document.getElementById('stage-back-btn').addEventListener('click', () => {
            soundManager.playCancel();
            sceneManager.switchScene('StageSelect', { category: this.category });
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            soundManager.playClick();
            if (confirm('盤面をリセットしますか？')) {
                this.resetGrid();
            }
        });

        document.getElementById('hint-btn').addEventListener('click', () => {
            this.useHint();
        });

        // Tool Buttons
        const fillBtn = document.getElementById('tool-fill-btn');
        const xBtn = document.getElementById('tool-x-btn');

        fillBtn.addEventListener('click', () => this.setTool(1));
        xBtn.addEventListener('click', () => this.setTool(2));

        // Keyboard Shortcuts
        this.keyListener = (e) => {
            if (this.isCleared) return;
            const key = e.key.toLowerCase();
            if (key === 'f' || key === '1') {
                this.setTool(1);
            } else if (key === 'x' || key === '2' || key === ' ') {
                this.setTool(2);
            } else if (key === 'h') {
                this.useHint();
            } else if (key === 'r') {
                if (confirm('盤面をリセットしますか？')) this.resetGrid();
            }
        };
        window.addEventListener('keydown', this.keyListener);

        // Grid Interaction
        const gridCells = document.getElementById('grid-cells');

        // Prevent Context Menu on Right Click
        gridCells.addEventListener('contextmenu', (e) => e.preventDefault());

        gridCells.addEventListener('mousedown', (e) => {
            const cell = e.target.closest('.grid-cell');
            if (!cell || this.isCleared) return;

            this.isMouseDown = true;
            const r = parseInt(cell.getAttribute('data-r'));
            const c = parseInt(cell.getAttribute('data-c'));
            const isRightClick = (e.button === 2);

            this.handleCellAction(r, c, isRightClick, true);
        });

        gridCells.addEventListener('mouseover', (e) => {
            const cell = e.target.closest('.grid-cell');
            if (!cell) return;

            const r = parseInt(cell.getAttribute('data-r'));
            const c = parseInt(cell.getAttribute('data-c'));

            this.highlightRowCol(r, c);

            if (this.isMouseDown && !this.isCleared) {
                this.applyDragAction(r, c);
            }
        });

        gridCells.addEventListener('mouseleave', () => {
            this.clearHighlights();
        });

        this.mouseUpListener = () => {
            this.isMouseDown = false;
            this.dragMode = null;
        };
        window.addEventListener('mouseup', this.mouseUpListener);

        // Touch event support for mobile
        this.setupTouchEvents(gridCells);
    }

    setupTouchEvents(gridCells) {
        gridCells.addEventListener('touchstart', (e) => {
            if (this.isCleared) return;
            this.isMouseDown = true;
            const touch = e.touches[0];
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            const cell = target ? target.closest('.grid-cell') : null;
            if (cell) {
                const r = parseInt(cell.getAttribute('data-r'));
                const c = parseInt(cell.getAttribute('data-c'));
                this.handleCellAction(r, c, false, true);
            }
        }, { passive: true });

        gridCells.addEventListener('touchmove', (e) => {
            if (!this.isMouseDown || this.isCleared) return;
            const touch = e.touches[0];
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            const cell = target ? target.closest('.grid-cell') : null;
            if (cell) {
                const r = parseInt(cell.getAttribute('data-r'));
                const c = parseInt(cell.getAttribute('data-c'));
                this.applyDragAction(r, c);
            }
        }, { passive: true });

        gridCells.addEventListener('touchend', () => {
            this.isMouseDown = false;
            this.dragMode = null;
        });
    }

    setTool(tool) {
        this.currentTool = tool;
        soundManager.playClick();

        const fillBtn = document.getElementById('tool-fill-btn');
        const xBtn = document.getElementById('tool-x-btn');

        if (tool === 1) {
            fillBtn.classList.add('active');
            xBtn.classList.remove('active');
        } else {
            fillBtn.classList.remove('active');
            xBtn.classList.add('active');
        }
    }

    handleCellAction(r, c, isRightClick = false, isFirstClick = false) {
        const currentState = this.grid[r][c];
        const effectiveTool = isRightClick ? (this.currentTool === 2 ? 1 : 2) : this.currentTool;

        if (effectiveTool === 1) {
            // Fill tool
            if (currentState === 1) {
                this.grid[r][c] = 0;
                this.dragMode = 'unfill';
                soundManager.playUnfill();
            } else {
                this.grid[r][c] = 1;
                this.dragMode = 'fill';
                soundManager.playFill();
            }
        } else {
            // Cross tool
            if (currentState === 2) {
                this.grid[r][c] = 0;
                this.dragMode = 'unx';
                soundManager.playUnfill();
            } else {
                this.grid[r][c] = 2;
                this.dragMode = 'x';
                soundManager.playCross();
            }
        }

        this.updateCellDOM(r, c);
        this.checkHintsMatch();
        this.checkWinCondition();
    }

    applyDragAction(r, c) {
        if (!this.dragMode) return;

        let newState = this.grid[r][c];
        if (this.dragMode === 'fill' && this.grid[r][c] !== 1) {
            newState = 1;
        } else if (this.dragMode === 'unfill' && this.grid[r][c] === 1) {
            newState = 0;
        } else if (this.dragMode === 'x' && this.grid[r][c] !== 2) {
            newState = 2;
        } else if (this.dragMode === 'unx' && this.grid[r][c] === 2) {
            newState = 0;
        }

        if (newState !== this.grid[r][c]) {
            this.grid[r][c] = newState;
            this.updateCellDOM(r, c);
            this.checkHintsMatch();
            this.checkWinCondition();
        }
    }

    updateCellDOM(r, c) {
        const el = document.getElementById(`cell-${r}-${c}`);
        if (!el) return;

        el.className = 'grid-cell';
        if ((c + 1) % 5 === 0 && c < this.size - 1) el.classList.add('border-right');
        if ((r + 1) % 5 === 0 && r < this.size - 1) el.classList.add('border-bottom');

        const state = this.grid[r][c];
        if (state === 1) {
            el.classList.add('filled');
            el.innerHTML = '';
        } else if (state === 2) {
            el.classList.add('crossed');
            el.innerHTML = '<span class="cross-mark">❌</span>';
        } else {
            el.innerHTML = '';
        }
    }

    highlightRowCol(r, c) {
        this.clearHighlights();
        const rowHint = document.querySelector(`.row-hint-row[data-row="${r}"]`);
        const colHint = document.querySelector(`.col-hint-column[data-col="${c}"]`);

        if (rowHint) rowHint.classList.add('highlight-hint');
        if (colHint) colHint.classList.add('highlight-hint');
    }

    clearHighlights() {
        document.querySelectorAll('.highlight-hint').forEach(el => el.classList.remove('highlight-hint'));
    }

    checkHintsMatch() {
        // Check Rows
        for (let r = 0; r < this.size; r++) {
            const filledPattern = [];
            let count = 0;
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 1) {
                    count++;
                } else if (count > 0) {
                    filledPattern.push(count);
                    count = 0;
                }
            }
            if (count > 0) filledPattern.push(count);
            if (filledPattern.length === 0) filledPattern.push(0);

            const rowHintEl = document.querySelector(`.row-hint-row[data-row="${r}"]`);
            const targetPattern = this.rowHints[r];
            const isMatch = JSON.stringify(filledPattern) === JSON.stringify(targetPattern);

            if (rowHintEl) {
                if (isMatch) {
                    rowHintEl.classList.add('completed');
                } else {
                    rowHintEl.classList.remove('completed');
                }
            }
        }

        // Check Columns
        for (let c = 0; c < this.size; c++) {
            const filledPattern = [];
            let count = 0;
            for (let r = 0; r < this.size; r++) {
                if (this.grid[r][c] === 1) {
                    count++;
                } else if (count > 0) {
                    filledPattern.push(count);
                    count = 0;
                }
            }
            if (count > 0) filledPattern.push(count);
            if (filledPattern.length === 0) filledPattern.push(0);

            const colHintEl = document.querySelector(`.col-hint-column[data-col="${c}"]`);
            const targetPattern = this.colHints[c];
            const isMatch = JSON.stringify(filledPattern) === JSON.stringify(targetPattern);

            if (colHintEl) {
                if (isMatch) {
                    colHintEl.classList.add('completed');
                } else {
                    colHintEl.classList.remove('completed');
                }
            }
        }
    }

    useHint() {
        if (this.isCleared) return;

        // Find all cells that should be filled but aren't
        const unfulfilled = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.puzzle.solution[r][c] === 1 && this.grid[r][c] !== 1) {
                    unfulfilled.push({ r, c });
                }
            }
        }

        if (unfulfilled.length === 0) {
            alert('塗るべきマスは全て塗りつぶされています！余分なマスが無いか確認してください。');
            return;
        }

        // Pick random unfulfilled cell
        const target = unfulfilled[Math.floor(Math.random() * unfulfilled.length)];
        this.grid[target.r][target.c] = 1;
        this.updateCellDOM(target.r, target.c);
        soundManager.playHint();
        this.checkHintsMatch();
        this.checkWinCondition();
    }

    resetGrid() {
        this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(0));
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                this.updateCellDOM(r, c);
            }
        }
        this.checkHintsMatch();
    }

    checkWinCondition() {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const solutionState = this.puzzle.solution[r][c];
                const playerState = this.grid[r][c] === 1 ? 1 : 0;
                if (solutionState !== playerState) {
                    return false;
                }
            }
        }

        // WIN!
        this.handleWin();
        return true;
    }

    handleWin() {
        if (this.isCleared) return;
        this.isCleared = true;
        this.stopTimer();

        soundManager.playWin();

        // Color animation on grid
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const cell = document.getElementById(`cell-${r}-${c}`);
                if (cell && this.puzzle.solution[r][c] === 1) {
                    cell.style.backgroundColor = this.puzzle.color || '#3b82f6';
                    cell.style.borderColor = 'rgba(255,255,255,0.4)';
                    cell.classList.add('win-animate');
                }
            }
        }

        // Save Records
        const stars = this.calculateStars();
        this.saveRecord(this.puzzle.id, this.timer, stars);

        setTimeout(() => {
            sceneManager.switchScene('Result', {
                puzzle: this.puzzle,
                category: this.category,
                time: this.timer,
                mistakes: this.mistakes,
                stars: stars
            });
        }, 1200);
    }

    calculateStars() {
        const parTime = this.size === 5 ? 60 : (this.size === 10 ? 180 : 360);
        if (this.timer <= parTime && this.mistakes === 0) return 3;
        if (this.timer <= parTime * 2) return 2;
        return 1;
    }

    saveRecord(id, time, stars) {
        try {
            const recs = JSON.parse(localStorage.getItem('mini_logic_records') || '{}');
            if (!recs[id] || recs[id].time > time) {
                recs[id] = { time, stars };
                localStorage.setItem('mini_logic_records', JSON.stringify(recs));
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
        if (this.mouseUpListener) window.removeEventListener('mouseup', this.mouseUpListener);
    }

    update(deltaTime) {}
}
